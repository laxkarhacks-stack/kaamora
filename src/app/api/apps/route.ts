import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeHtml } from "@/lib/analyzer/html-analyzer";
import { slugify } from "@/lib/utils";
import { writeAudit } from "@/lib/admin/audit";
import { syncAppHtml, isGitHubConfigured } from "@/lib/github/sync";

const CreateSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(80).optional(),
  description: z.string().max(2000).optional(),
  category: z.string().max(80).optional(),
  html: z.string().min(10).max(5_000_000),
  publish: z.boolean().optional(),
  actions: z
    .array(
      z.object({
        action_name: z.string(),
        billable: z.boolean(),
        cost: z.number().int().min(0).max(1000),
      })
    )
    .optional(),
});

/** GET published apps for library */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const category = request.nextUrl.searchParams.get("category") || "";
  const supabase = createServiceClient();

  let query = supabase
    .from("apps")
    .select("id, name, slug, description, category, icon, status, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(100);

  if (category) query = query.eq("category", category);
  if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ apps: data ?? [] });
}

/** POST create app (admin) */
export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await createClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: enforce admin role via profiles/roles table
    const body = await request.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, category, html, publish, actions } = parsed.data;
    const slug = (parsed.data.slug || slugify(name)).slice(0, 80);

    const analysis = analyzeHtml(html);
    if (!analysis.valid) {
      return NextResponse.json(
        { error: "HTML validation failed", analysis },
        { status: 400 }
      );
    }

    const service = createServiceClient();
    const status = publish ? "published" : "draft";

    if (publish && isGitHubConfigured()) {
      const gh = await syncAppHtml(slug, html);
      if (!gh.ok) {
        return NextResponse.json(
          {
            error: "GitHub sync failed — app not published",
            github: gh,
          },
          { status: 502 }
        );
      }
    }

    const { data: app, error } = await service
      .from("apps")
      .insert({
        name,
        slug,
        description: description ?? null,
        category: category ?? null,
        html_source: html,
        status,
        metadata: {
          analysis: {
            overallConfidence: analysis.overallConfidence,
            modules: analysis.modules,
            actions: analysis.actions,
            warnings: analysis.warnings,
          },
        },
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Seed actions (admin-confirmed)
    if (actions?.length) {
      await service.from("actions").insert(
        actions.map((a) => ({
          app_id: app.id,
          action_name: a.action_name,
          billable: a.billable,
          cost: a.cost,
          status: "active",
        }))
      );
    } else if (analysis.actions.length) {
      // Detected but NOT auto-billable unless suggested and cost 0 until admin confirms
      await service.from("actions").insert(
        analysis.actions.map((a) => ({
          app_id: app.id,
          action_name: a.name,
          billable: false,
          cost: 0,
          status: "active",
        }))
      );
    }

    await writeAudit({
      adminId: user.id,
      action: "app.create",
      newValue: JSON.stringify({ id: app.id, slug, status }),
    });

    return NextResponse.json({ app, analysis }, { status: 201 });
  } catch (err) {
    console.error("[apps POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

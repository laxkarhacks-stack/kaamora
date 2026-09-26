import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/admin/audit";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const service = createServiceClient();
  const { data, error } = await service
    .from("apps")
    .select("id, name, slug, status, category, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ apps: data ?? [] });
}

const PatchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "published", "disabled", "archived"]),
});

export async function PATCH(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const service = createServiceClient();
  const { data: old } = await service
    .from("apps")
    .select("status")
    .eq("id", parsed.data.id)
    .maybeSingle();

  const { data, error } = await service
    .from("apps")
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await writeAudit({
      adminId: user.id,
      action: "app.status",
      oldValue: old?.status ?? null,
      newValue: parsed.data.status,
    });
  } catch {
    /* non-fatal */
  }

  return NextResponse.json({ app: data });
}

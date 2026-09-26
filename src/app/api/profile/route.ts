import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const PatchSchema = z.object({
  name: z.string().max(120).optional(),
  mobile: z.string().max(20).optional(),
  city: z.string().max(80).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const service = createServiceClient();
    const { data, error } = await service
      .from("profiles")
      .update({
        ...parsed.data,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ profile: data });
  } catch (err) {
    console.error("[profile]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

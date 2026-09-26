import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceClient();
    const { data, error } = await service
      .from("usage_events")
      .select("id, action, credits, result, created_at, app_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ events: data ?? [] });
  } catch (err) {
    console.error("[usage/me]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

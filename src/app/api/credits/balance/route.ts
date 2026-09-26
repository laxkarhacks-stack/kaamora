import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getBalance } from "@/lib/engine/credits";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ balance: null, profile: null });
    }

    const balance = await getBalance(user.id);
    const service = createServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select("id, name, email, mobile, city, status")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({ balance, profile });
  } catch (err) {
    console.error("[balance]", err);
    return NextResponse.json({ balance: null, profile: null });
  }
}

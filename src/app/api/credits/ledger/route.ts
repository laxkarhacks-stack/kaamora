import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLedger } from "@/lib/engine/credits";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const entries = await getLedger(user.id, 50);
    return NextResponse.json({ ledger: entries });
  } catch (err) {
    console.error("[ledger]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

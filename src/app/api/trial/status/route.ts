import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTrialStatus } from "@/lib/engine/trial";

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      /* anonymous */
    }
    const sessionId = request.headers.get("x-session-id");
    const status = await getTrialStatus({ userId, sessionId });
    return NextResponse.json(status);
  } catch (err) {
    console.error("[trial/status]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

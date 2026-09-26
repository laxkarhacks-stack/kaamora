import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { emitEvent } from "@/lib/engine/events";

const Schema = z.object({
  appSlug: z.string().min(1).max(120),
  actionName: z.string().min(1).max(120),
  requestId: z.string().min(1).max(80),
  result: z.enum(["success", "failed", "cancelled"]),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Report action outcome after browser processing.
 * Does not refund automatically here — policy can be extended.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      /* optional */
    }

    const type =
      parsed.data.result === "success" ? "action_success" : "action_failed";

    await emitEvent({
      type,
      userId,
      sessionId: request.headers.get("x-session-id"),
      action: parsed.data.actionName,
      result: parsed.data.result,
      metadata: {
        appSlug: parsed.data.appSlug,
        requestId: parsed.data.requestId,
        ...(parsed.data.metadata || {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[action/result]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

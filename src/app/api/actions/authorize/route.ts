import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAction } from "@/lib/engine/actions";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, clientKeyFromHeaders } from "@/lib/security/rate-limit";
import { emitEvent } from "@/lib/engine/events";

const BodySchema = z.object({
  appSlug: z.string().min(1).max(120),
  actionName: z.string().min(1).max(120),
  clientRequestId: z.string().uuid().optional(),
  sessionId: z.string().min(8).max(128).optional(),
});

/**
 * POST /api/actions/authorize
 * Server-authoritative gate: cost, trial, credits, idempotency.
 */
export async function POST(request: NextRequest) {
  const ipKey = clientKeyFromHeaders(request.headers);
  const rl = rateLimit(`action:${ipKey}`, 60, 60_000);
  if (!rl.allowed) {
    void emitEvent({
      type: "rate_limit",
      sessionId: request.headers.get("x-session-id"),
      action: "authorize",
      metadata: { key: ipKey },
    });
    return NextResponse.json(
      { allowed: false, reason: "Rate limited", request_id: "rate_limit" },
      { status: 429 }
    );
  }

  try {
    const json = await request.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { appSlug, actionName, clientRequestId, sessionId } = parsed.data;

    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      /* anonymous trial path */
    }

    const sid = sessionId ?? request.headers.get("x-session-id");

    const result = await authorizeAction({
      userId,
      sessionId: sid,
      appSlug,
      actionName,
      clientRequestId,
    });

    if (result.allowed) {
      void emitEvent({
        type: result.trial ? "trial_use" : "action_started",
        userId,
        sessionId: sid,
        action: actionName,
        credits: result.cost,
        metadata: { appSlug, request_id: result.request_id },
      });
    }

    return NextResponse.json(result, {
      status: result.allowed ? 200 : 402,
    });
  } catch (err) {
    console.error("[authorize]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAction } from "@/lib/engine/actions";
import { createClient } from "@/lib/supabase/server";

const BodySchema = z.object({
  appSlug: z.string().min(1).max(120),
  actionName: z.string().min(1).max(120),
  clientRequestId: z.string().uuid().optional(),
  sessionId: z.string().min(8).max(128).optional(),
});

/**
 * POST /api/actions/authorize
 * Server-authoritative action gate.
 * Apps never decide cost; backend does.
 */
export async function POST(request: NextRequest) {
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
      // Unauthenticated is allowed (trial path)
    }

    const result = await authorizeAction({
      userId,
      sessionId: sessionId ?? request.headers.get("x-session-id"),
      appSlug,
      actionName,
      clientRequestId,
    });

    return NextResponse.json(result, {
      status: result.allowed ? 200 : 402,
    });
  } catch (err) {
    console.error("[authorize]", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}

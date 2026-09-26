/**
 * Centralized event system.
 * One event feeds: usage history, analytics, Telegram (async), reports.
 */

import { createServiceClient } from "@/lib/supabase/server";
import type { PlatformEvent } from "@/types";

export interface EmitEventParams {
  type: PlatformEvent;
  userId?: string | null;
  sessionId?: string | null;
  appId?: string | null;
  action?: string | null;
  result?: "success" | "failed" | "cancelled" | null;
  credits?: number;
  metadata?: Record<string, unknown>;
}

export async function emitEvent(params: EmitEventParams): Promise<void> {
  const supabase = createServiceClient();

  // Primary: durable usage_events row
  try {
    await supabase.from("usage_events").insert({
      user_id: params.userId ?? null,
      session_id: params.sessionId ?? null,
      app_id: params.appId ?? null,
      action: params.action ?? params.type,
      result: params.result ?? null,
      credits: params.credits ?? 0,
      metadata: {
        event_type: params.type,
        ...(params.metadata ?? {}),
      },
    });
  } catch (err) {
    console.error("[events] failed to persist", err);
    // Do not throw — analytics must not break primary flows
  }

  // Telegram mirror is async and non-blocking (Phase 7)
  // void queueTelegram(params).catch(() => {});
}

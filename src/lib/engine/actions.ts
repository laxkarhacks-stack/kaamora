/**
 * Action Engine — central gate for all paid actions.
 *
 * Apps call: await Kaamora.run("generate", async () => { ... })
 * Backend is source of truth for cost, trial, and authorization.
 * Client cannot change price.
 */

import { createServiceClient } from "@/lib/supabase/server";
import {
  deductCredits,
  InsufficientCreditsError,
  type DeductResult,
} from "./credits";
import type { ActionAuthResult } from "@/types";
import { DEFAULTS } from "@/lib/config";
import { randomUUID } from "crypto";

export interface AuthorizeActionParams {
  userId: string | null;
  sessionId: string | null;
  appSlug: string;
  actionName: string;
  /** Client-provided idempotency key for this specific attempt */
  clientRequestId?: string;
}

export interface AuthorizeActionResult extends ActionAuthResult {
  deduct?: DeductResult;
}

/**
 * Authorize a billable action.
 * - Resolves app + action config
 * - Checks trial eligibility if anonymous / first-use
 * - Deducts credits if required (atomic + idempotent)
 * - Records usage event
 *
 * Policy (documented):
 * Authorization happens BEFORE heavy processing.
 * If processing fails after deduction, a controlled refund
 * can be issued by the action result path (Phase 2+).
 */
export async function authorizeAction(
  params: AuthorizeActionParams
): Promise<AuthorizeActionResult> {
  const { userId, sessionId, appSlug, actionName, clientRequestId } = params;
  const requestId = clientRequestId || randomUUID();
  const supabase = createServiceClient();

  // Resolve app
  const { data: app, error: appErr } = await supabase
    .from("apps")
    .select("id, status, slug")
    .eq("slug", appSlug)
    .eq("status", "published")
    .maybeSingle();

  if (appErr || !app) {
    return {
      allowed: false,
      cost: 0,
      trial: false,
      reason: "App not found or not published",
      request_id: requestId,
    };
  }

  // Resolve action config
  const { data: action, error: actErr } = await supabase
    .from("actions")
    .select("*")
    .eq("app_id", app.id)
    .eq("action_name", actionName)
    .eq("status", "active")
    .maybeSingle();

  if (actErr || !action) {
    // Unknown action → free (not configured as billable)
    return {
      allowed: true,
      cost: 0,
      trial: false,
      request_id: requestId,
    };
  }

  if (!action.billable || action.cost <= 0) {
    await recordUsage({
      userId,
      sessionId,
      appId: app.id,
      action: actionName,
      credits: 0,
      result: null,
    });
    return {
      allowed: true,
      cost: 0,
      trial: false,
      request_id: requestId,
    };
  }

  // Billable path
  if (!userId) {
    // Anonymous trial
    const trialOk = await tryConsumeTrial(sessionId);
    if (trialOk) {
      await recordUsage({
        userId: null,
        sessionId,
        appId: app.id,
        action: actionName,
        credits: 0,
        result: null,
        metadata: { trial: true },
      });
      return {
        allowed: true,
        cost: 0,
        trial: true,
        request_id: requestId,
      };
    }
    return {
      allowed: false,
      cost: action.cost,
      trial: false,
      reason: "Trial exhausted. Log in or create an account.",
      request_id: requestId,
    };
  }

  // Authenticated: deduct credits
  try {
    const deduct = await deductCredits({
      userId,
      amount: action.cost,
      transactionId: requestId,
      appId: app.id,
      action: actionName,
      type: "debit",
    });

    await recordUsage({
      userId,
      sessionId,
      appId: app.id,
      action: actionName,
      credits: action.cost,
      result: null,
    });

    return {
      allowed: true,
      cost: action.cost,
      trial: false,
      balance_after: deduct.balanceAfter,
      request_id: requestId,
      deduct,
    };
  } catch (e) {
    if (e instanceof InsufficientCreditsError) {
      return {
        allowed: false,
        cost: action.cost,
        trial: false,
        reason: "Insufficient credits",
        request_id: requestId,
      };
    }
    throw e;
  }
}

async function tryConsumeTrial(sessionId: string | null): Promise<boolean> {
  if (!sessionId) return false;
  const supabase = createServiceClient();
  const allowance = DEFAULTS.anonymousTrialAllowance;

  const { data: trial } = await supabase
    .from("trials")
    .select("*")
    .eq("visitor_key", sessionId)
    .maybeSingle();

  if (!trial) {
    const { error } = await supabase.from("trials").insert({
      visitor_key: sessionId,
      usage_count: 1,
      allowance,
    });
    return !error;
  }

  if (trial.usage_count >= trial.allowance) return false;

  const { error } = await supabase
    .from("trials")
    .update({
      usage_count: trial.usage_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", trial.id)
    .eq("usage_count", trial.usage_count); // optimistic

  return !error;
}

async function recordUsage(params: {
  userId: string | null;
  sessionId: string | null;
  appId: string;
  action: string;
  credits: number;
  result: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createServiceClient();
  await supabase.from("usage_events").insert({
    user_id: params.userId,
    session_id: params.sessionId,
    app_id: params.appId,
    action: params.action,
    credits: params.credits,
    result: params.result,
    metadata: params.metadata ?? {},
  });
}

/**
 * Trial Engine
 * Opening app is FREE. First qualifying anonymous action may consume trial.
 */
import { createServiceClient } from "@/lib/supabase/server";
import { DEFAULTS } from "@/lib/config";

export async function getTrialStatus(params: {
  userId?: string | null;
  sessionId?: string | null;
}): Promise<{
  remaining: number;
  allowance: number;
  exhausted: boolean;
}> {
  const supabase = createServiceClient();
  const allowance = DEFAULTS.anonymousTrialAllowance;

  if (params.userId) {
    const { data } = await supabase
      .from("trials")
      .select("*")
      .eq("user_id", params.userId)
      .maybeSingle();
    if (!data) {
      return { remaining: allowance, allowance, exhausted: false };
    }
    const remaining = Math.max(0, data.allowance - data.usage_count);
    return {
      remaining,
      allowance: data.allowance,
      exhausted: remaining <= 0,
    };
  }

  if (!params.sessionId) {
    return { remaining: allowance, allowance, exhausted: false };
  }

  const { data } = await supabase
    .from("trials")
    .select("*")
    .eq("visitor_key", params.sessionId)
    .maybeSingle();

  if (!data) {
    return { remaining: allowance, allowance, exhausted: false };
  }

  const remaining = Math.max(0, data.allowance - data.usage_count);
  return {
    remaining,
    allowance: data.allowance,
    exhausted: remaining <= 0,
  };
}

/** Consume one trial unit. Returns true if consumed. */
export async function consumeTrial(params: {
  userId?: string | null;
  sessionId?: string | null;
}): Promise<boolean> {
  const supabase = createServiceClient();
  const allowance = DEFAULTS.anonymousTrialAllowance;

  if (params.userId) {
    const { data: existing } = await supabase
      .from("trials")
      .select("*")
      .eq("user_id", params.userId)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from("trials").insert({
        user_id: params.userId,
        usage_count: 1,
        allowance,
      });
      return !error;
    }
    if (existing.usage_count >= existing.allowance) return false;
    const { error } = await supabase
      .from("trials")
      .update({
        usage_count: existing.usage_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("usage_count", existing.usage_count);
    return !error;
  }

  if (!params.sessionId) return false;

  const { data: existing } = await supabase
    .from("trials")
    .select("*")
    .eq("visitor_key", params.sessionId)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("trials").insert({
      visitor_key: params.sessionId,
      usage_count: 1,
      allowance,
    });
    return !error;
  }
  if (existing.usage_count >= existing.allowance) return false;
  const { error } = await supabase
    .from("trials")
    .update({
      usage_count: existing.usage_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .eq("usage_count", existing.usage_count);
  return !error;
}

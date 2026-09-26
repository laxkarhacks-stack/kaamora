/**
 * Credit Engine — server-authoritative.
 * Never trust client balance claims.
 * Atomic deductions; no negative balances.
 */

import { createServiceClient } from "@/lib/supabase/server";
import type { CreditLedgerEntry, LedgerType } from "@/types";

export class InsufficientCreditsError extends Error {
  constructor(public balance: number, public required: number) {
    super(`Insufficient credits: have ${balance}, need ${required}`);
    this.name = "InsufficientCreditsError";
  }
}

export class IdempotencyConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IdempotencyConflictError";
  }
}

export interface DeductParams {
  userId: string;
  amount: number;
  transactionId: string;
  appId?: string | null;
  action?: string | null;
  type?: LedgerType;
}

export interface DeductResult {
  success: true;
  balanceBefore: number;
  balanceAfter: number;
  ledgerId: string;
  alreadyProcessed?: boolean;
}

/**
 * Atomically deduct credits if balance is sufficient.
 * Uses transaction_id for idempotency: same key returns prior result.
 *
 * Concurrent requests with balance=1: at most one succeeds.
 */
export async function deductCredits(
  params: DeductParams
): Promise<DeductResult> {
  const {
    userId,
    amount,
    transactionId,
    appId = null,
    action = null,
    type = "debit",
  } = params;

  if (amount <= 0) {
    throw new Error("Deduct amount must be positive");
  }

  const supabase = createServiceClient();

  // Idempotency: if this transaction_id already completed, return prior result
  const { data: existing } = await supabase
    .from("credit_ledger")
    .select("id, balance_before, balance_after, status")
    .eq("transaction_id", transactionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing && existing.status === "completed") {
    return {
      success: true,
      balanceBefore: existing.balance_before,
      balanceAfter: existing.balance_after,
      ledgerId: existing.id,
      alreadyProcessed: true,
    };
  }

  // Atomic deduct via RPC (must be created in DB) or optimistic lock loop
  // Preferred: Postgres function that locks the row
  const { data, error } = await supabase.rpc("deduct_credits_atomic", {
    p_user_id: userId,
    p_amount: amount,
    p_transaction_id: transactionId,
    p_app_id: appId,
    p_action: action,
    p_type: type,
  });

  if (error) {
    // Fallback message mapping
    if (error.message?.includes("insufficient")) {
      const { data: bal } = await supabase
        .from("credits")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();
      throw new InsufficientCreditsError(bal?.balance ?? 0, amount);
    }
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("Credit deduction returned no data");
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (row.error === "insufficient") {
    throw new InsufficientCreditsError(row.balance_before ?? 0, amount);
  }

  return {
    success: true,
    balanceBefore: row.balance_before,
    balanceAfter: row.balance_after,
    ledgerId: row.ledger_id,
  };
}

export async function addCredits(params: {
  userId: string;
  amount: number;
  transactionId: string;
  type?: LedgerType;
  reason?: string;
}): Promise<{ balanceAfter: number }> {
  const { userId, amount, transactionId, type = "credit" } = params;
  if (amount <= 0) throw new Error("Add amount must be positive");

  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("add_credits_atomic", {
    p_user_id: userId,
    p_amount: amount,
    p_transaction_id: transactionId,
    p_type: type,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return { balanceAfter: row.balance_after };
}

export async function getBalance(userId: string): Promise<number> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.balance ?? 0;
}

export async function getLedger(
  userId: string,
  limit = 50
): Promise<CreditLedgerEntry[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("credit_ledger")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as CreditLedgerEntry[];
}

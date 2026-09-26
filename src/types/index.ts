/**
 * Kaamora core types — Phase 1 foundation
 * Extended in later phases as engines are implemented.
 */

export type UUID = string;

export type AppStatus = "draft" | "published" | "disabled" | "archived";
export type UserStatus = "active" | "disabled" | "suspended";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";
export type LedgerType =
  | "debit"
  | "credit"
  | "promo"
  | "refund"
  | "adjustment"
  | "purchase";
export type ActionResult = "success" | "failed" | "cancelled";

export interface Profile {
  id: UUID;
  name: string | null;
  email: string | null;
  mobile: string | null;
  city: string | null;
  status: UserStatus;
  created_at: string;
  last_seen: string | null;
}

export interface App {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  html_source: string | null;
  status: AppStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: UUID;
  name: string;
  category: string;
  description: string | null;
  availability: boolean;
}

export interface AppModule {
  app_id: UUID;
  module_id: UUID;
  detection_confidence: number;
  confirmation_status: "detected" | "confirmed" | "rejected";
}

export interface Action {
  id: UUID;
  app_id: UUID;
  action_name: string;
  billable: boolean;
  cost: number;
  status: "active" | "inactive";
}

export interface CreditBalance {
  user_id: UUID;
  balance: number;
  updated_at: string;
}

export interface CreditLedgerEntry {
  id: UUID;
  transaction_id: string;
  user_id: UUID;
  app_id: UUID | null;
  action: string | null;
  type: LedgerType;
  amount: number;
  balance_before: number;
  balance_after: number;
  status: "completed" | "pending" | "reversed";
  created_at: string;
}

export interface Payment {
  id: UUID;
  order_id: string;
  user_id: UUID;
  amount: number;
  credits: number;
  gateway: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface UsageEvent {
  id: UUID;
  user_id: UUID | null;
  session_id: string | null;
  app_id: UUID | null;
  action: string | null;
  result: ActionResult | null;
  credits: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TrialRecord {
  id: UUID;
  visitor_key: string | null;
  user_id: UUID | null;
  usage_count: number;
  allowance: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: UUID;
  admin_id: UUID;
  action: string;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  created_at: string;
}

/** SDK action authorization response */
export interface ActionAuthResult {
  allowed: boolean;
  cost: number;
  trial: boolean;
  balance_after?: number;
  reason?: string;
  request_id: string;
}

/** Platform event names */
export type PlatformEvent =
  | "page_view"
  | "app_open"
  | "trial_use"
  | "action_started"
  | "action_success"
  | "action_failed"
  | "credit_spent"
  | "login"
  | "signup"
  | "payment"
  | "refund"
  | "abuse"
  | "rate_limit";

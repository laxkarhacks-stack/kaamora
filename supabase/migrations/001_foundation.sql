-- Kaamora Phase 1–2 foundation schema
-- Run against Supabase PostgreSQL after enabling Auth.

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  mobile TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ
);

-- Apps registry
CREATE TABLE IF NOT EXISTS public.apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  icon TEXT,
  html_source TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'disabled', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS apps_status_idx ON public.apps (status);
CREATE INDEX IF NOT EXISTS apps_category_idx ON public.apps (category);
CREATE INDEX IF NOT EXISTS apps_slug_idx ON public.apps (slug);

-- Modules catalog
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  availability BOOLEAN NOT NULL DEFAULT true
);

-- App ↔ modules (detection)
CREATE TABLE IF NOT EXISTS public.app_modules (
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  detection_confidence NUMERIC(5,2) NOT NULL DEFAULT 0,
  confirmation_status TEXT NOT NULL DEFAULT 'detected'
    CHECK (confirmation_status IN ('detected', 'confirmed', 'rejected')),
  PRIMARY KEY (app_id, module_id)
);

-- Actions (billable config)
CREATE TABLE IF NOT EXISTS public.actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  action_name TEXT NOT NULL,
  billable BOOLEAN NOT NULL DEFAULT false,
  cost INTEGER NOT NULL DEFAULT 0 CHECK (cost >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  UNIQUE (app_id, action_name)
);

-- Credit balances
CREATE TABLE IF NOT EXISTS public.credits (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Credit ledger (immutable audit)
CREATE TABLE IF NOT EXISTS public.credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  app_id UUID REFERENCES public.apps(id),
  action TEXT,
  type TEXT NOT NULL CHECK (type IN ('debit', 'credit', 'promo', 'refund', 'adjustment', 'purchase')),
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'reversed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS credit_ledger_tx_unique
  ON public.credit_ledger (transaction_id, user_id);

CREATE INDEX IF NOT EXISTS credit_ledger_user_idx ON public.credit_ledger (user_id, created_at DESC);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(12,2) NOT NULL,
  credits INTEGER NOT NULL,
  gateway TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage / events
CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  session_id TEXT,
  app_id UUID REFERENCES public.apps(id),
  action TEXT,
  result TEXT CHECK (result IS NULL OR result IN ('success', 'failed', 'cancelled')),
  credits INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS usage_events_user_idx ON public.usage_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS usage_events_app_idx ON public.usage_events (app_id, created_at DESC);

-- Trial
CREATE TABLE IF NOT EXISTS public.trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_key TEXT,
  user_id UUID REFERENCES public.profiles(id),
  usage_count INTEGER NOT NULL DEFAULT 0,
  allowance INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS trials_visitor_unique
  ON public.trials (visitor_key) WHERE visitor_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS trials_user_unique
  ON public.trials (user_id) WHERE user_id IS NOT NULL;

-- Admin audit
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_admin_idx ON public.audit_log (admin_id, created_at DESC);

-- Favorites / recently used
CREATE TABLE IF NOT EXISTS public.user_app_activity (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, app_id)
);

-- Idempotency keys for action engine
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idempotency_expires_idx ON public.idempotency_keys (expires_at);

-- RLS helpers (enable in Supabase dashboard / later migrations)
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- etc.

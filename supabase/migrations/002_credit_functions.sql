-- Atomic credit operations for Kaamora Credit Engine
-- Prevents negative balances and supports idempotency.

CREATE OR REPLACE FUNCTION public.deduct_credits_atomic(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_id TEXT,
  p_app_id UUID DEFAULT NULL,
  p_action TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'debit'
)
RETURNS TABLE (
  ledger_id UUID,
  balance_before INTEGER,
  balance_after INTEGER,
  error TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
  v_ledger_id UUID;
  v_existing RECORD;
BEGIN
  -- Idempotency check
  SELECT * INTO v_existing
  FROM public.credit_ledger
  WHERE transaction_id = p_transaction_id AND user_id = p_user_id;

  IF FOUND AND v_existing.status = 'completed' THEN
    ledger_id := v_existing.id;
    balance_before := v_existing.balance_before;
    balance_after := v_existing.balance_after;
    error := NULL;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Lock credit row
  SELECT balance INTO v_balance
  FROM public.credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Ensure row exists
    INSERT INTO public.credits (user_id, balance)
    VALUES (p_user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT balance INTO v_balance
    FROM public.credits
    WHERE user_id = p_user_id
    FOR UPDATE;
  END IF;

  IF v_balance < p_amount THEN
    ledger_id := NULL;
    balance_before := v_balance;
    balance_after := v_balance;
    error := 'insufficient';
    RETURN NEXT;
    RETURN;
  END IF;

  v_new_balance := v_balance - p_amount;

  UPDATE public.credits
  SET balance = v_new_balance, updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO public.credit_ledger (
    transaction_id, user_id, app_id, action, type,
    amount, balance_before, balance_after, status
  )
  VALUES (
    p_transaction_id, p_user_id, p_app_id, p_action, p_type,
    -p_amount, v_balance, v_new_balance, 'completed'
  )
  RETURNING id INTO v_ledger_id;

  ledger_id := v_ledger_id;
  balance_before := v_balance;
  balance_after := v_new_balance;
  error := NULL;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_credits_atomic(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_id TEXT,
  p_type TEXT DEFAULT 'credit'
)
RETURNS TABLE (
  ledger_id UUID,
  balance_before INTEGER,
  balance_after INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
  v_ledger_id UUID;
  v_existing RECORD;
BEGIN
  SELECT * INTO v_existing
  FROM public.credit_ledger
  WHERE transaction_id = p_transaction_id AND user_id = p_user_id;

  IF FOUND AND v_existing.status = 'completed' THEN
    ledger_id := v_existing.id;
    balance_before := v_existing.balance_before;
    balance_after := v_existing.balance_after;
    RETURN NEXT;
    RETURN;
  END IF;

  INSERT INTO public.credits (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT balance INTO v_balance
  FROM public.credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  v_new_balance := v_balance + p_amount;

  UPDATE public.credits
  SET balance = v_new_balance, updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO public.credit_ledger (
    transaction_id, user_id, type, amount,
    balance_before, balance_after, status
  )
  VALUES (
    p_transaction_id, p_user_id, p_type, p_amount,
    v_balance, v_new_balance, 'completed'
  )
  RETURNING id INTO v_ledger_id;

  ledger_id := v_ledger_id;
  balance_before := v_balance;
  balance_after := v_new_balance;
  RETURN NEXT;
END;
$$;

-- Migration: Referrals table and claim function
-- Supports: referral program (give 5, get 5 bonus analyses)

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  referee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'rewarded', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id) WHERE referee_id IS NOT NULL;

-- Claim referral function (atomic operation)
CREATE OR REPLACE FUNCTION claim_referral(p_code text, p_user_id uuid)
RETURNS text AS $$
DECLARE
  v_referral referrals%ROWTYPE;
BEGIN
  -- Find the referral
  SELECT * INTO v_referral
  FROM referrals
  WHERE code = p_code AND status = 'pending'
  LIMIT 1;

  IF v_referral IS NULL THEN
    RETURN 'invalid_code';
  END IF;

  -- Prevent self-referral
  IF v_referral.referrer_id = p_user_id THEN
    RETURN 'self_referral';
  END IF;

  -- Mark referral as claimed
  UPDATE referrals
  SET referee_id = p_user_id,
      status = 'rewarded',
      claimed_at = now()
  WHERE id = v_referral.id;

  -- Award bonus analyses to both parties
  UPDATE profiles SET bonus_analyses = COALESCE(bonus_analyses, 0) + 5, referred_by = v_referral.referrer_id
  WHERE id = p_user_id;

  UPDATE profiles SET bonus_analyses = COALESCE(bonus_analyses, 0) + 5
  WHERE id = v_referral.referrer_id;

  RETURN 'success';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage table (monthly quota tracking)
CREATE TABLE IF NOT EXISTS usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id text NOT NULL,
  period_start date NOT NULL,
  analysis_count integer NOT NULL DEFAULT 0,
  tokens_used integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, agent_id, period_start)
);

-- Increment usage function
CREATE OR REPLACE FUNCTION increment_usage(p_user_id uuid, p_agent_id text, p_tokens integer DEFAULT 0)
RETURNS void AS $$
DECLARE
  v_period_start date := date_trunc('month', now())::date;
BEGIN
  INSERT INTO usage (user_id, agent_id, period_start, analysis_count, tokens_used)
  VALUES (p_user_id, p_agent_id, v_period_start, 1, p_tokens)
  ON CONFLICT (user_id, agent_id, period_start)
  DO UPDATE SET
    analysis_count = usage.analysis_count + 1,
    tokens_used = usage.tokens_used + p_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage(user_id, period_start);

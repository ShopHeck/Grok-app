-- Migration: Add Phase 1-3 columns to profiles table
-- Adds: streak tracking, writing DNA, subscription management fields

-- Streak tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_last_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_rewards_claimed integer[] DEFAULT '{}';

-- Writing DNA (Phase 3 - personal AI tuning)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS writing_dna jsonb;

-- Subscription management (ensure these exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_period_start timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_period_end timestamptz;

-- Referral tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bonus_analyses integer DEFAULT 0;

-- Display info
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Timestamps
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_status);

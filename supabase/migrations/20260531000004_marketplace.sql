-- Migration: Agent Marketplace tables
-- Supports: community-built agents, revenue share, white-label

-- Marketplace agents
CREATE TABLE IF NOT EXISTS marketplace_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🤖',
  category text NOT NULL,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  system_prompt text NOT NULL,
  output_schema jsonb NOT NULL DEFAULT '[]',
  scoring_rubric jsonb NOT NULL DEFAULT '[]',
  placeholder text NOT NULL DEFAULT '',
  input_label text NOT NULL DEFAULT 'Text to Analyze',
  max_input_length integer NOT NULL DEFAULT 5000,
  -- Pricing
  pricing_type text NOT NULL DEFAULT 'free' CHECK (pricing_type IN ('free', 'one_time', 'subscription')),
  price_cents integer NOT NULL DEFAULT 0,
  revenue_share_pct integer NOT NULL DEFAULT 30,
  -- Status
  is_published boolean NOT NULL DEFAULT false,
  is_approved boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  -- White-label
  white_label jsonb,
  -- Stats
  installs_count integer NOT NULL DEFAULT 0,
  uses_count integer NOT NULL DEFAULT 0,
  rating numeric(3,1) NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User installed marketplace agents
CREATE TABLE IF NOT EXISTS user_marketplace_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES marketplace_agents(id) ON DELETE CASCADE,
  installed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- Marketplace reviews
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES marketplace_agents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agent_id, user_id)
);

-- Creator earnings tracking
CREATE TABLE IF NOT EXISTS creator_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES marketplace_agents(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  type text NOT NULL CHECK (type IN ('install', 'subscription', 'payout')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_agents_published ON marketplace_agents(installs_count DESC) WHERE is_published = true AND is_approved = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_agents_category ON marketplace_agents(category) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_agents_featured ON marketplace_agents(created_at DESC) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_agents_author ON marketplace_agents(author_id);
CREATE INDEX IF NOT EXISTS idx_user_marketplace_agents_user ON user_marketplace_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_agent ON marketplace_reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_creator ON creator_earnings(creator_id);

-- Increment installs function (called from API)
CREATE OR REPLACE FUNCTION increment_marketplace_installs(p_agent_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_agents
  SET installs_count = installs_count + 1
  WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER marketplace_agents_updated_at
  BEFORE UPDATE ON marketplace_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

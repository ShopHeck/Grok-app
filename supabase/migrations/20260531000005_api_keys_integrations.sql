-- Migration: API keys and integrations tables
-- Supports: webhook API, Slack integration, third-party connections

-- API keys (for webhook/v1 API access)
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_preview text NOT NULL, -- e.g., "ak_...x7f2"
  scopes text[] DEFAULT '{analyze}',
  rate_limit integer NOT NULL DEFAULT 1000,
  usage_count_today integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Integrations (Slack, etc.)
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL, -- 'slack', 'notion', etc.
  provider_team_id text,
  provider_user_id text,
  access_token text, -- encrypted in production
  refresh_token text,
  metadata jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_team_id, provider_user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_integrations_user ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider, provider_team_id);

-- Daily usage reset function (run via cron/pg_cron)
CREATE OR REPLACE FUNCTION reset_daily_api_usage()
RETURNS void AS $$
BEGIN
  UPDATE api_keys SET usage_count_today = 0 WHERE usage_count_today > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

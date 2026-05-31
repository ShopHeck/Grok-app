-- Migration: Add Phase 1-3 columns to analyses table
-- Adds: iteration tracking (parent_id), source tracking, team association

-- Iteration tracking (before/after comparison)
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES analyses(id) ON DELETE SET NULL;

-- Source tracking (web, extension, slack, api, api_v1)
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS source text DEFAULT 'web';

-- Team association
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;

-- Summary field (one-sentence verdict from AI)
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS summary text;

-- Share ID (for public sharing)
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS share_id text UNIQUE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analyses_parent ON analyses(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analyses_source ON analyses(source, user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_team ON analyses(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analyses_share ON analyses(share_id) WHERE share_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analyses_user_agent ON analyses(user_id, agent_id, status);
CREATE INDEX IF NOT EXISTS idx_analyses_user_score ON analyses(user_id, status, score DESC) WHERE score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(user_id, created_at DESC);

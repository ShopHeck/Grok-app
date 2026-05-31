-- Migration: Templates and playbooks tables
-- Supports: community template marketplace, multi-step playbooks

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  agent_id text NOT NULL,
  content text NOT NULL,
  score integer,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_official boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT true,
  forked_from uuid REFERENCES templates(id) ON DELETE SET NULL,
  uses_count integer NOT NULL DEFAULT 0,
  forks_count integer NOT NULL DEFAULT 0,
  rating numeric(3,1) NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Playbooks table (multi-step workflows)
CREATE TABLE IF NOT EXISTS playbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  steps jsonb NOT NULL DEFAULT '[]',
  is_public boolean NOT NULL DEFAULT true,
  uses_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User template ratings (prevent duplicate ratings)
CREATE TABLE IF NOT EXISTS template_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(template_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_agent ON templates(agent_id) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_templates_author ON templates(author_id);
CREATE INDEX IF NOT EXISTS idx_templates_popular ON templates(uses_count DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_templates_rating ON templates(rating DESC) WHERE is_public = true AND rating_count > 0;
CREATE INDEX IF NOT EXISTS idx_playbooks_author ON playbooks(author_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_public ON playbooks(uses_count DESC) WHERE is_public = true;

-- Triggers
CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER playbooks_updated_at
  BEFORE UPDATE ON playbooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

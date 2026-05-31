-- Migration: Row Level Security policies for all tables
-- Principle: Users can only access their own data unless team/public sharing applies

-- ═══════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ═══════════════════════════════════════════════════════
-- ANALYSES
-- ═══════════════════════════════════════════════════════
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Team members can view team analyses
CREATE POLICY "Team members can view team analyses"
  ON analyses FOR SELECT
  USING (
    team_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = analyses.team_id
        AND team_members.user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════
-- USAGE
-- ═══════════════════════════════════════════════════════
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON usage FOR UPDATE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- REFERRALS
-- ═══════════════════════════════════════════════════════
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can insert own referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- ═══════════════════════════════════════════════════════
-- TEAMS
-- ═══════════════════════════════════════════════════════
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view their teams"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
        AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners/admins can update teams"
  ON teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
        AND team_members.user_id = auth.uid()
        AND team_members.role IN ('owner', 'admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- TEAM MEMBERS
-- ═══════════════════════════════════════════════════════
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view fellow members"
  ON team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners/admins can insert members"
  ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners/admins can update members"
  ON team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners/admins can remove members"
  ON team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- TEAM INVITES
-- ═══════════════════════════════════════════════════════
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view invites"
  ON team_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_invites.team_id
        AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners/admins can create invites"
  ON team_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_invites.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role IN ('owner', 'admin')
    )
  );

-- ═══════════════════════════════════════════════════════
-- TEMPLATES
-- ═══════════════════════════════════════════════════════
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view public templates
CREATE POLICY "Anyone can view public templates"
  ON templates FOR SELECT
  USING (is_public = true);

-- Users can view own private templates
CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Users can insert own templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  USING (auth.uid() = author_id);

-- ═══════════════════════════════════════════════════════
-- TEMPLATE RATINGS
-- ═══════════════════════════════════════════════════════
ALTER TABLE template_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all ratings"
  ON template_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own ratings"
  ON template_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- PLAYBOOKS
-- ═══════════════════════════════════════════════════════
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public playbooks"
  ON playbooks FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view own playbooks"
  ON playbooks FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Users can insert own playbooks"
  ON playbooks FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own playbooks"
  ON playbooks FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own playbooks"
  ON playbooks FOR DELETE
  USING (auth.uid() = author_id);

-- ═══════════════════════════════════════════════════════
-- MARKETPLACE AGENTS
-- ═══════════════════════════════════════════════════════
ALTER TABLE marketplace_agents ENABLE ROW LEVEL SECURITY;

-- Anyone can view published & approved agents
CREATE POLICY "Anyone can view published marketplace agents"
  ON marketplace_agents FOR SELECT
  USING (is_published = true AND is_approved = true);

-- Authors can view all their own agents (including unpublished)
CREATE POLICY "Authors can view own marketplace agents"
  ON marketplace_agents FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Users can insert marketplace agents"
  ON marketplace_agents FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own marketplace agents"
  ON marketplace_agents FOR UPDATE
  USING (auth.uid() = author_id);

-- ═══════════════════════════════════════════════════════
-- USER MARKETPLACE AGENTS (installs)
-- ═══════════════════════════════════════════════════════
ALTER TABLE user_marketplace_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own installed agents"
  ON user_marketplace_agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can install agents"
  ON user_marketplace_agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can uninstall agents"
  ON user_marketplace_agents FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- MARKETPLACE REVIEWS
-- ═══════════════════════════════════════════════════════
ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON marketplace_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own reviews"
  ON marketplace_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- CREATOR EARNINGS
-- ═══════════════════════════════════════════════════════
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own earnings"
  ON creator_earnings FOR SELECT
  USING (auth.uid() = creator_id);

-- ═══════════════════════════════════════════════════════
-- API KEYS
-- ═══════════════════════════════════════════════════════
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- INTEGRATIONS
-- ═══════════════════════════════════════════════════════
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integrations"
  ON integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Add share_id column for public sharing of analysis results
alter table public.analyses
  add column if not exists share_id text unique;

-- Index for fast lookup by share_id
create index if not exists idx_analyses_share_id on public.analyses(share_id)
  where share_id is not null;

-- Public read policy for shared analyses (no auth required)
create policy "Anyone can view shared analyses" on public.analyses
  for select using (share_id is not null);

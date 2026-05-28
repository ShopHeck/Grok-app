-- ============================================================
-- Migration: Multi-Agent AI Toolkit
-- Renames scans → analyses, adds agent support, quota tracking
-- ============================================================

-- 1. Update profiles table for new subscription tiers
alter table public.profiles
  drop constraint if exists profiles_subscription_status_check;

alter table public.profiles
  add constraint profiles_subscription_status_check
  check (subscription_status in ('free', 'pro', 'team', 'canceled', 'past_due'));

-- Update existing 'active' subscriptions to 'pro'
update public.profiles set subscription_status = 'pro' where subscription_status = 'active';

-- Add plan metadata
alter table public.profiles
  add column if not exists plan_period_start timestamptz,
  add column if not exists plan_period_end timestamptz;

-- 2. Rename scans → analyses and restructure
alter table public.scans rename to analyses;

-- Rename scan_type → agent_id and expand the column
alter table public.analyses rename column scan_type to agent_id;

-- Update check constraint for new agent types
alter table public.analyses
  drop constraint if exists scans_scan_type_check;

-- Add new columns for richer analysis data
alter table public.analyses
  add column if not exists score integer check (score >= 0 and score <= 100),
  add column if not exists summary text,
  add column if not exists tokens_used integer default 0;

-- 3. Create usage tracking table (for quota enforcement)
create table public.usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  agent_id text not null,
  period_start date not null default date_trunc('month', now())::date,
  analysis_count integer default 0,
  tokens_used integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, agent_id, period_start)
);

-- 4. Performance indexes
create index if not exists idx_analyses_user_id on public.analyses(user_id, created_at desc);
create index if not exists idx_analyses_agent_id on public.analyses(agent_id);
create index if not exists idx_analyses_status on public.analyses(status);
create index if not exists idx_usage_user_period on public.usage(user_id, period_start);

-- 5. RLS for usage table
alter table public.usage enable row level security;

create policy "Users can view own usage" on public.usage
  for select using (auth.uid() = user_id);

create policy "Users can insert own usage" on public.usage
  for insert with check (auth.uid() = user_id);

create policy "Users can update own usage" on public.usage
  for update using (auth.uid() = user_id);

-- 6. Update RLS policies for renamed table
-- Drop old policies (they reference old table name internally)
drop policy if exists "Users can view own scans" on public.analyses;
drop policy if exists "Users can create scans" on public.analyses;
drop policy if exists "Users can update own scans" on public.analyses;
drop policy if exists "Users can delete own scans" on public.analyses;

create policy "Users can view own analyses" on public.analyses
  for select using (auth.uid() = user_id);

create policy "Users can create analyses" on public.analyses
  for insert with check (auth.uid() = user_id);

create policy "Users can update own analyses" on public.analyses
  for update using (auth.uid() = user_id);

create policy "Users can delete own analyses" on public.analyses
  for delete using (auth.uid() = user_id);

-- 7. Function to increment usage counter (called from API)
create or replace function public.increment_usage(
  p_user_id uuid,
  p_agent_id text,
  p_tokens integer default 0
)
returns void as $$
begin
  insert into public.usage (user_id, agent_id, period_start, analysis_count, tokens_used)
  values (p_user_id, p_agent_id, date_trunc('month', now())::date, 1, p_tokens)
  on conflict (user_id, agent_id, period_start)
  do update set
    analysis_count = public.usage.analysis_count + 1,
    tokens_used = public.usage.tokens_used + p_tokens,
    updated_at = now();
end;
$$ language plpgsql security definer;

-- 8. Function to get current month usage for a user
create or replace function public.get_monthly_usage(p_user_id uuid)
returns table(agent_id text, analysis_count integer, tokens_used integer) as $$
begin
  return query
  select u.agent_id, u.analysis_count, u.tokens_used
  from public.usage u
  where u.user_id = p_user_id
    and u.period_start = date_trunc('month', now())::date;
end;
$$ language plpgsql security definer;

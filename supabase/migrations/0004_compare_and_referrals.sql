-- ============================================================
-- Migration: Compare Mode + Referral System
-- ============================================================

-- 1. Add parent_analysis_id for compare mode (version chain)
alter table public.analyses
  add column if not exists parent_id uuid references public.analyses(id) on delete set null;

-- Index for finding revisions of an analysis
create index if not exists idx_analyses_parent_id on public.analyses(parent_id)
  where parent_id is not null;

-- 2. Referral system
create table public.referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references public.profiles(id) on delete cascade not null,
  referee_id uuid references public.profiles(id) on delete cascade,
  code text unique not null,
  status text default 'pending' check (status in ('pending', 'claimed', 'rewarded')),
  bonus_analyses integer default 5,
  created_at timestamptz default now(),
  claimed_at timestamptz
);

-- Each user gets one referral code
create unique index if not exists idx_referrals_referrer on public.referrals(referrer_id);
create index if not exists idx_referrals_code on public.referrals(code);

-- RLS
alter table public.referrals enable row level security;

create policy "Users can view own referrals" on public.referrals
  for select using (auth.uid() = referrer_id or auth.uid() = referee_id);

create policy "Users can create own referral" on public.referrals
  for insert with check (auth.uid() = referrer_id);

-- 3. Add bonus_analyses to profiles for referral rewards
alter table public.profiles
  add column if not exists bonus_analyses integer default 0,
  add column if not exists referred_by uuid references public.profiles(id),
  add column if not exists onboarding_completed boolean default false;

-- 4. Function to claim a referral code
create or replace function public.claim_referral(p_code text, p_user_id uuid)
returns text as $$
declare
  v_referral record;
begin
  -- Find the referral
  select * into v_referral from public.referrals
    where code = p_code and status = 'pending';

  if not found then
    return 'invalid_code';
  end if;

  -- Can't refer yourself
  if v_referral.referrer_id = p_user_id then
    return 'self_referral';
  end if;

  -- Claim it
  update public.referrals
    set referee_id = p_user_id,
        status = 'rewarded',
        claimed_at = now()
    where id = v_referral.id;

  -- Give bonus to both parties
  update public.profiles
    set bonus_analyses = bonus_analyses + 5,
        referred_by = v_referral.referrer_id
    where id = p_user_id;

  update public.profiles
    set bonus_analyses = bonus_analyses + 5
    where id = v_referral.referrer_id;

  return 'success';
end;
$$ language plpgsql security definer;

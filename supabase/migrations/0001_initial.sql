-- Users profile table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  stripe_customer_id text unique,
  subscription_status text default 'free' check (subscription_status in ('free', 'active', 'canceled', 'past_due')),
  subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Scans table
create table public.scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  input_text text not null,
  scan_type text not null default 'general',
  result jsonb,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.scans enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own scans" on public.scans for select using (auth.uid() = user_id);
create policy "Users can create scans" on public.scans for insert with check (auth.uid() = user_id);
create policy "Users can update own scans" on public.scans for update using (auth.uid() = user_id);
create policy "Users can delete own scans" on public.scans for delete using (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

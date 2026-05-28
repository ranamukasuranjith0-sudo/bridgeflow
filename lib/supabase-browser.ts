import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/*
-- SUPABASE SQL SCHEMA
-- Run this in Supabase SQL editor

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  role text not null check (role in ('admin', 'manager', 'entreprise')),
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can read all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Candidates (manager profiles)
create table if not exists candidates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  name text not null,
  email text not null,
  phone text,
  role_function text,
  tjm integer,
  location text,
  availability text,
  legal_status text,
  mobility text,
  experience_summary text,
  sectors text[],
  cv_url text,
  status text default 'pending' check (status in ('pending', 'validated', 'rejected')),
  created_at timestamptz default now()
);
alter table candidates enable row level security;
create policy "Admins can do anything on candidates" on candidates for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Managers can read validated candidates" on candidates for select using (
  status = 'validated' and exists (select 1 from profiles where id = auth.uid() and role = 'manager')
);
create policy "Owner can read own candidate" on candidates for select using (user_id = auth.uid());

-- Companies
create table if not exists companies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  company_name text not null,
  contact_name text,
  email text not null,
  phone text,
  size text,
  role_needed text,
  duration text,
  budget_tjm integer,
  location text,
  start_date text,
  context text,
  required_skills text[],
  status text default 'pending' check (status in ('pending', 'active', 'closed')),
  created_at timestamptz default now()
);
alter table companies enable row level security;
create policy "Admins can do anything on companies" on companies for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Company owner can read own" on companies for select using (user_id = auth.uid());

-- Missions
create table if not exists missions (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id),
  title text not null,
  role text,
  location text,
  tjm integer,
  duration text,
  urgency text,
  tags text[],
  summary text,
  context text,
  initials text,
  color text,
  status text default 'active' check (status in ('active', 'closed', 'paused')),
  created_at timestamptz default now()
);
alter table missions enable row level security;
create policy "Anyone authenticated can read active missions" on missions for select using (auth.role() = 'authenticated' and status = 'active');
create policy "Admins can do anything on missions" on missions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Likes
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  target_id uuid not null,
  target_type text not null check (target_type in ('mission', 'candidate')),
  created_at timestamptz default now(),
  unique(user_id, target_id, target_type)
);
alter table likes enable row level security;
create policy "Users can manage own likes" on likes for all using (user_id = auth.uid());
create policy "Admins can read all likes" on likes for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Matches
create table if not exists matches (
  id uuid default gen_random_uuid() primary key,
  candidate_id uuid references candidates(id),
  company_id uuid references companies(id),
  mission_id uuid references missions(id),
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  calendly_sent boolean default false,
  created_at timestamptz default now()
);
alter table matches enable row level security;
create policy "Admins can do anything on matches" on matches for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Interviews
create table if not exists interviews (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('qualification_candidate', 'qualification_company', 'match')),
  participant_name text not null,
  role text,
  interview_date date,
  interview_time time,
  duration text default '30 min',
  format text,
  tjm text,
  location text,
  notes text,
  status text default 'todo' check (status in ('todo', 'confirmed', 'pending')),
  created_at timestamptz default now()
);
alter table interviews enable row level security;
create policy "Admins can do anything on interviews" on interviews for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
*/

-- ============================================================
-- BridgeFlow — Supabase SQL Schema
-- Exécuter dans l'éditeur SQL de Supabase
-- ============================================================

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
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
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
create policy "Anyone can insert candidate" on candidates for insert with check (true);

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
create policy "Anyone can insert company" on companies for insert with check (true);

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
create policy "Anyone authenticated can read active missions" on missions for select using (
  auth.role() = 'authenticated' and status = 'active'
);
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

-- ============================================================
-- Seed data: 5 missions du prototype
-- ============================================================
-- Note: insérez d'abord une company de référence ou utilisez NULL pour company_id

insert into missions (title, role, location, tjm, duration, urgency, tags, summary, context, initials, color, status) values
(
  'DAF de transition', 'Directeur Financier', 'Paris 8e', 1100, '9 mois', 'Urgent',
  ARRAY['Restructuration','M&A','Reporting'],
  '→ Sécuriser le closing d''une acquisition européenne (cible 60M€)
→ Mettre en place le reporting consolidé groupe
→ Piloter la relation avec les partenaires financiers et banquiers
→ Accompagner la direction dans les arbitrages stratégiques',
  'ETI familiale · 450 salariés · CA 180M€ · Distribution alimentaire',
  'GL', '#7c3aed', 'active'
),
(
  'DRH de transition', 'Directeur RH', 'Lyon', 950, '6 mois', 'Sous 2 sem.',
  ARRAY['Change mgmt','GPEC','SIRH'],
  '→ Structurer la fonction RH (passage de 200 à 600 collaborateurs en 18 mois)
→ Déployer un SIRH (Workday) sur l''ensemble des entités
→ Mettre en place une politique GPEC et onboarding
→ Accompagner le management dans la transformation culturelle',
  'Startup Series B · 600 salariés · Levée récente 40M€ · MedTech',
  'MS', '#059669', 'active'
),
(
  'Directeur des Opérations', 'COO', 'Boulogne', 1300, '12 mois', 'Immédiat',
  ARRAY['Supply chain','Lean','International'],
  '→ Déployer un programme lean manufacturing sur 5 sites européens
→ Réduire les niveaux de stocks de 25% en 6 mois
→ Sécuriser les approvisionnements critiques post-crise semiconducteurs
→ Manager une équipe de 8 responsables de site',
  'Grand groupe · 5 usines (FR, DE, ES, PL) · 2 000 personnes en scope',
  'RS', '#b45309', 'active'
),
(
  'DSI de transition', 'Directeur SI', 'Remote+Paris', 1050, '6 mois', 'Sous 1 mois',
  ARRAY['ERP','SAP','Transfo digitale'],
  '→ Reprendre le leadership d''un projet SAP S/4HANA en retard de 4 mois
→ Recadrer les équipes internes et l''intégrateur externe
→ Assurer le go-live sur 3 entités du groupe
→ Mettre en place la gouvernance SI post-déploiement',
  'Groupe de services · 3 filiales · 300 utilisateurs SAP · Full remote + Paris 2j/mois',
  'DV', '#be185d', 'active'
),
(
  'DG de transition', 'Directeur Général', 'Bordeaux', 1500, '18 mois', 'Urgent',
  ARRAY['Turnaround','Immobilier','Direction générale'],
  '→ Stabiliser l''organisation après départ de l''actionnaire majoritaire
→ Restructurer la dette bancaire et négocier avec les créanciers
→ Piloter la cession de 3 actifs non stratégiques (VNI ~40M€)
→ Préparer la recapitalisation et l''entrée d''un nouvel investisseur',
  'Foncière privée · 12 actifs · VNI ~120M€ · Équipe de 15 · Bordeaux',
  'FN', '#0369a1', 'active'
);

-- ============================================================
-- Créer le profil admin manuellement après inscription
-- (ou via le dashboard Supabase Authentication)
-- ============================================================
-- UPDATE profiles SET role = 'admin' WHERE email = 'suranjith.ranamuka@hotmail.com';

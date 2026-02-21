create table if not exists public.opportunities (
  id text primary key,
  title text not null,
  org text not null,
  type text not null check (type in ('Job', 'Grant', 'Pitch Call', 'Fellowship')),
  location text not null,
  compensation text not null,
  deadline date not null,
  tags text[] not null default '{}',
  match_reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pipeline_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  client text not null,
  due_date date not null,
  value numeric(10, 2) not null check (value >= 0),
  stage text not null check (stage in ('To Pitch', 'Applied', 'Interview', 'Booked', 'Invoiced', 'Paid')),
  created_at timestamptz not null default now()
);

create table if not exists public.member_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  location text,
  skills text[] not null default '{}',
  beats text[] not null default '{}',
  pay_floor integer,
  notify_daily boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_opportunities (
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id text not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create table if not exists public.mentor_checkins (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  mentor_name text not null,
  topic text not null,
  next_check_in date not null,
  notes text,
  status text not null check (status in ('Scheduled', 'Completed')) default 'Scheduled',
  created_at timestamptz not null default now()
);

alter table public.opportunities enable row level security;
alter table public.pipeline_items enable row level security;
alter table public.member_profiles enable row level security;
alter table public.saved_opportunities enable row level security;
alter table public.mentor_checkins enable row level security;

drop policy if exists "read opportunities" on public.opportunities;
create policy "read opportunities" on public.opportunities for select using (true);

drop policy if exists "pipeline owner read" on public.pipeline_items;
create policy "pipeline owner read" on public.pipeline_items
for select using (auth.uid() = user_id);

drop policy if exists "pipeline owner insert" on public.pipeline_items;
create policy "pipeline owner insert" on public.pipeline_items
for insert with check (auth.uid() = user_id);

drop policy if exists "pipeline owner update" on public.pipeline_items;
create policy "pipeline owner update" on public.pipeline_items
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "pipeline owner delete" on public.pipeline_items;
create policy "pipeline owner delete" on public.pipeline_items
for delete using (auth.uid() = user_id);

drop policy if exists "member profile read" on public.member_profiles;
create policy "member profile read" on public.member_profiles
for select using (auth.uid() = user_id);

drop policy if exists "member profile upsert" on public.member_profiles;
create policy "member profile upsert" on public.member_profiles
for insert with check (auth.uid() = user_id);

drop policy if exists "member profile update" on public.member_profiles;
create policy "member profile update" on public.member_profiles
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "saved opportunities owner read" on public.saved_opportunities;
create policy "saved opportunities owner read" on public.saved_opportunities
for select using (auth.uid() = user_id);

drop policy if exists "saved opportunities owner insert" on public.saved_opportunities;
create policy "saved opportunities owner insert" on public.saved_opportunities
for insert with check (auth.uid() = user_id);

drop policy if exists "saved opportunities owner delete" on public.saved_opportunities;
create policy "saved opportunities owner delete" on public.saved_opportunities
for delete using (auth.uid() = user_id);

drop policy if exists "mentor checkins owner read" on public.mentor_checkins;
create policy "mentor checkins owner read" on public.mentor_checkins
for select using (auth.uid() = user_id);

drop policy if exists "mentor checkins owner insert" on public.mentor_checkins;
create policy "mentor checkins owner insert" on public.mentor_checkins
for insert with check (auth.uid() = user_id);

drop policy if exists "mentor checkins owner update" on public.mentor_checkins;
create policy "mentor checkins owner update" on public.mentor_checkins
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

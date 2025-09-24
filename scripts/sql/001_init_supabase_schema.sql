-- Enable extensions commonly used (safe if already enabled)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Auto create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Profiles policies
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
using ( id = auth.uid() );

drop policy if exists "Profiles can be updated by owner" on public.profiles;
create policy "Profiles can be updated by owner"
on public.profiles for update
using ( id = auth.uid() );

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;

drop policy if exists "Projects are viewable by owner" on public.projects;
create policy "Projects are viewable by owner"
on public.projects for select
using ( user_id = auth.uid() );

drop policy if exists "Projects can be inserted by owner" on public.projects;
create policy "Projects can be inserted by owner"
on public.projects for insert
with check ( user_id = auth.uid() );

drop policy if exists "Projects can be updated by owner" on public.projects;
create policy "Projects can be updated by owner"
on public.projects for update
using ( user_id = auth.uid() );

drop policy if exists "Projects can be deleted by owner" on public.projects;
create policy "Projects can be deleted by owner"
on public.projects for delete
using ( user_id = auth.uid() );

-- Versions (edit history)
create table if not exists public.versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  prompt text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
alter table public.versions enable row level security;

drop policy if exists "Versions are viewable by owner" on public.versions;
create policy "Versions are viewable by owner"
on public.versions for select
using ( user_id = auth.uid() );

drop policy if exists "Versions can be inserted by owner" on public.versions;
create policy "Versions can be inserted by owner"
on public.versions for insert
with check ( user_id = auth.uid() );

drop policy if exists "Versions can be deleted by owner" on public.versions;
create policy "Versions can be deleted by owner"
on public.versions for delete
using ( user_id = auth.uid() );

-- Settings
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  theme text not null default 'system',
  preferences jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;

drop policy if exists "Settings are viewable by owner" on public.settings;
create policy "Settings are viewable by owner"
on public.settings for select
using ( user_id = auth.uid() );

drop policy if exists "Settings can be inserted by owner" on public.settings;
create policy "Settings can be inserted by owner"
on public.settings for insert
with check ( user_id = auth.uid() );

drop policy if exists "Settings can be updated by owner" on public.settings;
create policy "Settings can be updated by owner"
on public.settings for update
using ( user_id = auth.uid() );

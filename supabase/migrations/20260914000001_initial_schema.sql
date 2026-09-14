create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled note',
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists notes_project_id_idx on public.notes(project_id);
create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists links_project_id_idx on public.links(project_id);
create index if not exists links_user_id_idx on public.links(user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists notes_updated_at on public.notes;
create trigger notes_updated_at before update on public.notes for each row execute function public.set_updated_at();
drop trigger if exists links_updated_at on public.links;
create trigger links_updated_at before update on public.links for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.notes enable row level security;
alter table public.links enable row level security;

drop policy if exists projects_select_own on public.projects;
create policy projects_select_own on public.projects for select using (auth.uid() = user_id);
drop policy if exists projects_insert_own on public.projects;
create policy projects_insert_own on public.projects for insert with check (auth.uid() = user_id);
drop policy if exists projects_update_own on public.projects;
create policy projects_update_own on public.projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists projects_delete_own on public.projects;
create policy projects_delete_own on public.projects for delete using (auth.uid() = user_id);

drop policy if exists notes_select_own on public.notes;
create policy notes_select_own on public.notes for select using (auth.uid() = user_id);
drop policy if exists notes_insert_own on public.notes;
create policy notes_insert_own on public.notes for insert with check (auth.uid() = user_id);
drop policy if exists notes_update_own on public.notes;
create policy notes_update_own on public.notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists notes_delete_own on public.notes;
create policy notes_delete_own on public.notes for delete using (auth.uid() = user_id);

drop policy if exists links_select_own on public.links;
create policy links_select_own on public.links for select using (auth.uid() = user_id);
drop policy if exists links_insert_own on public.links;
create policy links_insert_own on public.links for insert with check (auth.uid() = user_id);
drop policy if exists links_update_own on public.links;
create policy links_update_own on public.links for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists links_delete_own on public.links;
create policy links_delete_own on public.links for delete using (auth.uid() = user_id);

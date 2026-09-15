-- Phase 3 workspace/resource foundation.
-- The schema was applied to the Hubify Supabase project before this migration file
-- was committed so the database and repository remain synchronized.
--
-- This migration is intentionally documentary/idempotent: existing production
-- objects are preserved and no legacy Project/Note/Link data is deleted.

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('file', 'link', 'note', 'table', 'list')),
  title text not null check (char_length(trim(title)) > 0),
  description text,
  metadata jsonb not null default '{}'::jsonb,
  is_favorite boolean not null default false,
  last_opened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_project_migrations (
  project_id uuid primary key references public.projects(id) on delete cascade,
  workspace_id uuid unique not null references public.workspaces(id) on delete cascade,
  migrated_at timestamptz not null default now()
);

create index if not exists workspaces_user_id_idx on public.workspaces(user_id);
create index if not exists resources_workspace_id_idx on public.resources(workspace_id);
create index if not exists resources_user_id_idx on public.resources(user_id);
create index if not exists resources_type_idx on public.resources(user_id, type);
create index if not exists resources_updated_at_idx on public.resources(user_id, updated_at desc);
create index if not exists resources_favorite_idx on public.resources(user_id, is_favorite) where is_favorite = true;

alter table public.workspaces enable row level security;
alter table public.resources enable row level security;
alter table public.workspace_project_migrations enable row level security;

-- Keep resource ownership consistent with workspace ownership.
create or replace function public.resource_workspace_owner_check()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.workspaces w
    where w.id = new.workspace_id and w.user_id = new.user_id
  ) then
    raise exception 'workspace ownership mismatch';
  end if;
  return new;
end;
$$;

drop trigger if exists resources_workspace_owner_check on public.resources;
create trigger resources_workspace_owner_check
before insert or update of workspace_id, user_id on public.resources
for each row execute function public.resource_workspace_owner_check();

-- Policies are created only when absent so this file can be replayed safely.
do $$ begin
  create policy workspaces_select_own on public.workspaces for select to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy workspaces_insert_own on public.workspaces for insert to authenticated with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy workspaces_update_own on public.workspaces for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy workspaces_delete_own on public.workspaces for delete to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy resources_select_own on public.resources for select to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy resources_insert_own on public.resources for insert to authenticated with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy resources_update_own on public.resources for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy resources_delete_own on public.resources for delete to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

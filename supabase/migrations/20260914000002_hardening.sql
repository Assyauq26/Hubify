-- Phase 1 database hardening
-- Align RLS policies with Supabase performance/security guidance.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Explicitly scope application RLS to authenticated users and cache auth.uid()
-- once per statement instead of evaluating it for every candidate row.

drop policy if exists projects_select_own on public.projects;
create policy projects_select_own
on public.projects
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists projects_insert_own on public.projects;
create policy projects_insert_own
on public.projects
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists projects_update_own on public.projects;
create policy projects_update_own
on public.projects
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists projects_delete_own on public.projects;
create policy projects_delete_own
on public.projects
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists notes_select_own on public.notes;
create policy notes_select_own
on public.notes
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists notes_insert_own on public.notes;
create policy notes_insert_own
on public.notes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists notes_update_own on public.notes;
create policy notes_update_own
on public.notes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists notes_delete_own on public.notes;
create policy notes_delete_own
on public.notes
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists links_select_own on public.links;
create policy links_select_own
on public.links
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists links_insert_own on public.links;
create policy links_insert_own
on public.links
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists links_update_own on public.links;
create policy links_update_own
on public.links
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists links_delete_own on public.links;
create policy links_delete_own
on public.links
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Phase 3.12: ensure resources can only belong to workspaces owned by the same user.
-- The application already validates workspace ownership server-side; these RLS
-- policies provide the database-level tenant boundary as defense in depth.

drop policy if exists resources_select_own on public.resources;
create policy resources_select_own
on public.resources
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.workspaces w
    where w.id = resources.workspace_id
      and w.user_id = (select auth.uid())
  )
);

drop policy if exists resources_insert_own on public.resources;
create policy resources_insert_own
on public.resources
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.workspaces w
    where w.id = resources.workspace_id
      and w.user_id = (select auth.uid())
  )
);

drop policy if exists resources_update_own on public.resources;
create policy resources_update_own
on public.resources
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.workspaces w
    where w.id = resources.workspace_id
      and w.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.workspaces w
    where w.id = resources.workspace_id
      and w.user_id = (select auth.uid())
  )
);

drop policy if exists resources_delete_own on public.resources;
create policy resources_delete_own
on public.resources
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.workspaces w
    where w.id = resources.workspace_id
      and w.user_id = (select auth.uid())
  )
);

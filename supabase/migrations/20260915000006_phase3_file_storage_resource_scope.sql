-- Phase 3.4: tighten Storage policies so file objects must belong to an owned file resource.

drop policy if exists hubify_files_select_own on storage.objects;
create policy hubify_files_select_own
on storage.objects
for select
to authenticated
using (
  bucket_id = 'hubify-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.resources r
    where r.id::text = (storage.foldername(name))[3]
      and r.workspace_id::text = (storage.foldername(name))[2]
      and r.user_id = (select auth.uid())
      and r.type = 'file'
  )
);

drop policy if exists hubify_files_insert_own on storage.objects;
create policy hubify_files_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'hubify-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.resources r
    where r.id::text = (storage.foldername(name))[3]
      and r.workspace_id::text = (storage.foldername(name))[2]
      and r.user_id = (select auth.uid())
      and r.type = 'file'
  )
);

drop policy if exists hubify_files_update_own on storage.objects;
create policy hubify_files_update_own
on storage.objects
for update
to authenticated
using (
  bucket_id = 'hubify-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.resources r
    where r.id::text = (storage.foldername(name))[3]
      and r.workspace_id::text = (storage.foldername(name))[2]
      and r.user_id = (select auth.uid())
      and r.type = 'file'
  )
)
with check (
  bucket_id = 'hubify-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.resources r
    where r.id::text = (storage.foldername(name))[3]
      and r.workspace_id::text = (storage.foldername(name))[2]
      and r.user_id = (select auth.uid())
      and r.type = 'file'
  )
);

drop policy if exists hubify_files_delete_own on storage.objects;
create policy hubify_files_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'hubify-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.resources r
    where r.id::text = (storage.foldername(name))[3]
      and r.workspace_id::text = (storage.foldername(name))[2]
      and r.user_id = (select auth.uid())
      and r.type = 'file'
  )
);

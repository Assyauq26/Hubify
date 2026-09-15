-- Phase 3.4: private file storage for Hubify file resources.
-- Files are stored under: <user_id>/<workspace_id>/<resource_id>/<filename>

insert into storage.buckets (id, name, public)
values ('hubify-files', 'hubify-files', false)
on conflict (id) do update set public = false;

drop policy if exists hubify_files_select_own on storage.objects;
create policy hubify_files_select_own
on storage.objects
for select
to authenticated
using (
  bucket_id = 'hubify-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists hubify_files_insert_own on storage.objects;
create policy hubify_files_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'hubify-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists hubify_files_update_own on storage.objects;
create policy hubify_files_update_own
on storage.objects
for update
to authenticated
using (
  bucket_id = 'hubify-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'hubify-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists hubify_files_delete_own on storage.objects;
create policy hubify_files_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'hubify-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

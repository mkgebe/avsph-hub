-- Storage for staff photos and documents.
--
-- Two buckets on purpose. Photos are avatars shown throughout the UI, so
-- that bucket is public and the stored photo_url is a plain public URL.
-- Documents are HR records (contracts, IDs), so that bucket is private and
-- the stored url is an object path that the app exchanges for a short-lived
-- signed URL at read time.
--
-- Object paths are '<staff_id>/<filename>' in both buckets, which is what
-- the policies below key off.

insert into storage.buckets (id, name, public)
values ('staff-photos', 'staff-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('staff-documents', 'staff-documents', false)
on conflict (id) do nothing;

-- ── staff-photos ──────────────────────────────────────────────────────────
-- Public bucket, so reads need no policy. Writes stay admin-only.

create policy staff_photos_write on storage.objects
  for all to authenticated
  using (
    bucket_id = 'staff-photos'
    and exists (
      select 1 from public.staff s
      where s.id::text = (storage.foldername(name))[1]
        and s.business_id in (select private.admin_business_ids())
    )
  )
  with check (
    bucket_id = 'staff-photos'
    and exists (
      select 1 from public.staff s
      where s.id::text = (storage.foldername(name))[1]
        and s.business_id in (select private.admin_business_ids())
    )
  );

-- ── staff-documents ───────────────────────────────────────────────────────

create policy staff_documents_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'staff-documents'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1 from public.staff s
        where s.id::text = (storage.foldername(name))[1]
          and s.business_id in (select private.admin_business_ids())
      )
    )
  );

create policy staff_documents_write on storage.objects
  for all to authenticated
  using (
    bucket_id = 'staff-documents'
    and exists (
      select 1 from public.staff s
      where s.id::text = (storage.foldername(name))[1]
        and s.business_id in (select private.admin_business_ids())
    )
  )
  with check (
    bucket_id = 'staff-documents'
    and exists (
      select 1 from public.staff s
      where s.id::text = (storage.foldername(name))[1]
        and s.business_id in (select private.admin_business_ids())
    )
  );

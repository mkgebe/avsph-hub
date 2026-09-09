-- The security advisor flagged two things about the helpers added in 0002:
--
--   1. Every SECURITY DEFINER helper was reachable as a REST endpoint
--      (/rest/v1/rpc/is_super_admin and friends) by anon and authenticated
--      callers. They exist only to be evaluated inside policies.
--   2. set_updated_at had a mutable search_path.
--
-- PostgREST only exposes the `public` schema, so the fix is to move the
-- helpers into a `private` schema. Policies can still call them; the REST
-- API cannot reach them. Trigger functions need no EXECUTE grant at all,
-- since PostgreSQL does not check it for the triggering user.

create schema if not exists private;

-- ── Helpers, relocated ────────────────────────────────────────────────────

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.id = (select auth.uid()) and a.is_active
  );
$$;

create or replace function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.id = (select auth.uid())
      and a.is_active
      and a.role = 'super-admin'
  );
$$;

create or replace function private.admin_business_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select b.id from public.businesses b
  where private.is_super_admin()
  union
  select ab.business_id from public.admin_businesses ab
  where ab.admin_id = (select auth.uid());
$$;

create or replace function private.staff_business_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.business_id from public.staff s
  where s.id = (select auth.uid()) and s.is_active;
$$;

create or replace function private.guard_admin_privilege_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (new.role is distinct from old.role
      or new.is_active is distinct from old.is_active)
     and not private.is_super_admin() then
    raise exception 'only a super-admin may change an admin''s role or active state';
  end if;
  return new;
end;
$$;

-- Policies are evaluated as the querying role, so it needs to reach these.
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_super_admin() to authenticated;
grant execute on function private.admin_business_ids() to authenticated;
grant execute on function private.staff_business_id() to authenticated;

-- ── Drop the public versions and everything depending on them ─────────────

drop policy businesses_select on public.businesses;
drop policy businesses_insert on public.businesses;
drop policy businesses_update on public.businesses;
drop policy businesses_delete on public.businesses;
drop policy admins_select on public.admins;
drop policy admins_insert on public.admins;
drop policy admins_update on public.admins;
drop policy admins_delete on public.admins;
drop policy admin_businesses_select on public.admin_businesses;
drop policy admin_businesses_write on public.admin_businesses;
drop policy clients_select on public.clients;
drop policy clients_write on public.clients;
drop policy compensation_profiles_select on public.compensation_profiles;
drop policy compensation_profiles_write on public.compensation_profiles;
drop policy staff_select on public.staff;
drop policy staff_write on public.staff;
drop policy staff_documents_select on public.staff_documents;
drop policy staff_documents_write on public.staff_documents;

drop trigger businesses_set_updated_at on public.businesses;
drop trigger admins_set_updated_at on public.admins;
drop trigger clients_set_updated_at on public.clients;
drop trigger compensation_profiles_set_updated_at on public.compensation_profiles;
drop trigger staff_set_updated_at on public.staff;
drop trigger admins_guard_privilege_columns on public.admins;

drop function public.set_updated_at();
drop function public.is_admin();
drop function public.is_super_admin();
drop function public.admin_business_ids();
drop function public.staff_business_id();
drop function public.guard_admin_privilege_columns();

-- ── Recreate triggers against private ─────────────────────────────────────

create trigger businesses_set_updated_at before update on public.businesses
  for each row execute function private.set_updated_at();
create trigger admins_set_updated_at before update on public.admins
  for each row execute function private.set_updated_at();
create trigger clients_set_updated_at before update on public.clients
  for each row execute function private.set_updated_at();
create trigger compensation_profiles_set_updated_at before update on public.compensation_profiles
  for each row execute function private.set_updated_at();
create trigger staff_set_updated_at before update on public.staff
  for each row execute function private.set_updated_at();

create trigger admins_guard_privilege_columns
  before update on public.admins
  for each row execute function private.guard_admin_privilege_columns();

-- ── Recreate policies against private ─────────────────────────────────────

create policy businesses_select on public.businesses
  for select to authenticated
  using (
    id in (select private.admin_business_ids())
    or id = private.staff_business_id()
  );

create policy businesses_insert on public.businesses
  for insert to authenticated
  with check (private.is_super_admin());

create policy businesses_update on public.businesses
  for update to authenticated
  using (id in (select private.admin_business_ids()))
  with check (id in (select private.admin_business_ids()));

create policy businesses_delete on public.businesses
  for delete to authenticated
  using (private.is_super_admin());

create policy admins_select on public.admins
  for select to authenticated
  using (id = (select auth.uid()) or private.is_super_admin());

create policy admins_insert on public.admins
  for insert to authenticated
  with check (private.is_super_admin());

create policy admins_update on public.admins
  for update to authenticated
  using (id = (select auth.uid()) or private.is_super_admin())
  with check (id = (select auth.uid()) or private.is_super_admin());

create policy admins_delete on public.admins
  for delete to authenticated
  using (private.is_super_admin());

create policy admin_businesses_select on public.admin_businesses
  for select to authenticated
  using (admin_id = (select auth.uid()) or private.is_super_admin());

create policy admin_businesses_write on public.admin_businesses
  for all to authenticated
  using (private.is_super_admin())
  with check (private.is_super_admin());

create policy clients_select on public.clients
  for select to authenticated
  using (business_id in (select private.admin_business_ids()));

create policy clients_write on public.clients
  for all to authenticated
  using (business_id in (select private.admin_business_ids()))
  with check (business_id in (select private.admin_business_ids()));

create policy compensation_profiles_select on public.compensation_profiles
  for select to authenticated
  using (business_id in (select private.admin_business_ids()));

create policy compensation_profiles_write on public.compensation_profiles
  for all to authenticated
  using (business_id in (select private.admin_business_ids()))
  with check (business_id in (select private.admin_business_ids()));

create policy staff_select on public.staff
  for select to authenticated
  using (
    id = (select auth.uid())
    or business_id in (select private.admin_business_ids())
  );

create policy staff_write on public.staff
  for all to authenticated
  using (business_id in (select private.admin_business_ids()))
  with check (business_id in (select private.admin_business_ids()));

create policy staff_documents_select on public.staff_documents
  for select to authenticated
  using (
    staff_id = (select auth.uid())
    or exists (
      select 1 from public.staff s
      where s.id = staff_documents.staff_id
        and s.business_id in (select private.admin_business_ids())
    )
  );

create policy staff_documents_write on public.staff_documents
  for all to authenticated
  using (
    exists (
      select 1 from public.staff s
      where s.id = staff_documents.staff_id
        and s.business_id in (select private.admin_business_ids())
    )
  )
  with check (
    exists (
      select 1 from public.staff s
      where s.id = staff_documents.staff_id
        and s.business_id in (select private.admin_business_ids())
    )
  );

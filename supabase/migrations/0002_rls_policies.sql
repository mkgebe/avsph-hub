-- Row level security for the core schema.
--
-- The helper functions are SECURITY DEFINER on purpose: a policy on `admins`
-- that queries `admins` would recurse forever, so the lookups must run with
-- RLS bypassed. They take no user input and have an empty search_path, so
-- there is nothing for a caller to influence.

-- ── Helpers ───────────────────────────────────────────────────────────────

create or replace function public.is_admin()
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

create or replace function public.is_super_admin()
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

-- Businesses the current admin may act on. Super-admins get all of them.
create or replace function public.admin_business_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select b.id from public.businesses b
  where public.is_super_admin()
  union
  select ab.business_id from public.admin_businesses ab
  where ab.admin_id = (select auth.uid());
$$;

create or replace function public.staff_business_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.business_id from public.staff s
  where s.id = (select auth.uid()) and s.is_active;
$$;

-- ── Enable RLS ────────────────────────────────────────────────────────────

alter table public.businesses enable row level security;
alter table public.admins enable row level security;
alter table public.admin_businesses enable row level security;
alter table public.clients enable row level security;
alter table public.compensation_profiles enable row level security;
alter table public.staff enable row level security;
alter table public.staff_documents enable row level security;

-- ── businesses ────────────────────────────────────────────────────────────

create policy businesses_select on public.businesses
  for select to authenticated
  using (
    id in (select public.admin_business_ids())
    or id = public.staff_business_id()
  );

create policy businesses_insert on public.businesses
  for insert to authenticated
  with check (public.is_super_admin());

create policy businesses_update on public.businesses
  for update to authenticated
  using (id in (select public.admin_business_ids()))
  with check (id in (select public.admin_business_ids()));

create policy businesses_delete on public.businesses
  for delete to authenticated
  using (public.is_super_admin());

-- ── admins ────────────────────────────────────────────────────────────────

create policy admins_select on public.admins
  for select to authenticated
  using (id = (select auth.uid()) or public.is_super_admin());

create policy admins_insert on public.admins
  for insert to authenticated
  with check (public.is_super_admin());

-- Admins may edit their own profile; role and is_active are guarded by the
-- trigger below rather than by the policy, which cannot see the old row.
create policy admins_update on public.admins
  for update to authenticated
  using (id = (select auth.uid()) or public.is_super_admin())
  with check (id = (select auth.uid()) or public.is_super_admin());

create policy admins_delete on public.admins
  for delete to authenticated
  using (public.is_super_admin());

create or replace function public.guard_admin_privilege_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (new.role is distinct from old.role
      or new.is_active is distinct from old.is_active)
     and not public.is_super_admin() then
    raise exception 'only a super-admin may change an admin''s role or active state';
  end if;
  return new;
end;
$$;

create trigger admins_guard_privilege_columns
  before update on public.admins
  for each row execute function public.guard_admin_privilege_columns();

-- ── admin_businesses ──────────────────────────────────────────────────────

create policy admin_businesses_select on public.admin_businesses
  for select to authenticated
  using (admin_id = (select auth.uid()) or public.is_super_admin());

create policy admin_businesses_write on public.admin_businesses
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ── clients ───────────────────────────────────────────────────────────────

create policy clients_select on public.clients
  for select to authenticated
  using (business_id in (select public.admin_business_ids()));

create policy clients_write on public.clients
  for all to authenticated
  using (business_id in (select public.admin_business_ids()))
  with check (business_id in (select public.admin_business_ids()));

-- ── compensation_profiles ─────────────────────────────────────────────────

create policy compensation_profiles_select on public.compensation_profiles
  for select to authenticated
  using (business_id in (select public.admin_business_ids()));

create policy compensation_profiles_write on public.compensation_profiles
  for all to authenticated
  using (business_id in (select public.admin_business_ids()))
  with check (business_id in (select public.admin_business_ids()));

-- ── staff ─────────────────────────────────────────────────────────────────

-- Staff read their own record; admins read everyone in their businesses.
create policy staff_select on public.staff
  for select to authenticated
  using (
    id = (select auth.uid())
    or business_id in (select public.admin_business_ids())
  );

-- Staff must not be able to edit their own pay, client or status, so writes
-- are admin-only. Self-service profile edits go through a separate endpoint.
create policy staff_write on public.staff
  for all to authenticated
  using (business_id in (select public.admin_business_ids()))
  with check (business_id in (select public.admin_business_ids()));

-- ── staff_documents ───────────────────────────────────────────────────────

create policy staff_documents_select on public.staff_documents
  for select to authenticated
  using (
    staff_id = (select auth.uid())
    or exists (
      select 1 from public.staff s
      where s.id = staff_documents.staff_id
        and s.business_id in (select public.admin_business_ids())
    )
  );

create policy staff_documents_write on public.staff_documents
  for all to authenticated
  using (
    exists (
      select 1 from public.staff s
      where s.id = staff_documents.staff_id
        and s.business_id in (select public.admin_business_ids())
    )
  )
  with check (
    exists (
      select 1 from public.staff s
      where s.id = staff_documents.staff_id
        and s.business_id in (select public.admin_business_ids())
    )
  );

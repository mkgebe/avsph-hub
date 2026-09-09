-- Core schema for the AVSPH hub: businesses, admins, staff and the two
-- tables staff depends on (clients, compensation profiles).
--
-- Identity model: admins and staff are both Supabase Auth users. Each row's
-- primary key IS the auth.users id, so RLS policies can compare against
-- auth.uid() directly with no extra lookup.
--
-- Migration model: every table carries a nullable `legacy_id` holding the
-- MongoDB ObjectId hex string it came from. The importer uses it to resolve
-- relationships between documents; new rows leave it null.

create extension if not exists pgcrypto;

-- ── Enums ─────────────────────────────────────────────────────────────────

create type public.admin_role as enum ('super-admin', 'admin');
create type public.staff_status as enum ('active', 'on_leave', 'terminated');
create type public.employment_type as enum ('full-time', 'part-time', 'contract');
create type public.salary_type as enum ('hourly', 'daily', 'monthly', 'annual');
create type public.client_status as enum ('active', 'inactive');

-- ── updated_at trigger ────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Tables ────────────────────────────────────────────────────────────────

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  slug text not null unique,
  description text,
  logo text,
  website text,
  created_by uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admins (
  id uuid primary key references auth.users (id) on delete cascade,
  legacy_id text unique,
  email text not null unique,
  first_name text not null,
  last_name text not null,
  role public.admin_role not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- businessIds on the admin and adminIds on the business are two views of
-- this one relationship.
create table public.admin_businesses (
  admin_id uuid not null references public.admins (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (admin_id, business_id)
);

alter table public.businesses
  add constraint businesses_created_by_fkey
  foreign key (created_by) references public.admins (id) on delete set null;

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  company_name text,
  contact_person text,
  email text,
  phone text,
  website text,
  address text,
  billing_info text,
  tags text[] not null default '{}',
  logo_url text,
  notes text,
  status public.client_status not null default 'active',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.compensation_profiles (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  currency text not null,
  hourly_rate numeric(12, 4) not null,
  overtime_rate_multiplier numeric(6, 4) not null default 1,
  sunday_rate_multiplier numeric(6, 4) not null default 1,
  night_differential_rate_multiplier numeric(6, 4) not null default 1,
  is_transportation_allowance_enabled boolean not null default false,
  transportation_allowance_monthly_amount numeric(12, 2) not null default 0,
  is_sss_enabled boolean not null default false,
  is_pag_ibig_enabled boolean not null default false,
  is_phil_health_enabled boolean not null default false,
  sss_deduction_fixed_amount numeric(12, 2) not null default 0,
  pag_ibig_deduction_fixed_amount numeric(12, 2) not null default 0,
  phil_health_deduction_fixed_amount numeric(12, 2) not null default 0,
  effective_from date not null,
  effective_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint compensation_profiles_effective_range_check
    check (effective_to is null or effective_to >= effective_from)
);

create table public.staff (
  id uuid primary key references auth.users (id) on delete cascade,
  legacy_id text unique,
  business_id uuid not null references public.businesses (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  compensation_profile_id uuid references public.compensation_profiles (id) on delete set null,
  email text not null unique,
  first_name text not null,
  last_name text not null,
  phone text,
  position text not null,
  department text,
  date_hired date not null,
  salary numeric(12, 2),
  salary_type public.salary_type,
  -- What the client pays the agency per hour for this staff member, in USD.
  bill_rate_usd numeric(12, 2),
  employment_type public.employment_type not null default 'full-time',
  status public.staff_status not null default 'active',
  notes text,
  photo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_documents (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete cascade,
  name text not null,
  url text not null,
  type text not null,
  uploaded_at timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────

create index admin_businesses_business_id_idx on public.admin_businesses (business_id);
create index clients_business_id_idx on public.clients (business_id);
create index compensation_profiles_business_id_idx on public.compensation_profiles (business_id);
create index staff_business_id_idx on public.staff (business_id);
create index staff_client_id_idx on public.staff (client_id);
create index staff_status_idx on public.staff (status);
create index staff_documents_staff_id_idx on public.staff_documents (staff_id);

-- ── updated_at triggers ───────────────────────────────────────────────────

create trigger businesses_set_updated_at before update on public.businesses
  for each row execute function public.set_updated_at();
create trigger admins_set_updated_at before update on public.admins
  for each row execute function public.set_updated_at();
create trigger clients_set_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
create trigger compensation_profiles_set_updated_at before update on public.compensation_profiles
  for each row execute function public.set_updated_at();
create trigger staff_set_updated_at before update on public.staff
  for each row execute function public.set_updated_at();

import type { Admin } from "@/types/admin.types";
import type { Staff, StaffDocument } from "@/types/staff.types";

// Postgres columns are snake_case; the app's types are camelCase and carry an
// "_id" key inherited from the previous backend. These mappers are the single
// place that translation happens, so components stay unchanged.

export interface AdminRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "super-admin" | "admin";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  admin_businesses?: { business_id: string }[] | null;
}

export const toAdmin = (row: AdminRow): Admin => ({
  _id: row.id,
  email: row.email,
  firstName: row.first_name,
  lastName: row.last_name,
  role: row.role,
  businessIds: (row.admin_businesses ?? []).map((link) => link.business_id),
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export interface StaffDocumentRow {
  name: string;
  url: string;
  type: string;
  uploaded_at: string;
}

export interface StaffRow {
  id: string;
  business_id: string;
  client_id: string | null;
  compensation_profile_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  position: string;
  department: string | null;
  date_hired: string;
  salary: number | null;
  salary_type: Staff["salaryType"] | null;
  bill_rate_usd: number | null;
  employment_type: Staff["employmentType"];
  status: Staff["status"];
  notes: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  staff_documents?: StaffDocumentRow[] | null;
}

const toStaffDocument = (row: StaffDocumentRow): StaffDocument => ({
  name: row.name,
  url: row.url,
  type: row.type,
  uploadedAt: row.uploaded_at,
});

// Nullable columns become undefined rather than null: the app's types use
// optional properties, and null would render as "null" in the UI.
const orUndefined = <T>(value: T | null): T | undefined => value ?? undefined;

export const toStaff = (row: StaffRow): Staff => ({
  _id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  phone: orUndefined(row.phone),
  position: row.position,
  department: orUndefined(row.department),
  dateHired: row.date_hired,
  salary: orUndefined(row.salary),
  salaryType: orUndefined(row.salary_type),
  compensationProfileId: orUndefined(row.compensation_profile_id),
  clientId: orUndefined(row.client_id),
  billRateUsd: orUndefined(row.bill_rate_usd),
  employmentType: row.employment_type,
  businessId: row.business_id,
  status: row.status,
  notes: orUndefined(row.notes),
  photoUrl: orUndefined(row.photo_url),
  documents: (row.staff_documents ?? []).map(toStaffDocument),
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const ADMIN_SELECT = "*, admin_businesses(business_id)";
export const STAFF_SELECT = "*, staff_documents(name, url, type, uploaded_at)";

// ── Businesses ────────────────────────────────────────────────────────────────

export interface BusinessRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  admin_businesses?: { admin_id: string }[] | null;
}

export const toBusiness = (row: BusinessRow) => ({
  _id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description ?? undefined,
  logo: row.logo ?? undefined,
  website: row.website ?? undefined,
  adminIds: (row.admin_businesses ?? []).map((link) => link.admin_id),
  createdBy: row.created_by ?? undefined,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const BUSINESS_SELECT = "*, admin_businesses(admin_id)";

// ── Clients ───────────────────────────────────────────────────────────────────

export interface ClientRow {
  id: string;
  business_id: string;
  name: string;
  company_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  billing_info: string | null;
  tags: string[] | null;
  logo_url: string | null;
  notes: string | null;
  status: "active" | "inactive";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const toClient = (row: ClientRow) => ({
  _id: row.id,
  businessId: row.business_id,
  name: row.name,
  companyName: row.company_name ?? undefined,
  contactPerson: row.contact_person ?? undefined,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  website: row.website ?? undefined,
  address: row.address ?? undefined,
  billingInfo: row.billing_info ?? undefined,
  tags: row.tags ?? [],
  logoUrl: row.logo_url ?? undefined,
  notes: row.notes ?? undefined,
  status: row.status,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ── Compensation profiles ─────────────────────────────────────────────────────

export interface CompensationProfileRow {
  id: string;
  business_id: string;
  name: string;
  currency: string;
  hourly_rate: number;
  overtime_rate_multiplier: number;
  sunday_rate_multiplier: number;
  night_differential_rate_multiplier: number;
  is_transportation_allowance_enabled: boolean;
  transportation_allowance_monthly_amount: number;
  is_sss_enabled: boolean;
  is_pag_ibig_enabled: boolean;
  is_phil_health_enabled: boolean;
  sss_deduction_fixed_amount: number;
  pag_ibig_deduction_fixed_amount: number;
  phil_health_deduction_fixed_amount: number;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const toCompensationProfile = (row: CompensationProfileRow) => ({
  _id: row.id,
  name: row.name,
  businessId: row.business_id,
  currency: row.currency,
  hourlyRate: Number(row.hourly_rate),
  overtimeRateMultiplier: Number(row.overtime_rate_multiplier),
  sundayRateMultiplier: Number(row.sunday_rate_multiplier),
  nightDifferentialRateMultiplier: Number(row.night_differential_rate_multiplier),
  isTransportationAllowanceEnabled: row.is_transportation_allowance_enabled,
  transportationAllowanceMonthlyAmount: Number(
    row.transportation_allowance_monthly_amount,
  ),
  isSssEnabled: row.is_sss_enabled,
  isPagIbigEnabled: row.is_pag_ibig_enabled,
  isPhilHealthEnabled: row.is_phil_health_enabled,
  sssDeductionFixedAmount: Number(row.sss_deduction_fixed_amount),
  pagIbigDeductionFixedAmount: Number(row.pag_ibig_deduction_fixed_amount),
  philHealthDeductionFixedAmount: Number(row.phil_health_deduction_fixed_amount),
  effectiveFrom: row.effective_from,
  effectiveTo: row.effective_to ?? undefined,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ── Writes ────────────────────────────────────────────────────────────────────

// Builds the column payload for an update from a camelCase request, skipping
// keys the caller left undefined so a partial update stays partial.
export const toColumns = <T extends object>(
  data: T,
  map: Partial<Record<keyof T, string>>,
): Record<string, unknown> => {
  const row: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(map) as [keyof T, string][]) {
    const value = (data as Record<string, unknown>)[key as string];
    if (value !== undefined) row[column] = value;
  }
  return row;
};

export const BUSINESS_COLUMNS = {
  name: "name",
  slug: "slug",
  description: "description",
  logo: "logo",
  website: "website",
  isActive: "is_active",
} as const;

export const CLIENT_COLUMNS = {
  businessId: "business_id",
  name: "name",
  companyName: "company_name",
  contactPerson: "contact_person",
  email: "email",
  phone: "phone",
  website: "website",
  address: "address",
  billingInfo: "billing_info",
  tags: "tags",
  logoUrl: "logo_url",
  notes: "notes",
  status: "status",
  isActive: "is_active",
} as const;

export const COMPENSATION_COLUMNS = {
  name: "name",
  businessId: "business_id",
  currency: "currency",
  hourlyRate: "hourly_rate",
  overtimeRateMultiplier: "overtime_rate_multiplier",
  sundayRateMultiplier: "sunday_rate_multiplier",
  nightDifferentialRateMultiplier: "night_differential_rate_multiplier",
  isTransportationAllowanceEnabled: "is_transportation_allowance_enabled",
  transportationAllowanceMonthlyAmount: "transportation_allowance_monthly_amount",
  isSssEnabled: "is_sss_enabled",
  isPagIbigEnabled: "is_pag_ibig_enabled",
  isPhilHealthEnabled: "is_phil_health_enabled",
  sssDeductionFixedAmount: "sss_deduction_fixed_amount",
  pagIbigDeductionFixedAmount: "pag_ibig_deduction_fixed_amount",
  philHealthDeductionFixedAmount: "phil_health_deduction_fixed_amount",
  effectiveFrom: "effective_from",
  effectiveTo: "effective_to",
  isActive: "is_active",
} as const;

export const STAFF_COLUMNS = {
  firstName: "first_name",
  lastName: "last_name",
  email: "email",
  phone: "phone",
  position: "position",
  department: "department",
  dateHired: "date_hired",
  salary: "salary",
  salaryType: "salary_type",
  compensationProfileId: "compensation_profile_id",
  clientId: "client_id",
  billRateUsd: "bill_rate_usd",
  employmentType: "employment_type",
  businessId: "business_id",
  status: "status",
  notes: "notes",
  photoUrl: "photo_url",
  isActive: "is_active",
} as const;

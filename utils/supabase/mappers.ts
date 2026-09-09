// The app's types came from a MongoDB API: camelCase fields and an `_id`
// key. Postgres gives us snake_case and `id`. Mapping here keeps that
// difference inside the data layer, so pages and components are untouched.

import type {
  AdminRow,
  BusinessRow,
  ClientRow,
  CompensationProfileRow,
  StaffDocumentRow,
  StaffRow,
} from "@/types/database.types";
import type { Admin } from "@/types/admin.types";
import type { Business } from "@/types/business.types";
import type { Client } from "@/types/client.types";
import type { CompensationProfile } from "@/types/compensation-profile.types";
import type { Staff, StaffDocument } from "@/types/staff.types";

/** Postgres returns numerics as strings in some drivers; normalise to number. */
const num = (value: number | string | null): number | undefined =>
  value === null ? undefined : Number(value);

const numOr = (value: number | string | null, fallback: number): number =>
  value === null ? fallback : Number(value);

export const toAdmin = (row: AdminRow): Admin => ({
  _id: row.id,
  email: row.email,
  firstName: row.first_name,
  lastName: row.last_name,
  role: row.role,
  // Populated by the caller when the membership rows were joined in.
  businessIds: [],
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const toBusiness = (row: BusinessRow): Business => ({
  _id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description ?? undefined,
  logo: row.logo ?? undefined,
  website: row.website ?? undefined,
  adminIds: [],
  createdBy: row.created_by ?? undefined,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const toClient = (row: ClientRow): Client => ({
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
  tags: row.tags,
  logoUrl: row.logo_url ?? undefined,
  notes: row.notes ?? undefined,
  status: row.status,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const toCompensationProfile = (
  row: CompensationProfileRow,
): CompensationProfile => ({
  _id: row.id,
  name: row.name,
  businessId: row.business_id,
  currency: row.currency,
  hourlyRate: numOr(row.hourly_rate, 0),
  overtimeRateMultiplier: numOr(row.overtime_rate_multiplier, 1),
  sundayRateMultiplier: numOr(row.sunday_rate_multiplier, 1),
  nightDifferentialRateMultiplier: numOr(row.night_differential_rate_multiplier, 1),
  isTransportationAllowanceEnabled: row.is_transportation_allowance_enabled,
  transportationAllowanceMonthlyAmount: numOr(
    row.transportation_allowance_monthly_amount,
    0,
  ),
  isSssEnabled: row.is_sss_enabled,
  isPagIbigEnabled: row.is_pag_ibig_enabled,
  isPhilHealthEnabled: row.is_phil_health_enabled,
  sssDeductionFixedAmount: numOr(row.sss_deduction_fixed_amount, 0),
  pagIbigDeductionFixedAmount: numOr(row.pag_ibig_deduction_fixed_amount, 0),
  philHealthDeductionFixedAmount: numOr(row.phil_health_deduction_fixed_amount, 0),
  effectiveFrom: row.effective_from,
  effectiveTo: row.effective_to ?? undefined,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const toStaffDocument = (row: StaffDocumentRow): StaffDocument => ({
  name: row.name,
  url: row.url,
  type: row.type,
  uploadedAt: row.uploaded_at,
});

export const toStaff = (
  row: StaffRow & { staff_documents?: StaffDocumentRow[] },
): Staff => ({
  _id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  phone: row.phone ?? undefined,
  position: row.position,
  department: row.department ?? undefined,
  dateHired: row.date_hired,
  salary: num(row.salary),
  salaryType: row.salary_type ?? undefined,
  compensationProfileId: row.compensation_profile_id ?? undefined,
  clientId: row.client_id ?? undefined,
  billRateUsd: num(row.bill_rate_usd),
  employmentType: row.employment_type,
  businessId: row.business_id,
  status: row.status,
  notes: row.notes ?? undefined,
  photoUrl: row.photo_url ?? undefined,
  documents: row.staff_documents?.map(toStaffDocument),
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

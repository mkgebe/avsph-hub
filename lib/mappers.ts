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

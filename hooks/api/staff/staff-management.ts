import { supabase } from "@/utils/supabase/client";
import { toStaff, toStaffDocument } from "@/utils/supabase/mappers";
import type { StaffDocumentRow, StaffUpdate } from "@/types/database.types";
import type {
  Staff,
  StaffListResponse,
  StaffQueryParams,
  CreateStaffRequest,
  UpdateStaffRequest,
  DeleteStaffResponse,
  UploadPhotoResponse,
  UploadDocumentResponse,
  BulkStaffRequest,
  BulkStaffResponse,
} from "@/types/staff.types";

const PHOTO_BUCKET = "staff-photos";
const DOCUMENT_BUCKET = "staff-documents";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

/** Calls one of the app's own route handlers with the current session. */
const authedFetch = async (url: string, init: RequestInit): Promise<unknown> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in.");

  const response = await fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error((body as { error?: string })?.error || "Request failed.");
  }
  return body;
};

/**
 * Documents uploaded here live in a private bucket, so the stored `url` is
 * an object path that has to be exchanged for a short-lived signed URL.
 * Documents carried over from the old backend are already absolute URLs on
 * their original host, so those pass through untouched.
 */
const withSignedDocumentUrls = async (
  rows: StaffDocumentRow[],
): Promise<StaffDocumentRow[]> => {
  const paths = rows
    .map((row) => row.url)
    .filter((url) => !/^https?:\/\//i.test(url));

  if (paths.length === 0) return rows;

  const { data, error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  if (error) throw new Error(error.message);

  const signedByPath = new Map(
    (data ?? [])
      .filter((entry) => entry.signedUrl)
      .map((entry) => [entry.path, entry.signedUrl] as const),
  );

  return rows.map((row) => ({
    ...row,
    url: signedByPath.get(row.url) ?? row.url,
  }));
};

const loadStaffDocuments = async (staffId: string): Promise<StaffDocumentRow[]> => {
  const { data, error } = await supabase
    .from("staff_documents")
    .select("*")
    .eq("staff_id", staffId)
    .order("uploaded_at", { ascending: false });

  if (error) throw new Error(error.message);
  return withSignedDocumentUrls(data ?? []);
};

// Get staff by business with search and pagination
export const getStaffByBusiness = async (
  businessId: string,
  params?: StaffQueryParams,
): Promise<StaffListResponse> => {
  const page = params?.page && params.page > 0 ? params.page : 1;
  const limit = params?.limit && params.limit > 0 ? params.limit : 20;
  const from = (page - 1) * limit;

  let query = supabase
    .from("staff")
    .select("*", { count: "exact" })
    .eq("business_id", businessId);

  if (params?.status) query = query.eq("status", params.status);
  if (params?.employmentType) {
    query = query.eq("employment_type", params.employmentType);
  }
  if (params?.search) {
    // Escape the PostgREST `or` separators so a comma or paren in the search
    // box cannot change the shape of the filter.
    const term = params.search.replace(/[,()]/g, " ").trim();
    if (term) {
      const like = `%${term}%`;
      query = query.or(
        [
          `first_name.ilike.${like}`,
          `last_name.ilike.${like}`,
          `email.ilike.${like}`,
          `position.ilike.${like}`,
        ].join(","),
      );
    }
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    data: (data ?? []).map((row) => toStaff(row)),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};

// Get staff by ID
export const getStaffById = async (id: string): Promise<Staff> => {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Staff member not found.");

  return toStaff({ ...data, staff_documents: await loadStaffDocuments(id) });
};

// Create staff member. Provisioning the auth account needs the service role
// key, so this goes through the app's own route handler.
export const createStaff = async (data: CreateStaffRequest): Promise<Staff> =>
  (await authedFetch("/api/staff", {
    method: "POST",
    body: JSON.stringify(data),
  })) as Staff;

// Update staff member
export const updateStaff = async (
  id: string,
  data: UpdateStaffRequest,
): Promise<Staff> => {
  const patch: StaffUpdate = {};

  if (data.firstName !== undefined) patch.first_name = data.firstName;
  if (data.lastName !== undefined) patch.last_name = data.lastName;
  if (data.email !== undefined) patch.email = data.email;
  if (data.phone !== undefined) patch.phone = data.phone || null;
  if (data.position !== undefined) patch.position = data.position;
  if (data.department !== undefined) patch.department = data.department || null;
  if (data.dateHired !== undefined) patch.date_hired = data.dateHired;
  if (data.salary !== undefined) patch.salary = data.salary;
  if (data.salaryType !== undefined) patch.salary_type = data.salaryType;
  if (data.compensationProfileId !== undefined) {
    patch.compensation_profile_id = data.compensationProfileId || null;
  }
  // An empty string unassigns the staff member from their client.
  if (data.clientId !== undefined) patch.client_id = data.clientId || null;
  if (data.billRateUsd !== undefined) patch.bill_rate_usd = data.billRateUsd;
  if (data.employmentType !== undefined) patch.employment_type = data.employmentType;
  if (data.status !== undefined) patch.status = data.status;
  if (data.notes !== undefined) patch.notes = data.notes || null;

  const { data: row, error } = await supabase
    .from("staff")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toStaff(row);
};

// Delete staff member (soft delete)
export const deleteStaff = async (id: string): Promise<DeleteStaffResponse> => {
  const { error } = await supabase
    .from("staff")
    .update({ is_active: false, status: "terminated" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return { message: "Staff member deactivated." };
};

// Upload staff photo
export const uploadStaffPhoto = async (
  id: string,
  file: File,
): Promise<UploadPhotoResponse> => {
  const path = `${id}/photo-${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);

  const { data: row, error } = await supabase
    .from("staff")
    .update({ photo_url: publicUrl })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return {
    message: "Photo uploaded.",
    photoUrl: publicUrl,
    staff: toStaff(row),
  };
};

// Upload staff document
export const uploadStaffDocument = async (
  id: string,
  file: File,
): Promise<UploadDocumentResponse> => {
  const path = `${id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(path, file);

  if (uploadError) throw new Error(uploadError.message);

  // The private bucket path is what gets stored; readers sign it on demand.
  const { data: documentRow, error: documentError } = await supabase
    .from("staff_documents")
    .insert({ staff_id: id, name: file.name, url: path, type: file.type })
    .select("*")
    .single();

  if (documentError) throw new Error(documentError.message);

  const [signed] = await withSignedDocumentUrls([documentRow]);
  const staff = await getStaffById(id);

  return {
    message: "Document uploaded.",
    document: toStaffDocument(signed),
    staff,
  };
};

// Bulk action on staff within a business (status / delete)
export const bulkStaff = async (
  businessId: string,
  body: BulkStaffRequest,
): Promise<BulkStaffResponse> => {
  if (body.ids.length === 0) return { modified: 0 };

  const patch: StaffUpdate =
    body.action === "delete"
      ? { is_active: false, status: "terminated" }
      : { status: body.value ?? "active" };

  // Scoping to the business keeps a stale id list from touching staff
  // outside the business the caller is acting on.
  const { data, error } = await supabase
    .from("staff")
    .update(patch)
    .eq("business_id", businessId)
    .in("id", body.ids)
    .select("id");

  if (error) throw new Error(error.message);
  return { modified: data?.length ?? 0 };
};

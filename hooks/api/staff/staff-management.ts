import { supabase } from "@/lib/supabase";
import {
  STAFF_COLUMNS,
  STAFF_SELECT,
  toColumns,
  toStaff,
  type StaffRow,
} from "@/lib/mappers";
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

const DEFAULT_LIMIT = 10;

export const getStaffByBusiness = async (
  businessId: string,
  params?: StaffQueryParams,
): Promise<StaffListResponse> => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? DEFAULT_LIMIT;
  const from = (page - 1) * limit;

  let request = supabase
    .from("staff")
    .select(STAFF_SELECT, { count: "exact" })
    .eq("business_id", businessId);

  if (params?.status) request = request.eq("status", params.status);
  if (params?.employmentType) {
    request = request.eq("employment_type", params.employmentType);
  }
  if (params?.search) {
    const term = `%${params.search}%`;
    request = request.or(
      `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},position.ilike.${term}`,
    );
  }

  const { data, error, count } = await request
    .order("first_name")
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    data: (data as StaffRow[]).map(toStaff),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasMore: from + limit < total,
    },
  };
};

export const getStaffById = async (id: string): Promise<Staff> => {
  const { data, error } = await supabase
    .from("staff")
    .select(STAFF_SELECT)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return toStaff(data as StaffRow);
};

// A staff member is an auth user plus a profile row, the same shape as an
// admin. Signing them up here would swap the current session for theirs, so
// the account is created through a dedicated endpoint instead.
export const createStaff = async (_data: CreateStaffRequest): Promise<Staff> => {
  throw new Error(
    "Creating staff logins needs a server-side endpoint holding the Supabase " +
      "service role key: signing a new user up from the browser would replace " +
      "the signed-in admin's own session.",
  );
};

export const updateStaff = async (
  id: string,
  data: UpdateStaffRequest,
): Promise<Staff> => {
  const columns = toColumns(data, STAFF_COLUMNS);
  // The UI sends an empty string to unassign a client; the column is a
  // foreign key, so it needs a real null.
  if (columns.client_id === "") columns.client_id = null;

  const { data: row, error } = await supabase
    .from("staff")
    .update(columns)
    .eq("id", id)
    .select(STAFF_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return toStaff(row as StaffRow);
};

export const deleteStaff = async (id: string): Promise<DeleteStaffResponse> => {
  const { error } = await supabase
    .from("staff")
    .update({ is_active: false, status: "terminated" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return { message: "Staff member removed." };
};

export const uploadStaffPhoto = async (
  id: string,
  file: File,
): Promise<UploadPhotoResponse> => {
  const path = `${id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("staff-photos")
    .upload(path, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data: published } = supabase.storage
    .from("staff-photos")
    .getPublicUrl(path);

  const { data: row, error } = await supabase
    .from("staff")
    .update({ photo_url: published.publicUrl })
    .eq("id", id)
    .select(STAFF_SELECT)
    .single();

  if (error) throw new Error(error.message);

  return {
    message: "Photo uploaded.",
    photoUrl: published.publicUrl,
    staff: toStaff(row as StaffRow),
  };
};

export const uploadStaffDocument = async (
  id: string,
  file: File,
): Promise<UploadDocumentResponse> => {
  const path = `${id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("staff-documents")
    .upload(path, file);

  if (uploadError) throw new Error(uploadError.message);

  // The bucket is private, so the stored reference is the path. Views that
  // show the file ask for a signed URL when they need one.
  const { data: document, error } = await supabase
    .from("staff_documents")
    .insert({
      staff_id: id,
      name: file.name,
      url: path,
      type: file.type || "application/octet-stream",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const staff = await getStaffById(id);

  return {
    message: "Document uploaded.",
    document: {
      name: document.name,
      url: document.url,
      type: document.type,
      uploadedAt: document.uploaded_at,
    },
    staff,
  };
};

export const bulkStaff = async (
  businessId: string,
  body: BulkStaffRequest,
): Promise<BulkStaffResponse> => {
  const columns =
    body.action === "delete"
      ? { is_active: false, status: "terminated" }
      : { status: body.value };

  const { data, error } = await supabase
    .from("staff")
    .update(columns)
    .eq("business_id", businessId)
    .in("id", body.ids)
    .select("id");

  if (error) throw new Error(error.message);
  return { modified: data?.length ?? 0 };
};

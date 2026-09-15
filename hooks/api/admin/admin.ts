import { supabase } from "@/lib/supabase";
import { ADMIN_SELECT, toAdmin, type AdminRow } from "@/lib/mappers";
import { registerAdmin } from "@/hooks/api/auth/auth";
import type {
  Admin,
  CreateAdminRequest,
  UpdateAdminRequest,
  DeleteAdminResponse,
} from "@/types/admin.types";

// Who may read which admins is enforced by the table's RLS policy, so this
// needs no role check of its own.
export const getAllAdmins = async (): Promise<Admin[]> => {
  const { data, error } = await supabase
    .from("admins")
    .select(ADMIN_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as AdminRow[]).map(toAdmin);
};

export const getAdminById = async (id: string): Promise<Admin> => {
  const { data, error } = await supabase
    .from("admins")
    .select(ADMIN_SELECT)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return toAdmin(data as AdminRow);
};

export const createAdmin = async (data: CreateAdminRequest): Promise<Admin> =>
  registerAdmin(data);

// Role and active state are guarded by a database trigger: only a super-admin
// may change them, and the update fails loudly for anyone else.
export const updateAdmin = async (
  id: string,
  data: UpdateAdminRequest,
): Promise<Admin> => {
  const columns: Record<string, unknown> = {};
  if (data.email !== undefined) columns.email = data.email;
  if (data.firstName !== undefined) columns.first_name = data.firstName;
  if (data.lastName !== undefined) columns.last_name = data.lastName;
  if (data.role !== undefined) columns.role = data.role;
  if (data.isActive !== undefined) columns.is_active = data.isActive;

  const { data: row, error } = await supabase
    .from("admins")
    .update(columns)
    .eq("id", id)
    .select(ADMIN_SELECT)
    .single();

  if (error) throw new Error(error.message);

  // businessIds is a join table, not a column, so it is replaced separately.
  if (data.businessIds) {
    const { error: unlinkError } = await supabase
      .from("admin_businesses")
      .delete()
      .eq("admin_id", id);
    if (unlinkError) throw new Error(unlinkError.message);

    if (data.businessIds.length > 0) {
      const { error: linkError } = await supabase
        .from("admin_businesses")
        .insert(
          data.businessIds.map((businessId) => ({
            admin_id: id,
            business_id: businessId,
          })),
        );
      if (linkError) throw new Error(linkError.message);
    }
    return getAdminById(id);
  }

  return toAdmin(row as AdminRow);
};

// Soft delete, as before. The auth user is left in place: removing it is
// destructive and belongs in Supabase's own dashboard, not behind a list row.
export const deleteAdmin = async (id: string): Promise<DeleteAdminResponse> => {
  const { error } = await supabase
    .from("admins")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return { message: "Admin deactivated." };
};

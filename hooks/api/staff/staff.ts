import { supabase } from "@/lib/supabase";
import { STAFF_SELECT, toStaff, type StaffRow } from "@/lib/mappers";
import { AuthRejectedError } from "@/lib/errors";
import type { Staff, StaffDocument } from "../../../types/staff.types.js";

export interface UpdateStaffProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AddStaffDocumentRequest {
  name: string;
  url: string;
  type: string;
}

export interface ChangeStaffPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

const requireSession = async () => {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new AuthRejectedError("Not signed in.");
  return data.session;
};

export const updateStaffProfile = async (
  data: UpdateStaffProfileRequest,
): Promise<{ message: string; staff: Staff }> => {
  const session = await requireSession();

  const columns: Record<string, unknown> = {};
  if (data.firstName !== undefined) columns.first_name = data.firstName;
  if (data.lastName !== undefined) columns.last_name = data.lastName;
  if (data.phone !== undefined) columns.phone = data.phone;

  const { data: row, error } = await supabase
    .from("staff")
    .update(columns)
    .eq("id", session.user.id)
    .select(STAFF_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return { message: "Profile updated.", staff: toStaff(row as StaffRow) };
};

export const addStaffDocument = async (
  data: AddStaffDocumentRequest,
): Promise<{ message: string; document: StaffDocument }> => {
  const session = await requireSession();

  const { data: row, error } = await supabase
    .from("staff_documents")
    .insert({
      staff_id: session.user.id,
      name: data.name,
      url: data.url,
      type: data.type,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    message: "Document added.",
    document: {
      name: row.name,
      url: row.url,
      type: row.type,
      uploadedAt: row.uploaded_at,
    },
  };
};

export const changeStaffPassword = async (
  data: ChangeStaffPasswordRequest,
): Promise<{ message: string }> => {
  const session = await requireSession();
  const email = session.user.email;
  if (!email) throw new AuthRejectedError("This account has no email address.");

  // Prove the current password before changing it, so a walk-up at an unlocked
  // screen cannot take the account over.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email,
    password: data.currentPassword,
  });
  if (reauthError) {
    throw new AuthRejectedError("Current password is incorrect.");
  }

  const { error } = await supabase.auth.updateUser({
    password: data.newPassword,
  });
  if (error) throw new Error(error.message);

  return { message: "Password updated." };
};

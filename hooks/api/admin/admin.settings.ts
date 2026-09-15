import { supabase } from "@/lib/supabase";
import { ADMIN_SELECT, toAdmin, type AdminRow } from "@/lib/mappers";
import { AuthRejectedError } from "@/lib/errors";
import type {
  UpdateAdminProfileRequest,
  UpdateAdminEmailRequest,
  UpdateAdminPasswordRequest,
  AdminSettingsResponse,
} from "@/types/admin.types";

const requireUserId = async (): Promise<string> => {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new AuthRejectedError("Not signed in.");
  return data.session.user.id;
};

// Confirms the person at the keyboard knows the current password before a
// change that would let someone else take the account over.
const reauthenticate = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new AuthRejectedError("Current password is incorrect.");
};

export const updateAdminProfile = async (
  data: UpdateAdminProfileRequest,
): Promise<AdminSettingsResponse> => {
  const id = await requireUserId();

  const columns: Record<string, unknown> = {};
  if (data.firstName !== undefined) columns.first_name = data.firstName;
  if (data.lastName !== undefined) columns.last_name = data.lastName;

  const { data: row, error } = await supabase
    .from("admins")
    .update(columns)
    .eq("id", id)
    .select(ADMIN_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return { message: "Profile updated.", admin: toAdmin(row as AdminRow) };
};

export const updateAdminEmail = async (
  data: UpdateAdminEmailRequest,
): Promise<AdminSettingsResponse> => {
  const { data: session } = await supabase.auth.getSession();
  const currentEmail = session.session?.user.email;
  if (!currentEmail) throw new AuthRejectedError("Not signed in.");

  await reauthenticate(currentEmail, data.currentPassword);

  const { error } = await supabase.auth.updateUser({ email: data.email });
  if (error) throw new Error(error.message);

  // The profile row carries its own copy of the address for display and
  // search, so it has to follow the auth record.
  const id = await requireUserId();
  const { data: row, error: rowError } = await supabase
    .from("admins")
    .update({ email: data.email })
    .eq("id", id)
    .select(ADMIN_SELECT)
    .single();

  if (rowError) throw new Error(rowError.message);

  return {
    message:
      "Email updated. Check the new address for a confirmation link if one is required.",
    admin: toAdmin(row as AdminRow),
  };
};

export const updateAdminPassword = async (
  data: UpdateAdminPasswordRequest,
): Promise<{ message: string }> => {
  if (data.newPassword !== data.confirmPassword) {
    throw new Error("New password and confirmation do not match.");
  }

  const { data: session } = await supabase.auth.getSession();
  const email = session.session?.user.email;
  if (!email) throw new AuthRejectedError("Not signed in.");

  await reauthenticate(email, data.currentPassword);

  const { error } = await supabase.auth.updateUser({
    password: data.newPassword,
  });
  if (error) throw new Error(error.message);

  return { message: "Password updated." };
};

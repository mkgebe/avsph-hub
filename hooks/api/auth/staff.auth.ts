import { supabase } from "@/lib/supabase";
import { STAFF_SELECT, toStaff, type StaffRow } from "@/lib/mappers";
import { setAuthToken, clearAuthToken } from "@/utils/api";
import { AuthRejectedError } from "@/lib/errors";
import type {
  StaffLoginRequest,
  StaffLoginResponse,
  Staff,
} from "@/types/staff.types";

// Re-export for backward compatibility (alias)
export const setStaffAuthToken = setAuthToken;

// See loadAdminProfile: the staff row is what makes a session a staff session.
const loadStaffProfile = async (userId: string): Promise<Staff> => {
  const { data, error } = await supabase
    .from("staff")
    .select(STAFF_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new AuthRejectedError("This account is not a staff account.");

  const staff = toStaff(data as StaffRow);
  if (!staff.isActive) {
    throw new AuthRejectedError("This staff account has been deactivated.");
  }
  return staff;
};

export const loginStaff = async (
  data: StaffLoginRequest,
): Promise<StaffLoginResponse> => {
  const { data: session, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) throw new AuthRejectedError(error.message);
  if (!session.session || !session.user) {
    throw new Error("Sign-in did not return a session.");
  }

  let staff: Staff;
  try {
    staff = await loadStaffProfile(session.user.id);
  } catch (profileError) {
    await supabase.auth.signOut();
    throw profileError;
  }

  setAuthToken(session.session.access_token);

  return { token: session.session.access_token, staff };
};

export const getCurrentStaff = async (): Promise<Staff> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  if (!data.session) {
    clearAuthToken();
    throw new AuthRejectedError("Not signed in.");
  }

  setAuthToken(data.session.access_token);
  return loadStaffProfile(data.session.user.id);
};

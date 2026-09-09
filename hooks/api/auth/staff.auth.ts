import { supabase } from "@/utils/supabase/client";
import { setAuthToken } from "@/utils/api";
import { toStaff } from "@/utils/supabase/mappers";
import type {
  StaffLoginRequest,
  StaffLoginResponse,
  Staff,
} from "@/types/staff.types";

// Documents are fetched separately rather than as an embedded select, for
// the same reason as in auth.ts: the Database type has no relationship
// metadata for PostgREST to infer from.
const loadStaffProfile = async (userId: string): Promise<Staff> => {
  const { data: row, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) {
    throw new Error("This account is not a staff member. Use the Admin tab to sign in.");
  }
  if (!row.is_active || row.status === "terminated") {
    throw new Error("This staff account is no longer active.");
  }

  const { data: documents, error: documentError } = await supabase
    .from("staff_documents")
    .select("*")
    .eq("staff_id", userId);

  if (documentError) throw new Error(documentError.message);

  return toStaff({ ...row, staff_documents: documents ?? [] });
};

// The Supabase client owns the real session. The cookie is still written
// because the layouts use it as a synchronous "someone is signed in" hint
// to decide whether to run the /me lookup at all.
export const setStaffAuthToken = setAuthToken;

export const loginStaff = async (
  data: StaffLoginRequest,
): Promise<StaffLoginResponse> => {
  const { data: session, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) throw new Error(error.message);
  if (!session.session || !session.user) {
    throw new Error("Sign in did not return a session. Please try again.");
  }

  try {
    const staff = await loadStaffProfile(session.user.id);
    return { token: session.session.access_token, staff };
  } catch (profileError) {
    await supabase.auth.signOut();
    throw profileError;
  }
};

export const getCurrentStaff = async (): Promise<Staff> => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Not signed in.");
  return loadStaffProfile(data.user.id);
};

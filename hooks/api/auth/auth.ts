import { supabase } from "@/utils/supabase/client";
import { setAuthToken } from "@/utils/api";
import { toAdmin } from "@/utils/supabase/mappers";
import type { Admin } from "@/types/admin.types";
import type { LoginRequest, LoginResponse, RegisterRequest } from "@/types/auth.types";

// Re-export for backward compatibility
export { setAuthToken };

// Loads the admin profile behind an authenticated session, with the
// businesses they are assigned to folded in as businessIds. The membership
// rows are fetched separately rather than as an embedded select, because
// the hand-written Database type carries no PostgREST relationship metadata.
const loadAdminProfile = async (userId: string): Promise<Admin> => {
  const { data: row, error } = await supabase
    .from("admins")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) {
    throw new Error("This account is not an admin. Use the Staff tab to sign in.");
  }
  if (!row.is_active) {
    throw new Error("This admin account has been deactivated.");
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("admin_businesses")
    .select("business_id")
    .eq("admin_id", userId);

  if (membershipError) throw new Error(membershipError.message);

  return {
    ...toAdmin(row),
    businessIds: (memberships ?? []).map((m) => m.business_id),
  };
};

export const loginAdmin = async (data: LoginRequest): Promise<LoginResponse> => {
  const { data: session, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) throw new Error(error.message);
  if (!session.session || !session.user) {
    throw new Error("Sign in did not return a session. Please try again.");
  }

  try {
    const admin = await loadAdminProfile(session.user.id);
    return { token: session.session.access_token, admin };
  } catch (profileError) {
    // Signing in succeeded but this is not a usable admin account. Drop the
    // session so the app is not left half authenticated.
    await supabase.auth.signOut();
    throw profileError;
  }
};

export const registerAdmin = async (data: RegisterRequest): Promise<Admin> => {
  // Creating an admin provisions an auth user, which needs the service role
  // key and therefore has to happen server side.
  const response = await fetch("/api/admins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await response.json();
  if (!response.ok) throw new Error(body?.error || "Registration failed.");
  return body as Admin;
};

export const getCurrentAdmin = async (): Promise<Admin> => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Not signed in.");
  return loadAdminProfile(data.user.id);
};

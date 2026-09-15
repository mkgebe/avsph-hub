import { supabase } from "@/lib/supabase";
import { ADMIN_SELECT, toAdmin, type AdminRow } from "@/lib/mappers";
import { setAuthToken, clearAuthToken } from "@/utils/api";
import { AuthRejectedError } from "@/lib/errors";
import type { Admin } from "@/types/admin.types";
import type { LoginRequest, LoginResponse, RegisterRequest } from "@/types/auth.types";

// Re-export for backward compatibility
export { setAuthToken };

// Signing in proves who you are; it does not prove you are an admin. Staff
// authenticate against the same Supabase project, so the admin profile row is
// what separates the two, and a session without one is not an admin session.
const loadAdminProfile = async (userId: string): Promise<Admin> => {
    const { data, error } = await supabase
        .from("admins")
        .select(ADMIN_SELECT)
        .eq("id", userId)
        .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new AuthRejectedError("This account is not an admin account.");

    const admin = toAdmin(data as AdminRow);
    if (!admin.isActive) {
        throw new AuthRejectedError("This admin account has been deactivated.");
    }
    return admin;
};

export const loginAdmin = async (data: LoginRequest): Promise<LoginResponse> => {
    const { data: session, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
    });

    if (error) throw new AuthRejectedError(error.message);
    if (!session.session || !session.user) throw new Error("Sign-in did not return a session.");

    let admin: Admin;
    try {
        admin = await loadAdminProfile(session.user.id);
    } catch (profileError) {
        // Leaving a half-open session behind would let the app act as if a
        // non-admin were signed in on the next page load.
        await supabase.auth.signOut();
        throw profileError;
    }

    // Mirrored into the cookie the older axios endpoints still read, so the
    // parts of the app not yet migrated keep sending a valid bearer token.
    setAuthToken(session.session.access_token);

    return { token: session.session.access_token, admin };
};

// Creating an admin means creating an auth user and its profile row. Only a
// super-admin may do the second half, which the table's RLS policy enforces.
export const registerAdmin = async (data: RegisterRequest): Promise<Admin> => {
    const { data: created, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
    });

    if (error) throw new Error(error.message);
    if (!created.user) throw new Error("Sign-up did not return a user.");

    const { data: row, error: profileError } = await supabase
        .from("admins")
        .insert({
            id: created.user.id,
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role ?? "admin",
        })
        .select(ADMIN_SELECT)
        .single();

    if (profileError) throw new Error(profileError.message);
    return toAdmin(row as AdminRow);
};

// Returns the signed-in admin, or throws if there is no session or the session
// belongs to someone who is not an admin.
export const getCurrentAdmin = async (): Promise<Admin> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    if (!data.session) {
        clearAuthToken();
        throw new AuthRejectedError("Not signed in.");
    }

    // The token refreshes in the background; keep the mirrored cookie current.
    setAuthToken(data.session.access_token);
    return loadAdminProfile(data.session.user.id);
};

export const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    clearAuthToken();
};

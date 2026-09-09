import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Bypasses RLS. Only ever called from route handlers, never from a
 * component; `server-only` above turns a client import into a build error.
 * Built per request rather than at module scope so a missing key surfaces as
 * a request error instead of breaking the build.
 */
export const getSupabaseAdmin = () => {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new AuthorizationError(
      "Supabase server credentials missing: set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY. The service role key must never reach the " +
        "browser, so it has no NEXT_PUBLIC_ prefix.",
      500,
    );
  }
  return createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

export interface CallerAdmin {
  id: string;
  role: Database["public"]["Enums"]["admin_role"];
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/**
 * Resolves the signed-in admin behind a request and checks they may act on
 * `businessId`. Route handlers run with the service role, which ignores RLS,
 * so this is the only thing standing between a caller and every business.
 */
export const requireAdmin = async (
  request: Request,
  businessId?: string,
): Promise<CallerAdmin> => {
  const supabaseAdmin = getSupabaseAdmin();
  const header = request.headers.get("authorization");
  const token = header?.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : null;

  if (!token) throw new AuthorizationError("Not signed in.", 401);

  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    throw new AuthorizationError("Session is not valid.", 401);
  }

  const { data: admin, error: adminError } = await supabaseAdmin
    .from("admins")
    .select("id, role, is_active")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (adminError) throw new AuthorizationError(adminError.message, 500);
  if (!admin || !admin.is_active) {
    throw new AuthorizationError("Admin access required.", 403);
  }

  if (businessId && admin.role !== "super-admin") {
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("admin_businesses")
      .select("business_id")
      .eq("admin_id", admin.id)
      .eq("business_id", businessId)
      .maybeSingle();

    if (membershipError) throw new AuthorizationError(membershipError.message, 500);
    if (!membership) {
      throw new AuthorizationError("No access to this business.", 403);
    }
  }

  return { id: admin.id, role: admin.role };
};

export const authorizationErrorResponse = (error: unknown): Response => {
  if (error instanceof AuthorizationError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Unexpected error.";
  return Response.json({ error: message }, { status: 500 });
};

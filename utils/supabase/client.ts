import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // These are inlined at build time. Log rather than throw, so a missing
  // value does not take the whole build down; requests then fail at runtime
  // with this message already in the console.
  const missing = [
    !SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
    !SUPABASE_PUBLISHABLE_KEY && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ]
    .filter(Boolean)
    .join(" and ");
  console.error(
    `[supabase] Not configured: ${missing} missing. Set it in .env.local for ` +
      `local development and in the deployment environment, then rebuild.`,
  );
}

// The publishable key is safe in the browser. Every table is behind RLS, so
// what a signed-in user can read and write is decided by the database.
export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL ?? "https://unconfigured.supabase.co",
  SUPABASE_PUBLISHABLE_KEY ?? "unconfigured",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
);

export default supabase;

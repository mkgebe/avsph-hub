import { createClient } from "@supabase/supabase-js";

// The database is Supabase, and the browser talks to it directly: Auth for
// sign-in, PostgREST for data. Row Level Security is what enforces who may
// read and write what, so the publishable key is safe in the bundle.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// NEXT_PUBLIC_* values are inlined at build time. Missing ones used to leave
// the app pointed at nothing, which reads as "login is broken" rather than
// "the deployment was never configured". Say so out loud instead.
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.error(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are " +
      "not both set. Sign-in cannot work until they are configured in the " +
      "deployment environment and the app is redeployed.",
  );
}

export const supabase = createClient(
  SUPABASE_URL ?? "http://unconfigured.invalid",
  SUPABASE_KEY ?? "unconfigured",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
);

export const getSupabaseUrl = (): string => SUPABASE_URL ?? "(not configured)";

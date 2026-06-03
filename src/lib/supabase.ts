import { createClient, SupabaseClient } from "@supabase/supabase-js";

/* Server-only Supabase client using the SERVICE ROLE key.
   This key bypasses Row Level Security and must NEVER be exposed to the
   browser. It is only ever imported inside API routes (server code). */

let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

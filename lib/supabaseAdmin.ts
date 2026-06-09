/**
 * supabaseAdmin.ts
 * Server-only Supabase client using the service role key.
 * Import this ONLY from API routes / server code — never from client components.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("[supabaseAdmin] Missing env var: NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("[supabaseAdmin] Missing env var: SUPABASE_SERVICE_ROLE_KEY");

  _client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  });

  return _client;
}

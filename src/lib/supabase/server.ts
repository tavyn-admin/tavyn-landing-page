import "server-only";

import { createClient } from "@supabase/supabase-js";

import { requireCp8DevelopmentTarget } from "./cp8-target";

export function createCp8SupabaseServerClient() {
  const supabaseUrl = requireCp8DevelopmentTarget(process.env);
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseSecretKey) {
    throw new Error("Missing Supabase server credential: SUPABASE_SECRET_KEY is required.");
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

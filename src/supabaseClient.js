import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const SUPABASE_SCHEMA = process.env.REACT_APP_SUPABASE_SCHEMA;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase URL or Anon Key in .env.local");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: SUPABASE_SCHEMA ? { schema: SUPABASE_SCHEMA } : undefined,
});

// Optional: export the base client too (useful if you ever need to bypass schema defaults).
export const supabaseBase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

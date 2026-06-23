import { createClient } from "@supabase/supabase-js";

// Real backend is enabled only when the env vars are present.
// Without them, the app falls back to the in-session demo (nothing breaks).
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && anon);
export const supabase = hasSupabase ? createClient(url, anon) : null;

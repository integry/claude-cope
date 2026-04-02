import { createClient } from '@supabase/supabase-js';

// We initialize a singleton Supabase client using environment variables.
// Fallbacks prevent the app from crashing if env vars are missing during local dev.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

import { createClient } from '@supabase/supabase-js';

// Access environment variables directly so Vite can replace them at build time.
// Dynamic access (process.env[key]) fails in client-side Vite builds because 'process' is not polyfilled.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Check if valid environment variables exist
export const isConfigured = 
  !!supabaseUrl && 
  supabaseUrl.trim() !== '' && 
  !!supabaseAnonKey && 
  supabaseAnonKey.trim() !== '' &&
  supabaseUrl !== 'undefined'; // catch stringified 'undefined'

if (!isConfigured) {
  console.warn('Supabase URL or Anon Key is missing. App will run in Demo Mode (Mock Authentication).');
}

// Fallback to placeholder to prevent "supabaseUrl is required" error if env vars are missing
const url = isConfigured ? supabaseUrl! : 'https://placeholder.supabase.co';
const key = isConfigured ? supabaseAnonKey! : 'placeholder';

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
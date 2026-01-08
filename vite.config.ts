import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Vercel deployment screenshot shows the environment variable named as "key"
  // We check for both API_KEY (standard) and key (user configuration)
  const apiKey = env.API_KEY || env.key;

  // Use environment variables or empty strings. 
  // Do NOT provide hardcoded dead credentials as defaults, as this causes "Failed to fetch" errors.
  const supabaseUrl = env.SUPABASE_URL || '';
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || '';

  return {
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY works in the client-side code
      'process.env.API_KEY': JSON.stringify(apiKey || ''),
      'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey)
    }
  };
});
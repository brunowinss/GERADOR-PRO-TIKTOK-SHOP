import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Check for API key in various possible locations
  // process.env takes precedence, then loaded env vars
  const apiKey = process.env.API_KEY || env.API_KEY || env.key || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  // Use environment variables or fallback to the provided user credentials.
  
  return {
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY works in the client-side code
      'process.env.API_KEY': JSON.stringify(apiKey || ''),
    }
  };
});

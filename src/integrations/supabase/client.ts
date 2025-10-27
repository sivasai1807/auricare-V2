// ============================================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================================
// This is the main Supabase client used throughout the application
//
// CONFIGURATION:
// - Uses environment variables from .env file
// - Falls back to default values if env vars not found
//
// IMPORTANT: CUSTOMIZE FOR YOUR PROJECT
// ============================================================================
// 1. Update .env file with your Supabase credentials:
//    VITE_SUPABASE_URL=https://your-project.supabase.co
//    VITE_SUPABASE_ANON_KEY=your-anon-key-here
//
// 2. NEVER commit real credentials to version control
// 3. Use .env.example as a template
// 4. The default values below are for demo purposes only
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// TODO: Replace these default values with your own Supabase credentials
// Get your credentials from: https://app.supabase.com/project/_/settings/api
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://fxkziqywoiusggfpxhpi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4a3ppcXl3b2l1c2dnZnB4aHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDA4MDUsImV4cCI6MjA3MTc3NjgwNX0.sdgMcRB5hfYcuvZdh2T8lL8T2dT3PiDuwkKZZf5YD-k";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
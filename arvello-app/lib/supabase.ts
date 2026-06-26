import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Ensure we always have a valid HTTP/HTTPS url to prevent build-time createClient crashes
const supabaseUrl = rawUrl.startsWith('http') ? rawUrl : 'https://placeholder-project-id.supabase.co';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

if (!rawUrl && typeof window !== 'undefined') {
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL in environment');
}

// Client for general public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for admin server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

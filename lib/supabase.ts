import { createClient } from '@supabase/supabase-js';

// Fallback prevents createClient from throwing during SSR pre-render at build
// time when env vars are not present. Actual queries only run in the browser
// via useEffect, so the placeholder values are never used for real requests.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'placeholder-key'
);

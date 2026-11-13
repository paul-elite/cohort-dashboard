import { createClient } from '@supabase/supabase-js';

// Publishable values: safe in the browser. Row level security decides who can write.
const URL = import.meta.env.VITE_SUPABASE_URL || 'https://evvxsiycbethbqnimtth.supabase.co';
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_FjIrjXxB5tzLdgjkSccJcA_huGPIb41';

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
});

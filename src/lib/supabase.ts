import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export async function probeSupabaseStatus(): Promise<{
  configured: boolean;
  tablesReady: boolean;
  error?: string;
}> {
  if (!supabase) {
    return { configured: false, tablesReady: false };
  }

  try {
    const { error } = await supabase.from('departments').select('id').limit(1);
    if (error) {
      return { configured: true, tablesReady: false, error: error.message };
    }
    return { configured: true, tablesReady: true };
  } catch (err: any) {
    return { configured: true, tablesReady: false, error: err.message };
  }
}

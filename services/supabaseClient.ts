
import { createClient } from '@supabase/supabase-js';

// These environment variables are assumed to be injected by the environment
const supabaseUrl = (process.env as any).SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = (process.env as any).SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

import { createClient } from '@supabase/supabase-js';
import { config, configurationReady } from './config';
import { sessionStorage } from './storage';
import type { Database } from '@/types/database';

export const supabase = configurationReady ? createClient<Database>(config.projectUrl, config.publicKey, {
  auth: { storage: sessionStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce' },
}) : null;

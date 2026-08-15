import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

/**
 * Loose database typing for pragmatic development.
 * For production type-safety, replace with generated types from
 * `supabase gen types typescript` (see supabase/schema.sql).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;

export interface Db {
  admin: SupabaseClient<Database>;
  public: SupabaseClient<Database>;
  isConfigured: boolean;
}

export function createDb(): Db {
  const isConfigured = Boolean(config.supabase.url && config.supabase.serviceKey);

  if (!isConfigured) {
    console.warn('[db] Supabase not configured — database operations will be unavailable.');
  }

  const options = { auth: { persistSession: false } };

  // createClient requires a non-empty URL; use a placeholder when unconfigured
  // since the clients are never actually called in that state.
  const url = config.supabase.url || 'https://placeholder.supabase.co';
  const key = config.supabase.anonKey || config.supabase.serviceKey || 'placeholder-key';

  const publicClient = createClient<Database>(url, key, options);
  const adminClient = createClient<Database>(url, config.supabase.serviceKey || key, options);

  return {
    admin: adminClient,
    public: publicClient,
    isConfigured,
  };
}

export const db = createDb();

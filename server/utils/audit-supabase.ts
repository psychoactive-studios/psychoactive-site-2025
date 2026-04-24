/**
 * Design Audit — Supabase client for the CRM.
 *
 * Lead data from the audit flow lands in the Psychoactive CRM's
 * Supabase project (same DB that powers the lead pipeline). We use the
 * service_role key so this ONLY runs server-side; the key never touches
 * the client bundle.
 *
 * Lazy-instantiated so Nitro doesn't crash on boot when the env vars
 * are missing (e.g. during initial local setup).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getAuditSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const config = useRuntimeConfig();
  const url = config.supabaseCrmUrl;
  const key = config.supabaseCrmServiceKey;

  if (!url || !key) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Supabase CRM credentials are not configured. Set SUPABASE_CRM_URL and SUPABASE_CRM_SERVICE_KEY.',
    });
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return cachedClient;
}

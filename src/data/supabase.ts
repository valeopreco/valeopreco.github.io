import type { SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** A nuvem só existe quando as duas variáveis públicas estão definidas. */
export const cloudEnabled = Boolean(url && anonKey);

let client: Promise<SupabaseClient> | null = null;

/**
 * Cliente público, carregado sob demanda (visitantes não baixam a biblioteca).
 * Usa SOMENTE a chave anon; a segurança vem do RLS no banco.
 * A service_role key nunca deve existir no frontend nem em variáveis VITE_*.
 */
export function getSupabase(): Promise<SupabaseClient> | null {
  if (!cloudEnabled) return null;
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
    }),
  );
  return client;
}

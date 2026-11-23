import type { SupabaseClient } from '@supabase/supabase-js';
import type { Repository } from '../repositories/types';
import { exportBundleSchema } from '@/lib/schemas';

/** Quanto o visitante tem guardado no aparelho. */
export async function guestDataCount(local: Repository): Promise<number> {
  const [e, g, r] = await Promise.all([local.listEvaluations(), local.listGoals(), local.listOwnReferences()]);
  const s = await local.getSettings();
  return e.length + g.length + r.length + (s.financial ? 1 : 0);
}

/**
 * Envia os dados do visitante para a conta em uma única chamada RPC.
 * Idempotente: IDs já existentes são ignorados no servidor, então repetir não duplica.
 * Os dados locais só são apagados depois da confirmação do servidor.
 */
export async function migrateGuestData(sb: SupabaseClient, local: Repository): Promise<{ imported: number }> {
  const bundle = exportBundleSchema.parse(await local.exportAll());
  const { data, error } = await sb.rpc('import_guest_data', { payload: bundle });
  if (error) throw new Error('Não foi possível levar seus dados para a conta agora. Eles continuam no aparelho.');
  await local.clearAll();
  return { imported: Number(data ?? 0) };
}

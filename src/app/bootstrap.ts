import { LocalRepository } from '@/data/repositories/localRepo';
import { MemoryRepository } from '@/data/repositories/memoryRepo';
import type { Repository } from '@/data/repositories/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '@/data/supabase';
import { useApp } from '@/stores/app';

let localRepo: Repository | null = null;

/** Repositório do aparelho; cai para memória se o navegador bloquear o IndexedDB. */
export async function getLocalRepo(): Promise<Repository> {
  if (localRepo) return localRepo;
  try {
    const r = new LocalRepository();
    await r.open();
    localRepo = r;
  } catch (e) {
    console.warn('IndexedDB indisponível; usando memória.', e);
    localRepo = new MemoryRepository();
  }
  return localRepo;
}

async function useLocal() {
  const r = await getLocalRepo();
  useApp.getState().setRepo(r, r.kind === 'local' ? 'local' : 'memory');
}

export async function bootstrap() {
  const pending = getSupabase();
  if (!pending) return useLocal();
  let supabase: SupabaseClient;
  try {
    supabase = await pending;
  } catch (e) {
    console.warn('Supabase indisponível; seguindo só no aparelho.', e);
    return useLocal();
  }
  const { CloudRepository } = await import('@/data/repositories/cloudRepo');
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (user) useApp.getState().setRepo(new CloudRepository(supabase, user.id), 'cloud', user.email ?? null);
  else await useLocal();

  supabase.auth.onAuthStateChange((_event, session) => {
    const u = session?.user;
    const cur = useApp.getState();
    if (u && (cur.mode !== 'cloud' || cur.userEmail !== (u.email ?? null))) {
      cur.setRepo(new CloudRepository(supabase, u.id), 'cloud', u.email ?? null);
    } else if (!u && cur.mode === 'cloud') {
      void useLocal();
    }
  });
}

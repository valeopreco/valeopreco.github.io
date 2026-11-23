import { useEffect, useState } from 'react';
import type { Repository } from '@/data/repositories/types';
import { useApp } from '@/stores/app';

type State<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error'; message: string };

/** Lê do repositório atual e recarrega a cada escrita (dataVersion). */
export function useRepoQuery<T>(fn: (r: Repository) => Promise<T>, deps: unknown[] = []): State<T> {
  const repo = useApp((s) => s.repo);
  const version = useApp((s) => s.dataVersion);
  const [state, setState] = useState<State<T>>({ status: 'loading' });

  useEffect(() => {
    if (!repo) return;
    let alive = true;
    fn(repo)
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((e: unknown) => {
        if (!alive) return;
        console.error(e);
        setState({ status: 'error', message: e instanceof Error && e.message ? e.message : 'Algo deu errado.' });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, version, ...deps]);

  return state;
}

/** Executa uma escrita, avisa as telas e mostra erro amigável se falhar. */
export async function mutate(fn: (r: Repository) => Promise<void>, success?: string): Promise<boolean> {
  const { repo, bump, toast } = useApp.getState();
  if (!repo) return false;
  try {
    await fn(repo);
    bump();
    if (success) toast(success);
    return true;
  } catch (e) {
    console.error(e);
    toast(e instanceof Error && e.message.length < 140 ? e.message : 'Não foi possível salvar. Tente de novo.', 'error');
    return false;
  }
}

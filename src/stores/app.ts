import { create } from 'zustand';
import type { Repository } from '@/data/repositories/types';

export type StorageMode = 'loading' | 'local' | 'memory' | 'cloud';

interface Toast {
  id: number;
  message: string;
  tone: 'neutral' | 'error';
}

interface AppState {
  repo: Repository | null;
  mode: StorageMode;
  userEmail: string | null;
  /** Incrementa a cada escrita; telas recarregam dados quando muda. */
  dataVersion: number;
  toasts: Toast[];
  setRepo(repo: Repository, mode: StorageMode, userEmail?: string | null): void;
  bump(): void;
  toast(message: string, tone?: Toast['tone']): void;
  dismiss(id: number): void;
}

let toastSeq = 0;

export const useApp = create<AppState>((set) => ({
  repo: null,
  mode: 'loading',
  userEmail: null,
  dataVersion: 0,
  toasts: [],
  setRepo: (repo, mode, userEmail = null) => set((s) => ({ repo, mode, userEmail, dataVersion: s.dataVersion + 1 })),
  bump: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
  toast: (message, tone = 'neutral') => {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Repositório pronto ou erro claro (só usado depois do bootstrap). */
export function repo(): Repository {
  const r = useApp.getState().repo;
  if (!r) throw new Error('Armazenamento ainda não iniciado.');
  return r;
}

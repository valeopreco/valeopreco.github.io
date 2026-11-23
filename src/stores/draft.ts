import { create } from 'zustand';
import type { CategorySlug, Frequency } from '@vale/engine';

/** Rascunho do formulário: sobrevive à ida ao perfil e volta. */
export interface DraftForm {
  price: string;
  description: string;
  category?: CategorySlug;
  frequencyKind: Frequency['kind'] | '';
  frequencyTimes: string;
  uses: string;
}

const empty: DraftForm = { price: '', description: '', frequencyKind: '', frequencyTimes: '1', uses: '' };

interface DraftState {
  form: DraftForm;
  detailsOpen: boolean;
  /** Avaliação em exibição na tela de resultado; null = ainda não avaliado. */
  submitted: boolean;
  /** ID gerado ao salvar; enquanto null, o resultado é recalculado ao vivo. */
  savedId: string | null;
  update(p: Partial<DraftForm>): void;
  setDetailsOpen(v: boolean): void;
  submit(): void;
  markSaved(id: string): void;
  reset(): void;
}

export const useDraft = create<DraftState>((set) => ({
  form: empty,
  detailsOpen: false,
  submitted: false,
  savedId: null,
  update: (p) => set((s) => ({ form: { ...s.form, ...p }, savedId: null })),
  setDetailsOpen: (detailsOpen) => set({ detailsOpen }),
  submit: () => set({ submitted: true, savedId: null }),
  markSaved: (savedId) => set({ savedId }),
  reset: () => set({ form: empty, detailsOpen: false, submitted: false, savedId: null }),
}));

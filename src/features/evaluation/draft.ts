import { evaluate, parseBRL, type EvaluationContext, type EvaluationInput, type Frequency } from '@vale/engine';
import type { DraftForm } from '@/stores/draft';
import type { Repository } from '@/data/repositories/types';
import type { SavedEvaluation } from '@/data/models';
import { newId } from '@/data/models';
import { SEED_REFERENCES } from '@/data/seedReferences';

export type DraftErrors = Partial<Record<'price' | 'frequencyTimes' | 'uses', string>>;

function parseIntField(v: string): number | null {
  const t = v.trim();
  if (!/^\d+$/.test(t)) return null;
  return Number(t);
}

/** Converte o formulário em entrada do motor. Campos vazios ficam ausentes, nunca inventados. */
export function draftToInput(f: DraftForm): { input?: EvaluationInput; errors: DraftErrors } {
  const errors: DraftErrors = {};
  const price = parseBRL(f.price);
  if (!f.price.trim()) errors.price = 'Informe o preço para avaliar.';
  else if (price === null || price <= 0) errors.price = 'Use só números, como 300 ou 1.299,90.';
  else if (price > 100_000_000_00) errors.price = 'Esse valor passa do limite aceito.';

  let frequency: Frequency | undefined;
  if (f.frequencyKind === 'weekly' || f.frequencyKind === 'monthly') {
    const t = parseIntField(f.frequencyTimes);
    if (t === null || t < 1 || t > 100) errors.frequencyTimes = 'Use um número inteiro entre 1 e 100.';
    else frequency = { kind: f.frequencyKind, times: t };
  } else if (f.frequencyKind) {
    frequency = { kind: f.frequencyKind };
  }

  let uses: number | undefined;
  if (f.uses.trim()) {
    const u = parseIntField(f.uses);
    if (u === null || u < 1 || u > 100_000) errors.uses = 'Use um número inteiro entre 1 e 100.000.';
    else uses = u;
  }

  if (Object.keys(errors).length) return { errors };
  const input: EvaluationInput = { priceCents: price! };
  const d = f.description.trim().slice(0, 120);
  if (d) input.description = d;
  if (f.category) input.categorySlug = f.category;
  if (frequency) input.frequency = frequency;
  if (uses) input.estimatedUses = uses;
  return { input, errors };
}

/** Monta o contexto atual: perfil, metas e referências (padrão + próprias). */
export async function loadContext(repo: Repository): Promise<EvaluationContext> {
  const [settings, goals, own] = await Promise.all([repo.getSettings(), repo.listGoals(), repo.listOwnReferences()]);
  const ctx: EvaluationContext = { goals, references: [...SEED_REFERENCES, ...own] };
  if (settings.financial) ctx.financial = settings.financial;
  return ctx;
}

/** Congela parâmetros e resultado. Avaliações salvas nunca são recalculadas. */
export function buildSaved(input: EvaluationInput, ctx: EvaluationContext): SavedEvaluation {
  const result = evaluate(input, ctx);
  const activeGoals = (ctx.goals ?? []).filter((g) => g.active).map(({ id, name, targetCents, currentCents, active }) => ({
    id,
    name,
    targetCents,
    active,
    ...(currentCents ? { currentCents } : {}),
  }));
  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    input,
    snapshot: {
      engineVersion: result.engineVersion,
      parameters: { input, goals: activeGoals, ...(ctx.financial ? { financial: ctx.financial } : {}) },
      result,
    },
    decisions: [],
  };
}

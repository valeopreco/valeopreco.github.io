import type { EvaluationInput, EvaluationResult, FinancialProfile, Goal, PriceReference } from '@vale/engine';

export type DecisionKind = 'comprar' | 'esperar' | 'desistir';

export interface Decision {
  id: string;
  decision: DecisionKind;
  note?: string;
  createdAt: string;
}

/** Parâmetros e resultado congelados no momento da avaliação. Nunca recalculados. */
export interface EvaluationSnapshot {
  engineVersion: string;
  parameters: {
    input: EvaluationInput;
    financial?: FinancialProfile;
    goals: Goal[];
  };
  result: EvaluationResult;
}

export interface SavedEvaluation {
  id: string;
  createdAt: string;
  input: EvaluationInput;
  snapshot: EvaluationSnapshot;
  /** Da mais antiga para a mais recente; a última é a decisão atual. */
  decisions: Decision[];
}

export interface StoredGoal extends Goal {
  deadline?: string;
  createdAt: string;
}

export interface Settings {
  financial?: FinancialProfile;
  displayName?: string;
}

export type OwnReference = PriceReference;

export interface ExportBundle {
  app: 'VALE?';
  exportedAt: string;
  settings: Settings;
  goals: StoredGoal[];
  references: OwnReference[];
  evaluations: SavedEvaluation[];
}

export function currentDecision(e: SavedEvaluation): Decision | undefined {
  return e.decisions.at(-1);
}

export function newId(): string {
  const c: Crypto = globalThis.crypto;
  if (typeof c.randomUUID === 'function') return c.randomUUID();
  // Fallback para contextos sem randomUUID (http local antigo).
  const b = new Uint8Array(16);
  c.getRandomValues(b);
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

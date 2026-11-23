import type { Decision, ExportBundle, OwnReference, SavedEvaluation, Settings, StoredGoal } from '../models';

/**
 * Contrato único de acesso a dados. A interface não sabe se os dados estão
 * no aparelho (visitante) ou no Supabase (conta).
 */
export interface Repository {
  readonly kind: 'local' | 'memory' | 'cloud';

  getSettings(): Promise<Settings>;
  saveSettings(s: Settings): Promise<void>;

  listGoals(): Promise<StoredGoal[]>;
  saveGoal(g: StoredGoal): Promise<void>;
  deleteGoal(id: string): Promise<void>;

  listOwnReferences(): Promise<OwnReference[]>;
  saveOwnReference(r: OwnReference): Promise<void>;
  deleteOwnReference(id: string): Promise<void>;

  listEvaluations(): Promise<SavedEvaluation[]>;
  getEvaluation(id: string): Promise<SavedEvaluation | undefined>;
  saveEvaluation(e: SavedEvaluation): Promise<void>;
  addDecision(evaluationId: string, d: Decision): Promise<void>;
  deleteEvaluation(id: string): Promise<void>;

  exportAll(): Promise<ExportBundle>;
  clearAll(): Promise<void>;
}

export async function buildExport(r: Repository): Promise<ExportBundle> {
  const [settings, goals, references, evaluations] = await Promise.all([
    r.getSettings(),
    r.listGoals(),
    r.listOwnReferences(),
    r.listEvaluations(),
  ]);
  return { app: 'VALE?', exportedAt: new Date().toISOString(), settings, goals, references, evaluations };
}

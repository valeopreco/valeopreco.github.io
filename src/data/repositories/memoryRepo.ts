import type { Decision, OwnReference, SavedEvaluation, Settings, StoredGoal } from '../models';
import { buildExport, type Repository } from './types';

const clone = <T,>(v: T): T => structuredClone(v);

/** Usado quando o navegador bloqueia armazenamento (aba privada, iframe) e nos testes. */
export class MemoryRepository implements Repository {
  readonly kind = 'memory' as const;
  private settings: Settings = {};
  private goals = new Map<string, StoredGoal>();
  private refs = new Map<string, OwnReference>();
  private evals = new Map<string, SavedEvaluation>();

  async getSettings() {
    return clone(this.settings);
  }
  async saveSettings(s: Settings) {
    this.settings = clone(s);
  }
  async listGoals() {
    return [...this.goals.values()].map(clone).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  async saveGoal(g: StoredGoal) {
    this.goals.set(g.id, clone(g));
  }
  async deleteGoal(id: string) {
    this.goals.delete(id);
  }
  async listOwnReferences() {
    return [...this.refs.values()].map(clone);
  }
  async saveOwnReference(r: OwnReference) {
    this.refs.set(r.id, clone(r));
  }
  async deleteOwnReference(id: string) {
    this.refs.delete(id);
  }
  async listEvaluations() {
    return [...this.evals.values()].map(clone).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async getEvaluation(id: string) {
    const e = this.evals.get(id);
    return e && clone(e);
  }
  async saveEvaluation(e: SavedEvaluation) {
    this.evals.set(e.id, clone(e));
  }
  async addDecision(evaluationId: string, d: Decision) {
    const e = this.evals.get(evaluationId);
    if (!e) throw new Error('Avaliação não encontrada.');
    e.decisions.push(clone(d));
  }
  async deleteEvaluation(id: string) {
    this.evals.delete(id);
  }
  exportAll() {
    return buildExport(this);
  }
  async clearAll() {
    this.settings = {};
    this.goals.clear();
    this.refs.clear();
    this.evals.clear();
  }
}

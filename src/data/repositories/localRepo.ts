import Dexie, { type Table } from 'dexie';
import type { Decision, OwnReference, SavedEvaluation, Settings, StoredGoal } from '../models';
import { buildExport, type Repository } from './types';

interface KV {
  key: string;
  value: unknown;
}

class ValeDB extends Dexie {
  evaluations!: Table<SavedEvaluation, string>;
  goals!: Table<StoredGoal, string>;
  references!: Table<OwnReference, string>;
  kv!: Table<KV, string>;

  constructor() {
    super('vale');
    this.version(1).stores({
      evaluations: 'id, createdAt',
      goals: 'id, createdAt',
      references: 'id',
      kv: 'key',
    });
  }
}

/** Armazenamento do visitante, no IndexedDB do próprio aparelho. */
export class LocalRepository implements Repository {
  readonly kind = 'local' as const;
  private db = new ValeDB();

  /** Lança erro se o navegador bloquear o IndexedDB. */
  async open() {
    await this.db.open();
    await this.db.kv.get('settings');
  }

  async getSettings() {
    return ((await this.db.kv.get('settings'))?.value as Settings | undefined) ?? {};
  }
  async saveSettings(s: Settings) {
    await this.db.kv.put({ key: 'settings', value: s });
  }
  listGoals() {
    return this.db.goals.orderBy('createdAt').toArray();
  }
  async saveGoal(g: StoredGoal) {
    await this.db.goals.put(g);
  }
  deleteGoal(id: string) {
    return this.db.goals.delete(id);
  }
  listOwnReferences() {
    return this.db.references.toArray();
  }
  async saveOwnReference(r: OwnReference) {
    await this.db.references.put(r);
  }
  deleteOwnReference(id: string) {
    return this.db.references.delete(id);
  }
  listEvaluations() {
    return this.db.evaluations.orderBy('createdAt').reverse().toArray();
  }
  getEvaluation(id: string) {
    return this.db.evaluations.get(id);
  }
  async saveEvaluation(e: SavedEvaluation) {
    await this.db.evaluations.put(e);
  }
  async addDecision(evaluationId: string, d: Decision) {
    await this.db.transaction('rw', this.db.evaluations, async () => {
      const e = await this.db.evaluations.get(evaluationId);
      if (!e) throw new Error('Avaliação não encontrada.');
      e.decisions.push(d);
      await this.db.evaluations.put(e);
    });
  }
  deleteEvaluation(id: string) {
    return this.db.evaluations.delete(id);
  }
  exportAll() {
    return buildExport(this);
  }
  async clearAll() {
    await this.db.transaction('rw', [this.db.evaluations, this.db.goals, this.db.references, this.db.kv], async () => {
      await Promise.all([this.db.evaluations.clear(), this.db.goals.clear(), this.db.references.clear(), this.db.kv.clear()]);
    });
  }
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { CategorySlug, EvaluationInput, Frequency } from '@vale/engine';
import type { Decision, DecisionKind, OwnReference, SavedEvaluation, Settings, StoredGoal } from '../models';
import { buildExport, type Repository } from './types';

/** Mensagem genérica: nunca repassa detalhes do banco para a interface. */
class CloudError extends Error {
  constructor(public cause: unknown) {
    super('Não foi possível falar com a nuvem agora. Tente de novo em instantes.');
  }
}
function check<T>(res: { data: T; error: unknown }): T {
  if (res.error) throw new CloudError(res.error);
  return res.data;
}

interface EvalRow {
  id: string;
  descricao: string | null;
  preco_cents: number;
  categoria_slug: CategorySlug | null;
  frequencia: Frequency | null;
  usos_estimados: number | null;
  created_at: string;
  evaluation_snapshots: { parametros: SavedEvaluation['snapshot']['parameters']; resultados: SavedEvaluation['snapshot']['result']; versao_motor: string } | null;
  decisions: { id: string; decisao: DecisionKind; observacao: string | null; created_at: string }[];
}

function toEvaluation(r: EvalRow): SavedEvaluation {
  const input: EvaluationInput = { priceCents: r.preco_cents };
  if (r.descricao) input.description = r.descricao;
  if (r.categoria_slug) input.categorySlug = r.categoria_slug;
  if (r.frequencia) input.frequency = r.frequencia;
  if (r.usos_estimados) input.estimatedUses = r.usos_estimados;
  const s = r.evaluation_snapshots;
  return {
    id: r.id,
    createdAt: r.created_at,
    input,
    snapshot: s
      ? { engineVersion: s.versao_motor, parameters: s.parametros, result: s.resultados }
      : (() => {
          throw new CloudError('snapshot ausente');
        })(),
    decisions: [...r.decisions]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((d) => ({ id: d.id, decision: d.decisao, createdAt: d.created_at, ...(d.observacao ? { note: d.observacao } : {}) })),
  };
}

/** Dados da conta no Supabase. Toda leitura e escrita passa pelo RLS. */
export class CloudRepository implements Repository {
  readonly kind = 'cloud' as const;
  constructor(private sb: SupabaseClient, private userId: string) {}

  async getSettings(): Promise<Settings> {
    const [p, f] = await Promise.all([
      this.sb.from('profiles').select('nome').eq('id', this.userId).maybeSingle(),
      this.sb.from('financial_profiles').select('renda_liquida_cents, horas_mensais, dias_mensais').eq('user_id', this.userId).maybeSingle(),
    ]);
    const prof = check(p);
    const fin = check(f);
    const s: Settings = {};
    if (prof?.nome) s.displayName = prof.nome;
    if (fin) {
      s.financial = { netIncomeCents: Number(fin.renda_liquida_cents), monthlyHours: Number(fin.horas_mensais) };
      if (fin.dias_mensais) s.financial.workDaysPerMonth = fin.dias_mensais;
    }
    return s;
  }

  async saveSettings(s: Settings) {
    check(await this.sb.from('profiles').upsert({ id: this.userId, nome: s.displayName ?? null }));
    if (s.financial) {
      check(
        await this.sb.from('financial_profiles').upsert({
          user_id: this.userId,
          renda_liquida_cents: s.financial.netIncomeCents,
          horas_mensais: s.financial.monthlyHours,
          dias_mensais: s.financial.workDaysPerMonth ?? null,
        }),
      );
    } else {
      check(await this.sb.from('financial_profiles').delete().eq('user_id', this.userId));
    }
  }

  async listGoals(): Promise<StoredGoal[]> {
    const rows = check(await this.sb.from('goals').select('*').order('created_at'));
    return (rows ?? []).map((g) => ({
      id: g.id,
      name: g.nome,
      targetCents: Number(g.valor_alvo_cents),
      ...(g.valor_atual_cents ? { currentCents: Number(g.valor_atual_cents) } : {}),
      ...(g.prazo ? { deadline: g.prazo } : {}),
      active: g.ativo,
      createdAt: g.created_at,
    }));
  }
  async saveGoal(g: StoredGoal) {
    check(
      await this.sb.from('goals').upsert({
        id: g.id,
        nome: g.name,
        valor_alvo_cents: g.targetCents,
        valor_atual_cents: g.currentCents ?? null,
        prazo: g.deadline ?? null,
        ativo: g.active,
        created_at: g.createdAt,
      }),
    );
  }
  async deleteGoal(id: string) {
    check(await this.sb.from('goals').delete().eq('id', id));
  }

  async listOwnReferences(): Promise<OwnReference[]> {
    const rows = check(await this.sb.from('price_references').select('*').eq('user_id', this.userId));
    return (rows ?? []).map(rowToReference);
  }
  async saveOwnReference(r: OwnReference) {
    check(
      await this.sb.from('price_references').upsert({
        id: r.id,
        user_id: this.userId,
        singular: r.singular,
        plural: r.plural,
        categoria_slug: r.categorySlug,
        preco_cents: r.priceCents,
        fonte: r.source,
        atualizado_em: r.updatedAt,
        universal: r.universal,
        estimado: r.estimated,
        ativo: r.active,
      }),
    );
  }
  async deleteOwnReference(id: string) {
    check(await this.sb.from('price_references').delete().eq('id', id).eq('user_id', this.userId));
  }

  private evalSelect = '*, evaluation_snapshots(parametros, resultados, versao_motor), decisions(id, decisao, observacao, created_at)';

  async listEvaluations() {
    const rows = check(await this.sb.from('evaluations').select(this.evalSelect).order('created_at', { ascending: false }).limit(500));
    return ((rows ?? []) as unknown as EvalRow[]).map(toEvaluation);
  }
  async getEvaluation(id: string) {
    const row = check(await this.sb.from('evaluations').select(this.evalSelect).eq('id', id).maybeSingle());
    return row ? toEvaluation(row as unknown as EvalRow) : undefined;
  }
  async saveEvaluation(e: SavedEvaluation) {
    check(
      await this.sb.from('evaluations').upsert({
        id: e.id,
        descricao: e.input.description ?? null,
        preco_cents: e.input.priceCents,
        categoria_slug: e.input.categorySlug ?? null,
        frequencia: e.input.frequency ?? null,
        usos_estimados: e.input.estimatedUses ?? null,
        created_at: e.createdAt,
      }),
    );
    // Snapshot é imutável: só insere, nunca atualiza.
    check(
      await this.sb.from('evaluation_snapshots').upsert(
        { evaluation_id: e.id, parametros: e.snapshot.parameters, resultados: e.snapshot.result, versao_motor: e.snapshot.engineVersion },
        { onConflict: 'evaluation_id', ignoreDuplicates: true },
      ),
    );
    for (const d of e.decisions) await this.addDecision(e.id, d);
  }
  async addDecision(evaluationId: string, d: Decision) {
    check(
      await this.sb
        .from('decisions')
        .upsert(
          { id: d.id, evaluation_id: evaluationId, decisao: d.decision, observacao: d.note ?? null, created_at: d.createdAt },
          { onConflict: 'id', ignoreDuplicates: true },
        ),
    );
  }
  async deleteEvaluation(id: string) {
    check(await this.sb.from('evaluations').delete().eq('id', id));
  }

  exportAll() {
    return buildExport(this);
  }
  async clearAll() {
    check(await this.sb.from('evaluations').delete().eq('user_id', this.userId));
    check(await this.sb.from('goals').delete().eq('user_id', this.userId));
    check(await this.sb.from('price_references').delete().eq('user_id', this.userId));
    check(await this.sb.from('financial_profiles').delete().eq('user_id', this.userId));
  }
}

function rowToReference(r: Record<string, unknown>): OwnReference {
  return {
    id: String(r.id),
    singular: String(r.singular),
    plural: String(r.plural),
    categorySlug: r.categoria_slug as CategorySlug,
    priceCents: Number(r.preco_cents),
    source: String(r.fonte),
    updatedAt: String(r.atualizado_em),
    universal: Boolean(r.universal),
    estimated: Boolean(r.estimado),
    active: Boolean(r.ativo),
  };
}

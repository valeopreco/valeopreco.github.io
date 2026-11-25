import { formatBRL, formatPct, frequencyLabel, type EquivalenceItem, type EvaluationInput, type EvaluationResult } from '@vale/engine';
import { categoryName } from '@/lib/categories';
import { copy } from '@/content/copy';
import { EstimateTag, InsightCard, MoneyValue, SetupCard, SourceNote } from '@/components/vale/bits';

const dateBR = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR');
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const monthBR = (yyyyMm: string) => `${MESES.at(Number(yyyyMm.slice(5, 7)) - 1)}/${yyyyMm.slice(0, 4)}`;

/** Uma linha por fonte + aviso único de correção pela inflação. */
function sourcesNote(items: EquivalenceItem[]): string {
  const fontes = [...new Set(items.map((i) => `${i.source}, conferido em ${dateBR(i.updatedAt)}`))].join('; ');
  const indices = [...new Set(items.flatMap((i) => (i.adjustment ? [i.adjustment.index] : [])))];
  const correcao = indices.length ? ` Itens marcados foram corrigidos pela inflação (${indices.join(' e ')}).` : '';
  return `Preços de referência: ${fontes}.${correcao}`;
}

function Summary({ input }: { input: EvaluationInput }) {
  const meta = [categoryName(input.categorySlug), input.frequency ? frequencyLabel(input.frequency) : undefined].filter(Boolean);
  return (
    <div className="mb-2">
      <p className="text-[15px] font-semibold text-muted">{input.description || 'Sua compra'}</p>
      <p className="num mt-1 text-[44px] font-semibold leading-none tracking-[-0.03em] sm:text-[52px]">{formatBRL(input.priceCents)}</p>
      {meta.length > 0 && <p className="mt-2 text-[14px] text-muted">{meta.join(' · ')}</p>}
    </div>
  );
}

/** Barra horizontal simples, proporcional ao maior valor do grupo. */
function Bar({ label, cents, max, strong }: { label: string; cents: number; max: number; strong?: boolean }) {
  const pct = Math.max(1.5, (cents / max) * 100);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-[14px]">
        <span className={strong ? 'font-semibold' : 'text-muted'}>{label}</span>
        <MoneyValue cents={cents} className={strong ? 'text-[16px]' : 'text-[14px] text-muted'} />
      </div>
      <div className="h-2.5 rounded-full bg-gray-warm">
        <div className={`h-full rounded-full ${strong ? 'bg-lime-dark' : 'bg-[color-mix(in_oklch,var(--vale-lime-dark)_45%,var(--vale-gray))]'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface Props {
  input: EvaluationInput;
  result: EvaluationResult;
  /** live = avaliação atual (mostra convites para configurar); snapshot = registro congelado. */
  mode: 'live' | 'snapshot';
}

export function ResultView({ input, result, mode }: Props) {
  const { workTime, equivalences, recurrence, costPerUse, goals } = result;

  return (
    <div className="flex flex-col gap-4">
      <Summary input={input} />

      {workTime.available ? (
        <InsightCard icon="clock" question={copy.q.workTime}>
          <p className="font-display text-[30px] font-semibold leading-tight tracking-[-0.02em]">{workTime.data.label}</p>
          <p className="mt-1 text-[15px]">do seu trabalho{workTime.data.daysLabel ? `, ou ${workTime.data.daysLabel}` : ''}.</p>
          <SourceNote>
            Calculado com {formatBRL(workTime.data.hourlyRateCents)} por hora (renda líquida dividida pelas horas trabalhadas no mês).
          </SourceNote>
        </InsightCard>
      ) : (
        mode === 'live' && <SetupCard icon="clock" question={copy.q.workTime} text={copy.setup.workTime} to="/perfil?voltar=resultado" cta={copy.setup.workTimeCta} />
      )}

      {equivalences.available && (
        <InsightCard icon="scale" question={copy.q.equivalences} tag={equivalences.data.items.some((i) => i.estimated) ? <EstimateTag /> : undefined}>
          <ul className="flex flex-col divide-y divide-[var(--vale-line)]">
            {equivalences.data.items.map((i) => (
              <li key={i.refId} className="flex items-baseline gap-4 py-2.5 first:pt-0 last:pb-0">
                <span className="num min-w-[3.2ch] text-right text-[28px] font-semibold leading-none">{i.quantity.toLocaleString('pt-BR')}</span>
                <span className="text-[15px] leading-snug">
                  {i.label}
                  <span className="block text-[13px] text-muted">
                    a {formatBRL(i.unitPriceCents)} cada
                    {i.adjustment && <span className="whitespace-nowrap"> · corrigido até {monthBR(i.adjustment.through)}</span>}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <SourceNote>{sourcesNote(equivalences.data.items)}</SourceNote>
        </InsightCard>
      )}

      {recurrence.available && (
        <InsightCard icon="repeat" question={copy.q.recurrence}>
          <p className="num text-[30px] font-semibold leading-tight tracking-[-0.02em]">{formatBRL(recurrence.data.yearlyCents)}</p>
          <p className="mt-1 text-[15px]">
            em um ano, comprando {recurrence.data.frequencyLabel} ({recurrence.data.occurrencesPerYear.toLocaleString('pt-BR')} vezes).
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <Bar label="Cada vez" cents={input.priceCents} max={recurrence.data.yearlyCents} />
            <Bar label="Por mês, em média" cents={recurrence.data.monthlyAverageCents} max={recurrence.data.yearlyCents} />
            <Bar label="Em um ano" cents={recurrence.data.yearlyCents} max={recurrence.data.yearlyCents} strong />
          </div>
        </InsightCard>
      )}

      {costPerUse.available && (
        <InsightCard icon="ticket" question={copy.q.costPerUse} tag={<EstimateTag>sua estimativa</EstimateTag>}>
          <p className="text-[15px]">
            <MoneyValue cents={costPerUse.data.cents} className="text-[30px] tracking-[-0.02em]" /> <span>por uso</span>
          </p>
          <SourceNote>{copy.costPerUseNote(costPerUse.data.uses)}</SourceNote>
        </InsightCard>
      )}

      {goals.available ? (
        <InsightCard icon="target" question={copy.q.goals}>
          <ul className="flex flex-col gap-4">
            {goals.data.items.map((g) => (
              <li key={g.goalId}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-[15px] font-semibold">{g.name}</span>
                  <span className="num text-[20px] font-semibold">{formatPct(g.pctOfTarget)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-warm" role="img" aria-label={`${formatPct(g.pctOfTarget)} do valor da meta`}>
                  <div className="h-full rounded-full bg-lime-dark" style={{ width: `${Math.min(100, Math.max(1.5, g.pctOfTarget))}%` }} />
                </div>
                <p className="mt-1.5 text-[13px] text-muted">
                  do valor da meta ({formatBRL(g.targetCents, { compact: true })})
                  {g.pctOfRemaining !== undefined && ` · ${formatPct(g.pctOfRemaining)} do que ainda falta`}
                </p>
              </li>
            ))}
          </ul>
          <SourceNote>{copy.goalsDisclaimer}</SourceNote>
        </InsightCard>
      ) : (
        mode === 'live' && <SetupCard icon="target" question={copy.q.goals} text={copy.setup.goals} to="/metas?voltar=resultado" cta={copy.setup.goalsCta} />
      )}
    </div>
  );
}

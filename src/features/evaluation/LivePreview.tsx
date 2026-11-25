import { evaluate, formatBRL, type EvaluationContext, type EvaluationInput, type EvaluationResult } from '@vale/engine';
import { useDraft } from '@/stores/draft';

/** Calcula a prévia com o mesmo motor do resultado. Sem entrada válida, nada. */
export function previewOf(input: EvaluationInput | undefined, ctx: EvaluationContext | undefined): EvaluationResult | null {
  if (!input || !ctx) return null;
  try {
    return evaluate(input, ctx);
  } catch {
    return null;
  }
}

function lines(r: EvaluationResult): string[] {
  const out: string[] = [];
  if (r.workTime.available) out.push(`${r.workTime.data.label} do seu trabalho`);
  if (r.equivalences.available) {
    for (const i of r.equivalences.data.items.slice(0, 2)) out.push(`${i.quantity.toLocaleString('pt-BR')} ${i.label}`);
  }
  if (r.recurrence.available) out.push(`${formatBRL(r.recurrence.data.yearlyCents)} em um ano`);
  return out;
}

/** Celular: uma linha discreta logo abaixo do preço, atualizada enquanto a pessoa digita. */
export function InlinePreview({ result }: { result: EvaluationResult | null }) {
  const l = result ? lines(result) : [];
  return (
    <p aria-live="polite" className="min-h-[20px] text-[14px] leading-snug text-muted lg:hidden">
      {l.length > 0 && (
        <span className="fade-in">
          Isso equivale a <span className="font-semibold text-ink">{l.slice(0, 2).join(' ou ')}</span>.
        </span>
      )}
    </p>
  );
}

const EXAMPLE = { price: '300', description: 'Tênis de corrida' };

/** Desktop: painel ao lado do formulário. Vazio, convida com um exemplo clicável. */
export function PreviewPanel({ result }: { result: EvaluationResult | null }) {
  const update = useDraft((s) => s.update);
  const l = result ? lines(result) : [];

  return (
    <aside aria-label="Prévia" className="sticky top-12 hidden rounded-lg border border-line bg-paper p-6 lg:block">
      <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Prévia</p>
      {result && l.length > 0 ? (
        <div aria-live="polite" className="fade-in">
          <p className="num-display mt-2 text-[34px] font-semibold leading-none tracking-[-0.03em]">{formatBRL(result.priceCents)}</p>
          <p className="mt-4 text-[15px] text-muted">equivale a</p>
          <ul className="mt-2 flex flex-col gap-2">
            {l.map((t, i) => (
              <li key={t} className="flex gap-3 text-[16px] font-semibold leading-snug">
                <span aria-hidden="true" className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${i === 0 ? 'bg-lime-dark' : 'bg-gray-warm'}`} />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[13px] text-muted">O resultado completo mostra de onde vem cada número.</p>
        </div>
      ) : (
        <div>
          <p className="mt-2 font-display text-[22px] font-semibold leading-tight">Digite um preço e veja o que ele representa.</p>
          <p className="mt-2 text-[14px] text-muted">Sem conta, sem compromisso. Quer testar com um exemplo?</p>
          <button
            type="button"
            onClick={() => update(EXAMPLE)}
            className="mt-4 min-h-[44px] rounded-sm border border-line bg-card px-4 text-[14px] font-semibold hover:border-[color-mix(in_oklch,var(--vale-ink)_35%,transparent)]"
          >
            Tênis de corrida de R$ 300
          </button>
        </div>
      )}
    </aside>
  );
}

import type { Frequency } from '@vale/engine';
import { useDraft, type DraftForm } from '@/stores/draft';

type FreqOption = { label: string; kind: DraftForm['frequencyKind']; times?: string };

const FREQS: FreqOption[] = [
  { label: 'Só uma vez', kind: 'once' },
  { label: 'Todo dia', kind: 'daily' },
  { label: 'Dias úteis', kind: 'weekdays' },
  { label: '1× por semana', kind: 'weekly', times: '1' },
  { label: '2× por semana', kind: 'weekly', times: '2' },
  { label: '1× por mês', kind: 'monthly', times: '1' },
];

const USES = ['10', '50', '100', '300'];

function isSelected(form: DraftForm, o: FreqOption) {
  if (form.frequencyKind !== o.kind) return false;
  return o.times === undefined || form.frequencyTimes.trim() === o.times;
}

function Pill({ selected, onClick, children }: { selected: boolean; onClick(): void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-[36px] shrink-0 whitespace-nowrap rounded-full border px-3 text-[13.5px] font-semibold transition-colors ${
        selected ? 'border-ink bg-ink text-paper' : 'border-line bg-card text-ink hover:border-[color-mix(in_oklch,var(--vale-ink)_35%,transparent)]'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * "E se...?": muda frequência e usos ali mesmo, e o resultado recalcula na hora.
 * Tocar de novo na opção marcada desfaz. Só aparece antes de salvar.
 */
export function ScenarioTweaks() {
  const form = useDraft((s) => s.form);
  const update = useDraft((s) => s.update);
  const custom = (form.frequencyKind === 'weekly' || form.frequencyKind === 'monthly') && !FREQS.some((o) => isSelected(form, o));

  function pickFreq(o: FreqOption) {
    if (isSelected(form, o)) return update({ frequencyKind: '', frequencyTimes: '1' });
    update({ frequencyKind: o.kind as Frequency['kind'], frequencyTimes: o.times ?? '1' });
  }

  return (
    <section aria-label="Ajustar cenário" className="rounded-lg border border-line bg-paper px-4 py-4 sm:px-5">
      <p className="text-[14px] font-semibold">
        E se você comprar isso… <span className="font-medium text-muted">toque para testar</span>
      </p>
      <div className="scroll-row mt-2 flex gap-2 overflow-x-auto pb-1">
        {FREQS.map((o) => (
          <Pill key={o.label} selected={isSelected(form, o)} onClick={() => pickFreq(o)}>
            {o.label}
          </Pill>
        ))}
        {custom && (
          <Pill selected onClick={() => update({ frequencyKind: '', frequencyTimes: '1' })}>
            {`${form.frequencyTimes}× por ${form.frequencyKind === 'weekly' ? 'semana' : 'mês'}`}
          </Pill>
        )}
      </div>
      <p className="mt-3 text-[14px] font-semibold">…e usar quantas vezes?</p>
      <div className="scroll-row mt-2 flex gap-2 overflow-x-auto pb-1">
        {USES.map((u) => (
          <Pill key={u} selected={form.uses.trim() === u} onClick={() => update({ uses: form.uses.trim() === u ? '' : u })}>
            {`${u} vezes`}
          </Pill>
        ))}
        {form.uses.trim() && !USES.includes(form.uses.trim()) && (
          <Pill selected onClick={() => update({ uses: '' })}>
            {`${form.uses.trim()} vezes`}
          </Pill>
        )}
      </div>
    </section>
  );
}

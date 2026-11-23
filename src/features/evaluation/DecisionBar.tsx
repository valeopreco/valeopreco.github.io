import { useState } from 'react';
import type { Decision, DecisionKind } from '@/data/models';
import { newId } from '@/data/models';
import { Button } from '@/components/ui/Button';
import { Field, Textarea } from '@/components/ui/Field';
import { copy } from '@/content/copy';

const KINDS: DecisionKind[] = ['comprar', 'esperar', 'desistir'];

interface Props {
  current?: Decision | undefined;
  onDecide(d: Decision): Promise<boolean>;
}

/** Comprar, esperar ou desistir: a escolha é registrada, nunca sugerida. */
export function DecisionBar({ current, onDecide }: Props) {
  const [editing, setEditing] = useState(!current);
  const [choice, setChoice] = useState<DecisionKind | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  if (current && !editing) {
    return (
      <section className="rounded-lg border border-line bg-card p-5 sm:p-6" aria-labelledby="decisao-titulo">
        <h2 id="decisao-titulo" className="text-[14px] font-semibold text-muted">
          Sua decisão
        </h2>
        <p className="mt-1 font-display text-[22px] font-semibold">{copy.decisions[current.decision].past}</p>
        {current.note && <p className="mt-2 whitespace-pre-line text-[15px]">“{current.note}”</p>}
        <p className="mt-2 text-[13px] text-muted">
          Registrada em {new Date(current.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
        </p>
        <Button variant="secondary" className="mt-4" onClick={() => setEditing(true)}>
          Mudar decisão
        </Button>
      </section>
    );
  }

  async function confirm() {
    if (!choice) return;
    setBusy(true);
    const n = note.trim().slice(0, 500);
    const ok = await onDecide({ id: newId(), decision: choice, createdAt: new Date().toISOString(), ...(n ? { note: n } : {}) });
    setBusy(false);
    if (ok) {
      setEditing(false);
      setChoice(null);
      setNote('');
    }
  }

  return (
    <section className="rounded-lg border border-line bg-card p-5 sm:p-6" aria-labelledby="decisao-titulo">
      <h2 id="decisao-titulo" className="font-display text-[20px] font-semibold">
        {copy.q.decision}
      </h2>
      <p className="mt-1 text-[14px] text-muted">{copy.decisionHint}</p>
      <div role="radiogroup" aria-label="Decisão" className="mt-4 grid grid-cols-3 gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            role="radio"
            aria-checked={choice === k}
            onClick={() => setChoice(k)}
            className={`min-h-[48px] rounded-sm border text-[15px] font-semibold transition-colors ${
              choice === k ? 'border-ink bg-ink text-paper' : 'border-line bg-paper hover:border-[color-mix(in_oklch,var(--vale-ink)_35%,transparent)]'
            }`}
          >
            {copy.decisions[k].label}
          </button>
        ))}
      </div>
      {choice && (
        <div className="fade-in mt-4 flex flex-col gap-4">
          <Field label="Quer anotar algo?" optional>
            {(a) => <Textarea {...a} maxLength={500} placeholder="Ex.: vou esperar a promoção do mês que vem" value={note} onChange={(e) => setNote(e.target.value)} />}
          </Field>
          <div className="flex gap-2">
            <Button onClick={confirm} disabled={busy}>
              {busy ? 'Registrando…' : 'Registrar decisão'}
            </Button>
            {current && (
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

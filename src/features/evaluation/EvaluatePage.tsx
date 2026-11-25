import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Frequency } from '@vale/engine';
import { useDraft } from '@/stores/draft';
import { CATEGORIES } from '@/lib/categories';
import { Field, Input, MoneyInput } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/vale/Icon';
import { copy } from '@/content/copy';
import { draftToInput, loadContext, type DraftErrors } from './draft';
import { useRepoQuery } from '@/lib/useRepoQuery';
import { InlinePreview, PreviewPanel, previewOf } from './LivePreview';

const FREQS: { kind: Frequency['kind']; label: string }[] = [
  { kind: 'once', label: 'Só uma vez' },
  { kind: 'daily', label: 'Todo dia' },
  { kind: 'weekdays', label: 'Dias úteis' },
  { kind: 'weekly', label: 'Toda semana' },
  { kind: 'monthly', label: 'Todo mês' },
];

function Chip({ selected, onClick, children }: { selected: boolean; onClick(): void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-[40px] rounded-sm border px-3 text-[14px] font-semibold transition-colors ${
        selected ? 'border-ink bg-ink text-paper' : 'border-line bg-card text-ink hover:border-[color-mix(in_oklch,var(--vale-ink)_35%,transparent)]'
      }`}
    >
      {children}
    </button>
  );
}

export function EvaluatePage() {
  const { form, update, detailsOpen, setDetailsOpen, submit } = useDraft();
  const [errors, setErrors] = useState<DraftErrors>({});
  const priceRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const ctx = useRepoQuery(loadContext);
  // Prévia: mesmo motor do resultado, recalculada a cada tecla.
  const preview = useMemo(
    () => previewOf(draftToInput(form).input, ctx.status === 'ready' ? ctx.data : undefined),
    [form, ctx],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const { input, errors } = draftToInput(form);
    setErrors(errors);
    if (!input) {
      if (errors.price) priceRef.current?.focus();
      else setDetailsOpen(true);
      return;
    }
    submit();
    navigate('/resultado');
  }

  const timesVisible = form.frequencyKind === 'weekly' || form.frequencyKind === 'monthly';

  return (
    <div className="fade-in lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start lg:gap-10">
      <div className="min-w-0">
      <div className="mb-8 lg:mb-10">
        <h1 className="mt-0 font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[42px] lg:text-[48px]">{copy.tagline}</h1>
        <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed text-muted">{copy.homeIntro}</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="rounded-lg border border-line bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-5">
          <Field label="Quanto custa?" error={errors.price}>
            {(a) => (
              <MoneyInput
                {...a}
                ref={priceRef}
                big
                placeholder="0,00"
                value={form.price}
                onChange={(e) => update({ price: e.target.value })}
                autoFocus={!form.price}
              />
            )}
          </Field>
          <div className="-mt-3">
            <InlinePreview result={preview} />
          </div>

          <Field label="O que é?" optional>
            {(a) => (
              <Input {...a} placeholder="Ex.: tênis de corrida" maxLength={120} value={form.description} onChange={(e) => update({ description: e.target.value })} />
            )}
          </Field>

          <div className="border-t border-line pt-4">
            <button
              type="button"
              aria-expanded={detailsOpen}
              aria-controls="mais-detalhes"
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="flex min-h-[44px] w-full items-center justify-between text-left text-[15px] font-semibold"
            >
              <span>
                Mais detalhes <span className="font-medium text-muted">(categoria, frequência, usos)</span>
              </span>
              <Icon name="chevron" size={18} className={`transition-transform ${detailsOpen ? 'rotate-90' : ''}`} />
            </button>

            {detailsOpen && (
              <div id="mais-detalhes" className="fade-in mt-3 flex flex-col gap-6">
                <fieldset>
                  <legend className="mb-2 text-[14px] font-semibold">
                    Categoria <span className="font-medium text-muted">(opcional)</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <Chip key={c.slug} selected={form.category === c.slug} onClick={() => update({ category: form.category === c.slug ? undefined : c.slug })}>
                        {c.name}
                      </Chip>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-2 text-[14px] font-semibold">
                    Com que frequência você compra isso? <span className="font-medium text-muted">(opcional)</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {FREQS.map((f) => (
                      <Chip key={f.kind} selected={form.frequencyKind === f.kind} onClick={() => update({ frequencyKind: form.frequencyKind === f.kind ? '' : f.kind })}>
                        {f.label}
                      </Chip>
                    ))}
                  </div>
                  {timesVisible && (
                    <div className="mt-3 max-w-[220px]">
                      <Field label={form.frequencyKind === 'weekly' ? 'Quantas vezes por semana?' : 'Quantas vezes por mês?'} error={errors.frequencyTimes}>
                        {(a) => (
                          <Input {...a} inputMode="numeric" value={form.frequencyTimes} onChange={(e) => update({ frequencyTimes: e.target.value })} />
                        )}
                      </Field>
                    </div>
                  )}
                </fieldset>

                <Field
                  label="Quantas vezes você pretende usar?"
                  optional
                  error={errors.uses}
                  hint="Sua estimativa. Um tênis usado 2 vezes por semana durante um ano dá cerca de 100 usos."
                >
                  {(a) => <Input {...a} inputMode="numeric" placeholder="Ex.: 100" value={form.uses} onChange={(e) => update({ uses: e.target.value })} />}
                </Field>
              </div>
            )}
          </div>

          <Button type="submit" block className="min-h-[52px] text-[16px]">
            {copy.submit}
          </Button>
          <p className="-mt-2 text-center text-[13px] text-muted">{copy.privacyNote}</p>
        </div>
      </form>
      </div>
      <PreviewPanel result={preview} />
    </div>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { formatBRL, parseBRL } from '@vale/engine';
import type { Settings } from '@/data/models';
import { financialSchema } from '@/lib/schemas';
import { mutate } from '@/lib/useRepoQuery';
import { Field, Input, MoneyInput } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

/** Atalhos de jornada: horas semanais × 52 ÷ 12, arredondado. Só preenchem o campo; a pessoa confirma. */
const PRESETS = [
  { weekly: 44, monthly: 191 },
  { weekly: 40, monthly: 173 },
  { weekly: 30, monthly: 130 },
  { weekly: 20, monthly: 87 },
];

const centsToText = (c?: number) => (c ? (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: c % 100 ? 2 : 0 }) : '');

export function FinancialForm({ settings, onSaved }: { settings: Settings; onSaved?(): void }) {
  const f = settings.financial;
  const [income, setIncome] = useState(centsToText(f?.netIncomeCents));
  const [hours, setHours] = useState(f ? String(f.monthlyHours).replace('.', ',') : '');
  const [days, setDays] = useState(f?.workDaysPerMonth ? String(f.workDaysPerMonth) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIncome(centsToText(f?.netIncomeCents));
    setHours(f ? String(f.monthlyHours).replace('.', ',') : '');
    setDays(f?.workDaysPerMonth ? String(f.workDaysPerMonth) : '');
  }, [f]);

  const h = Number(hours.replace(',', '.'));
  const inc = parseBRL(income);
  const rate = inc && h > 0 ? Math.round(inc / h) : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!inc || inc <= 0) errs.income = 'Informe sua renda líquida mensal.';
    if (!(h > 0) || h > 744) errs.hours = 'Informe as horas trabalhadas no mês (entre 1 e 744).';
    const d = days.trim() ? Number(days) : undefined;
    if (d !== undefined && (!Number.isInteger(d) || d < 1 || d > 31)) errs.days = 'Use um número inteiro entre 1 e 31.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const financial = { netIncomeCents: inc!, monthlyHours: Math.round(h * 10) / 10, ...(d ? { workDaysPerMonth: d } : {}) };
    if (!financialSchema.safeParse(financial).success) return;
    if (await mutate((r) => r.saveSettings({ ...settings, financial }), 'Renda e jornada salvas.')) onSaved?.();
  }

  async function clear() {
    const { financial: _omit, ...rest } = settings;
    await mutate((r) => r.saveSettings(rest), 'Renda e jornada removidas.');
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="Renda líquida mensal" error={errors.income} hint="O que de fato entra na sua conta por mês, depois dos descontos.">
        {(a) => <MoneyInput {...a} placeholder="0,00" value={income} onChange={(e) => setIncome(e.target.value)} />}
      </Field>
      <Field label="Horas trabalhadas por mês" error={errors.hours}>
        {(a) => <Input {...a} inputMode="decimal" placeholder="Ex.: 173" value={hours} onChange={(e) => setHours(e.target.value)} />}
      </Field>
      <div className="-mt-2 flex flex-wrap gap-2" aria-label="Atalhos de jornada">
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p.weekly}
            onClick={() => setHours(String(p.monthly))}
            className="min-h-[36px] rounded-sm border border-line bg-paper px-2.5 text-[13px] font-semibold hover:border-[color-mix(in_oklch,var(--vale-ink)_35%,transparent)]"
          >
            {p.weekly} h/semana ≈ {p.monthly} h
          </button>
        ))}
      </div>
      <Field label="Dias trabalhados por mês" optional error={errors.days} hint="Com isso, o tempo também aparece em dias de trabalho.">
        {(a) => <Input {...a} inputMode="numeric" placeholder="Ex.: 22" value={days} onChange={(e) => setDays(e.target.value)} />}
      </Field>
      {rate && (
        <p className="rounded-md bg-paper px-4 py-3 text-[14px]">
          Sua hora de trabalho vale cerca de <span className="num font-semibold">{formatBRL(rate)}</span>.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Salvar</Button>
        {f && (
          <Button variant="ghost" onClick={clear}>
            Remover estes dados
          </Button>
        )}
      </div>
    </form>
  );
}

import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatBRL, formatPct, parseBRL, roundPct } from '@vale/engine';
import { mutate, useRepoQuery } from '@/lib/useRepoQuery';
import { newId, type StoredGoal } from '@/data/models';
import { goalSchema } from '@/lib/schemas';
import { Card, EmptyState, ErrorNote, ListSkeleton, PageTitle } from '@/components/vale/bits';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog, Dialog } from '@/components/ui/Dialog';
import { Field, Input, MoneyInput } from '@/components/ui/Field';
import { Icon } from '@/components/vale/Icon';

const centsToText = (c?: number) => (c ? (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: c % 100 ? 2 : 0 }) : '');

function GoalForm({ goal, onDone }: { goal?: StoredGoal | undefined; onDone(): void }) {
  const [name, setName] = useState(goal?.name ?? '');
  const [target, setTarget] = useState(centsToText(goal?.targetCents));
  const [current, setCurrent] = useState(centsToText(goal?.currentCents));
  const [deadline, setDeadline] = useState(goal?.deadline ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const t = parseBRL(target);
    const c = current.trim() ? parseBRL(current) : undefined;
    if (!name.trim()) errs.name = 'Dê um nome ao objetivo.';
    if (!t || t <= 0) errs.target = 'Informe quanto o objetivo custa.';
    if (c === null) errs.current = 'Use só números, como 500 ou 1.250,00.';
    else if (c !== undefined && t && c > t) errs.current = 'O valor guardado passa do valor do objetivo.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const g: StoredGoal = {
      id: goal?.id ?? newId(),
      name: name.trim(),
      targetCents: t!,
      active: goal?.active ?? true,
      createdAt: goal?.createdAt ?? new Date().toISOString(),
      ...(c ? { currentCents: c } : {}),
      ...(deadline ? { deadline } : {}),
    };
    const parsed = goalSchema.safeParse(g);
    if (!parsed.success) {
      setErrors({ name: 'Revise os campos e tente de novo.' });
      return;
    }
    if (await mutate((r) => r.saveGoal(g), goal ? 'Objetivo atualizado.' : 'Objetivo criado.')) onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="Nome" error={errors.name}>
        {(a) => <Input {...a} maxLength={80} placeholder="Ex.: viagem de fim de ano" value={name} onChange={(e) => setName(e.target.value)} autoFocus />}
      </Field>
      <Field label="Quanto custa o objetivo?" error={errors.target}>
        {(a) => <MoneyInput {...a} placeholder="0,00" value={target} onChange={(e) => setTarget(e.target.value)} />}
      </Field>
      <Field label="Quanto você já guardou?" optional error={errors.current}>
        {(a) => <MoneyInput {...a} placeholder="0,00" value={current} onChange={(e) => setCurrent(e.target.value)} />}
      </Field>
      <Field label="Prazo" optional>
        {(a) => <Input {...a} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />}
      </Field>
      <Button type="submit" block>
        {goal ? 'Salvar alterações' : 'Criar objetivo'}
      </Button>
    </form>
  );
}

export function GoalsPage() {
  const q = useRepoQuery((r) => r.listGoals());
  const [editing, setEditing] = useState<StoredGoal | 'new' | null>(null);
  const [deleting, setDeleting] = useState<StoredGoal | null>(null);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const backToResult = params.get('voltar') === 'resultado';

  return (
    <div className="fade-in">
      <PageTitle
        title="Metas"
        subtitle="Objetivos que dão contexto às suas avaliações."
        action={
          q.status === 'ready' && q.data.length > 0 ? (
            <Button onClick={() => setEditing('new')} aria-label="Novo objetivo">
              <Icon name="plus" size={18} />
              <span className="hidden sm:inline">Novo objetivo</span>
            </Button>
          ) : undefined
        }
      />

      {backToResult && q.status === 'ready' && q.data.some((g) => g.active) && (
        <Button variant="secondary" className="mb-4" onClick={() => navigate('/resultado')}>
          <Icon name="back" size={18} />
          Voltar ao resultado
        </Button>
      )}

      {q.status === 'loading' && <ListSkeleton />}
      {q.status === 'error' && <ErrorNote message={q.message} />}
      {q.status === 'ready' && q.data.length === 0 && (
        <EmptyState
          title="Nenhum objetivo ainda"
          text="Uma viagem, um computador, uma reserva: cadastre o que você quer alcançar para comparar suas compras com isso."
          action={<Button onClick={() => setEditing('new')}>Criar objetivo</Button>}
        />
      )}
      {q.status === 'ready' && q.data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {q.data.map((g) => {
            const progress = g.currentCents ? roundPct((g.currentCents / g.targetCents) * 100) : 0;
            return (
              <li key={g.id}>
                <Card as="article" className={g.active ? '' : 'opacity-60'}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[17px] font-semibold">{g.name}</h2>
                      <p className="num mt-1 text-[24px] font-semibold">{formatBRL(g.targetCents, { compact: true })}</p>
                      {g.deadline && <p className="text-[13px] text-muted">Prazo: {new Date(`${g.deadline}T12:00:00`).toLocaleDateString('pt-BR')}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button className="grid h-11 w-11 place-items-center rounded-sm text-muted hover:bg-gray-warm hover:text-ink" aria-label={`Editar ${g.name}`} onClick={() => setEditing(g)}>
                        <Icon name="edit" size={18} />
                      </button>
                      <button className="grid h-11 w-11 place-items-center rounded-sm text-muted hover:bg-gray-warm hover:text-danger" aria-label={`Excluir ${g.name}`} onClick={() => setDeleting(g)}>
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                  </div>
                  {g.currentCents ? (
                    <div className="mt-3">
                      <div className="h-2 rounded-full bg-gray-warm">
                        <div className="h-full rounded-full bg-lime-dark" style={{ width: `${Math.min(100, progress)}%` }} />
                      </div>
                      <p className="mt-1.5 text-[13px] text-muted">
                        {formatBRL(g.currentCents)} guardados · {formatPct(progress)}
                      </p>
                    </div>
                  ) : null}
                  <label className="mt-4 flex min-h-[44px] cursor-pointer items-center gap-3 text-[14px]">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[var(--vale-ink)]"
                      checked={g.active}
                      onChange={() => mutate((r) => r.saveGoal({ ...g, active: !g.active }))}
                    />
                    Considerar nas avaliações
                  </label>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} title={editing === 'new' ? 'Novo objetivo' : 'Editar objetivo'}>
        {editing !== null && <GoalForm goal={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />}
      </Dialog>
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Excluir “${deleting?.name ?? ''}”?`}
        description="Avaliações antigas que usaram este objetivo continuam como estão."
        confirmLabel="Excluir"
        onConfirm={() => deleting && mutate((r) => r.deleteGoal(deleting.id), 'Objetivo excluído.')}
      />
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { formatBRL, parseBRL, type CategorySlug } from '@vale/engine';
import type { OwnReference } from '@/data/models';
import { newId } from '@/data/models';
import { referenceSchema } from '@/lib/schemas';
import { CATEGORIES, categoryName } from '@/lib/categories';
import { mutate, useRepoQuery } from '@/lib/useRepoQuery';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field, Input, MoneyInput } from '@/components/ui/Field';
import { Icon } from '@/components/vale/Icon';
import { ListSkeleton } from '@/components/vale/bits';

function RefForm({ onDone }: { onDone(): void }) {
  const [singular, setSingular] = useState('');
  const [plural, setPlural] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<CategorySlug>('alimentacao');
  const [universal, setUniversal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: FormEvent) {
    e.preventDefault();
    const p = parseBRL(price);
    const errs: Record<string, string> = {};
    if (!singular.trim()) errs.singular = 'Diga o que é, no singular.';
    if (!plural.trim()) errs.plural = 'E no plural, para frases como “5 lanches”.';
    if (!p || p <= 0) errs.price = 'Informe quanto custa.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const ref: OwnReference = {
      id: newId(),
      singular: singular.trim(),
      plural: plural.trim(),
      categorySlug: category,
      priceCents: p!,
      source: 'Sua referência',
      updatedAt: new Date().toISOString().slice(0, 10),
      universal,
      estimated: false,
      active: true,
    };
    if (!referenceSchema.safeParse(ref).success) return;
    if (await mutate((r) => r.saveOwnReference(ref), 'Referência adicionada.')) onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="O que é (singular)" error={errors.singular}>
        {(a) => <Input {...a} maxLength={80} placeholder="Ex.: lanche da cantina" value={singular} onChange={(e) => setSingular(e.target.value)} autoFocus />}
      </Field>
      <Field label="No plural" error={errors.plural}>
        {(a) => <Input {...a} maxLength={80} placeholder="Ex.: lanches da cantina" value={plural} onChange={(e) => setPlural(e.target.value)} />}
      </Field>
      <Field label="Preço" error={errors.price}>
        {(a) => <MoneyInput {...a} placeholder="0,00" value={price} onChange={(e) => setPrice(e.target.value)} />}
      </Field>
      <Field label="Categoria">
        {(a) => (
          <select {...a} value={category} onChange={(e) => setCategory(e.target.value as CategorySlug)} className="min-h-[48px] w-full rounded-sm border border-line bg-card px-3 text-[16px]">
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </Field>
      <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[14px]">
        <input type="checkbox" className="h-5 w-5 accent-[var(--vale-ink)]" checked={universal} onChange={(e) => setUniversal(e.target.checked)} />
        Usar em compras de qualquer categoria
      </label>
      <Button type="submit" block>
        Adicionar referência
      </Button>
    </form>
  );
}

/** Módulo 3: referências próprias de consumo, usadas nas equivalências. */
export function OwnReferences() {
  const q = useRepoQuery((r) => r.listOwnReferences());
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p className="text-[14px] text-muted">
        Coisas que você costuma comprar viram comparações nas avaliações. Elas aparecem para compras da mesma categoria.
      </p>
      {q.status === 'loading' && <div className="mt-3"><ListSkeleton rows={1} /></div>}
      {q.status === 'ready' && q.data.length > 0 && (
        <ul className="mt-3 flex flex-col divide-y divide-[var(--vale-line)]">
          {q.data.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-2">
              <div className="flex-1">
                <p className="text-[15px] font-semibold">{r.singular}</p>
                <p className="text-[13px] text-muted">
                  {formatBRL(r.priceCents)} · {r.universal ? 'todas as categorias' : categoryName(r.categorySlug)}
                </p>
              </div>
              <button
                className="grid h-11 w-11 place-items-center rounded-sm text-muted hover:bg-gray-warm hover:text-danger"
                aria-label={`Excluir ${r.singular}`}
                onClick={() => mutate((x) => x.deleteOwnReference(r.id), 'Referência excluída.')}
              >
                <Icon name="trash" size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button variant="secondary" className="mt-3" onClick={() => setOpen(true)}>
        <Icon name="plus" size={18} />
        Adicionar referência
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title="Nova referência" description="Use preços que você conhece da sua rotina.">
        {open && <RefForm onDone={() => setOpen(false)} />}
      </Dialog>
    </div>
  );
}

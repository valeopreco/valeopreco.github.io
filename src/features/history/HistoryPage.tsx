import { Link } from 'react-router-dom';
import { formatBRL } from '@vale/engine';
import { useRepoQuery } from '@/lib/useRepoQuery';
import { currentDecision, type DecisionKind } from '@/data/models';
import { categoryName } from '@/lib/categories';
import { copy } from '@/content/copy';
import { EmptyState, ErrorNote, ListSkeleton, PageTitle } from '@/components/vale/bits';
import { Icon } from '@/components/vale/Icon';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function DecisionChip({ kind }: { kind?: DecisionKind | undefined }) {
  if (!kind) return <span className="rounded-[6px] border border-dashed border-line px-2 py-0.5 text-[12.5px] font-semibold text-muted">sem decisão</span>;
  const tone = kind === 'comprar' ? 'bg-lime text-ink' : kind === 'esperar' ? 'bg-gray-warm text-ink' : 'bg-ink text-paper';
  return <span className={`rounded-[6px] px-2 py-0.5 text-[12.5px] font-semibold ${tone}`}>{copy.decisions[kind].label}</span>;
}

export function HistoryPage() {
  const q = useRepoQuery((r) => r.listEvaluations());
  const navigate = useNavigate();

  return (
    <div className="fade-in">
      <PageTitle title="Histórico" subtitle="Cada avaliação fica como era no dia em que você fez." />
      {q.status === 'loading' && <ListSkeleton />}
      {q.status === 'error' && <ErrorNote message={q.message} />}
      {q.status === 'ready' && q.data.length === 0 && (
        <EmptyState
          title="Nada por aqui ainda"
          text="Quando você avaliar uma compra e registrar a decisão, ela aparece aqui."
          action={<Button onClick={() => navigate('/')}>Avaliar uma compra</Button>}
        />
      )}
      {q.status === 'ready' && q.data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {q.data.map((e) => {
            const meta = [new Date(e.createdAt).toLocaleDateString('pt-BR'), categoryName(e.input.categorySlug)].filter(Boolean).join(' · ');
            return (
              <li key={e.id}>
                <Link
                  to={`/historico/${e.id}`}
                  className="flex items-center gap-4 rounded-md border border-line bg-card px-4 py-3.5 transition-colors hover:border-[color-mix(in_oklch,var(--vale-ink)_30%,transparent)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">{e.input.description || 'Compra sem nome'}</p>
                    <p className="mt-0.5 text-[13px] text-muted">{meta}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="num text-[17px] font-semibold">{formatBRL(e.input.priceCents)}</span>
                    <DecisionChip kind={currentDecision(e)?.decision} />
                  </div>
                  <Icon name="chevron" size={18} className="text-muted" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

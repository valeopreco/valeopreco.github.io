import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatBRL } from '@vale/engine';
import { mutate, useRepoQuery } from '@/lib/useRepoQuery';
import { copy } from '@/content/copy';
import { ResultView } from '../evaluation/ResultView';
import { DecisionBar } from '../evaluation/DecisionBar';
import { Card, ErrorNote, ListSkeleton } from '@/components/vale/bits';
import { Icon } from '@/components/vale/Icon';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { NotFoundPage } from '../legal/NotFoundPage';

export function HistoryDetailPage() {
  const { id = '' } = useParams();
  const q = useRepoQuery((r) => r.getEvaluation(id), [id]);
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  if (q.status === 'loading') return <ListSkeleton rows={3} />;
  if (q.status === 'error') return <ErrorNote message={q.message} />;
  const e = q.data;
  if (!e) return <NotFoundPage />;
  const p = e.snapshot.parameters;

  return (
    <div className="fade-in">
      <Link to="/historico" className="-ml-2 mb-5 inline-flex min-h-[44px] items-center gap-1 rounded-sm px-2 text-[15px] font-semibold text-muted hover:text-ink">
        <Icon name="back" size={18} />
        Histórico
      </Link>
      <h1 className="sr-only">Avaliação de {new Date(e.createdAt).toLocaleDateString('pt-BR')}</h1>
      <p className="mb-4 text-[13px] text-muted">
        Avaliado em {new Date(e.createdAt).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
      </p>

      <ResultView input={e.input} result={e.snapshot.result} mode="snapshot" />

      <div className="mt-6">
        <DecisionBar current={e.decisions.at(-1)} onDecide={(d) => mutate((r) => r.addDecision(e.id, d), 'Decisão atualizada.')} />
      </div>

      {e.decisions.length > 1 && (
        <Card className="mt-4">
          <h2 className="text-[14px] font-semibold text-muted">Decisões anteriores</h2>
          <ul className="mt-2 flex flex-col gap-2 text-[14px]">
            {e.decisions
              .slice(0, -1)
              .reverse()
              .map((d) => (
                <li key={d.id}>
                  <span className="font-semibold">{copy.decisions[d.decision].label}</span>
                  <span className="text-muted"> · {new Date(d.createdAt).toLocaleDateString('pt-BR')}</span>
                  {d.note && <span className="block text-muted">“{d.note}”</span>}
                </li>
              ))}
          </ul>
        </Card>
      )}

      <details className="mt-4 rounded-lg border border-line bg-card px-5 py-4 text-[14px]">
        <summary className="min-h-[28px] cursor-pointer font-semibold">Parâmetros usados nesta avaliação</summary>
        <ul className="mt-3 flex flex-col gap-1 text-muted">
          <li>
            Renda e jornada:{' '}
            {p.financial ? `${formatBRL(p.financial.netIncomeCents)} por mês, ${p.financial.monthlyHours.toLocaleString('pt-BR')} h trabalhadas` : 'não informadas'}
          </li>
          <li>Metas consideradas: {p.goals.length ? p.goals.map((g) => g.name).join(', ') : 'nenhuma'}</li>
          <li>Versão do cálculo: {e.snapshot.engineVersion}</li>
        </ul>
        <p className="mt-3 text-muted">Se você mudar a renda ou as metas depois, esta avaliação continua igual.</p>
      </details>

      <Button variant="danger" className="mt-6" onClick={() => setConfirm(true)}>
        <Icon name="trash" size={18} />
        Excluir avaliação
      </Button>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Excluir esta avaliação?"
        description="Ela sai do histórico junto com as decisões registradas. Não dá para desfazer."
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (await mutate((r) => r.deleteEvaluation(e.id), 'Avaliação excluída.')) navigate('/historico');
        }}
      />
    </div>
  );
}

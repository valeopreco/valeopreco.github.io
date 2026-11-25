import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { evaluate } from '@vale/engine';
import { useDraft } from '@/stores/draft';
import { mutate, useRepoQuery } from '@/lib/useRepoQuery';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/vale/Icon';
import { ErrorNote, Skeleton } from '@/components/vale/bits';
import type { Decision, SavedEvaluation } from '@/data/models';
import { buildSaved, draftToInput, loadContext } from './draft';
import { ResultView } from './ResultView';
import { DecisionBar } from './DecisionBar';
import { ScenarioTweaks } from './ScenarioTweaks';

export function ResultPage() {
  const { form, submitted, savedId, markSaved, reset } = useDraft();
  const navigate = useNavigate();
  const { input } = useMemo(() => draftToInput(form), [form]);
  const ctx = useRepoQuery(loadContext);
  const saved = useRepoQuery((r) => (savedId ? r.getEvaluation(savedId) : Promise.resolve(undefined)), [savedId]);
  const [busy, setBusy] = useState(false);

  if (!submitted || !input) return <Navigate to="/" replace />;
  if (ctx.status === 'loading')
    return (
      <div role="status" aria-label="Calculando" className="flex flex-col gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  if (ctx.status === 'error') return <ErrorNote message={ctx.message} />;

  const savedEval = saved.status === 'ready' ? saved.data : undefined;
  // Enquanto não salva, recalcula ao vivo (ex.: voltou do perfil com renda nova).
  const result = savedEval ? savedEval.snapshot.result : evaluate(input, ctx.data);

  async function save(decision?: Decision): Promise<string | null> {
    if (ctx.status !== 'ready') return null;
    const e: SavedEvaluation = buildSaved(input!, ctx.data);
    if (decision) e.decisions.push(decision);
    const ok = await mutate((r) => r.saveEvaluation(e), decision ? 'Decisão registrada no histórico.' : 'Guardado no histórico.');
    if (ok) markSaved(e.id);
    return ok ? e.id : null;
  }

  async function decide(d: Decision) {
    if (savedEval) return mutate((r) => r.addDecision(savedEval.id, d), 'Decisão atualizada.');
    return (await save(d)) !== null;
  }

  return (
    <div className="fade-in">
      <div className="mb-5 flex items-center justify-between">
        <Link to="/" className="-ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-sm px-2 text-[15px] font-semibold text-muted hover:text-ink">
          <Icon name="back" size={18} />
          Editar
        </Link>
      </div>

      <h1 className="sr-only">Resultado da avaliação</h1>
      <ResultView input={input} result={result} mode={savedEval ? 'snapshot' : 'live'} tweaks={savedEval ? undefined : <ScenarioTweaks />} />

      <div className="mt-6">
        <DecisionBar current={savedEval?.decisions.at(-1)} onDecide={decide} />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {!savedEval && (
          <Button
            variant="secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await save();
              setBusy(false);
            }}
          >
            Guardar sem decidir agora
          </Button>
        )}
        {savedEval && (
          <Button variant="secondary" onClick={() => navigate(`/historico/${savedEval.id}`)}>
            Ver no histórico
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={() => {
            reset();
            navigate('/');
          }}
        >
          Avaliar outra compra
        </Button>
      </div>
    </div>
  );
}

import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { mutate, useRepoQuery } from '@/lib/useRepoQuery';
import { cloudEnabled } from '@/data/supabase';
import { useApp } from '@/stores/app';
import { useDraft } from '@/stores/draft';
import { ENGINE_VERSION } from '@vale/engine';
import { Card, ErrorNote, ListSkeleton, PageTitle } from '@/components/vale/bits';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/vale/Icon';
import { FinancialForm } from './FinancialForm';
import { OwnReferences } from './OwnReferences';
import { AccountSection } from '../auth/AccountSection';

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <Card>
      <h2 id={id} className="mb-4 font-display text-[20px] font-semibold">
        {title}
      </h2>
      {children}
    </Card>
  );
}

export function ProfilePage() {
  const q = useRepoQuery((r) => r.getSettings());
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mode = useApp((s) => s.mode);
  const submitted = useDraft((s) => s.submitted);
  const [confirmClear, setConfirmClear] = useState(false);
  const backToResult = params.get('voltar') === 'resultado' && submitted;

  async function download() {
    const repo = useApp.getState().repo;
    if (!repo) return;
    const data = await repo.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vale-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <div className="fade-in">
      <PageTitle title="Perfil" subtitle="Tudo aqui é opcional e deixa as avaliações mais próximas da sua realidade." />
      {q.status === 'loading' && <ListSkeleton rows={2} />}
      {q.status === 'error' && <ErrorNote message={q.message} />}
      {q.status === 'ready' && (
        <div className="flex flex-col gap-4">
          <Section id="renda" title="Renda e jornada">
            <FinancialForm settings={q.data} {...(backToResult ? { onSaved: () => navigate('/resultado') } : {})} />
          </Section>

          <Section id="referencias" title="Suas referências de preço">
            <OwnReferences />
          </Section>

          {cloudEnabled && (
            <Section id="conta" title="Conta">
              <AccountSection />
            </Section>
          )}

          <Section id="dados" title="Seus dados">
            <p className="text-[14px] text-muted">
              {mode === 'cloud' ? 'Seus dados estão na sua conta.' : 'Seus dados estão só neste aparelho. Ninguém mais tem acesso a eles.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={download}>
                <Icon name="download" size={18} />
                Baixar meus dados
              </Button>
              <Button variant="danger" onClick={() => setConfirmClear(true)}>
                Apagar tudo
              </Button>
            </div>
          </Section>

          <p className="px-1 text-[13px] text-muted">
            <Link to="/privacidade" className="underline underline-offset-4 hover:text-ink">Política de Privacidade</Link>
            {' · '}
            <Link to="/termos" className="underline underline-offset-4 hover:text-ink">Termos de Uso</Link>
            {' · '}cálculo v{ENGINE_VERSION}
          </p>
        </div>
      )}
      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Apagar todos os dados?"
        description="Avaliações, decisões, metas, renda e referências próprias serão apagadas. Não dá para desfazer."
        confirmLabel="Apagar tudo"
        onConfirm={() => mutate((r) => r.clearAll(), 'Dados apagados.')}
      />
    </div>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '@/data/supabase';
import { useApp } from '@/stores/app';
import { getLocalRepo } from '@/app/bootstrap';
import { guestDataCount, migrateGuestData } from '@/data/sync/migrateGuest';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Field, Input } from '@/components/ui/Field';

const redirectTo = () => `${window.location.origin}${window.location.pathname}`;

/** Conta opcional: só para guardar e sincronizar. Aparece apenas com o Supabase configurado. */
export function AccountSection() {
  const { mode, userEmail, toast, bump } = useApp();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sbClient, setSb] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    void getSupabase()?.then(setSb);
  }, []);

  useEffect(() => {
    if (mode !== 'cloud') return;
    void getLocalRepo().then(guestDataCount).then(setPending);
  }, [mode]);

  if (!sbClient) return <p className="text-[14px] text-muted">Carregando…</p>;
  const sb = sbClient;

  async function sendLink(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Confira o e-mail digitado.');
    setError(undefined);
    setBusy(true);
    const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo() } });
    setBusy(false);
    // Mesma resposta exista ou não a conta: não revela quem é cadastrado.
    if (error && error.status === 429) return setError('Muitas tentativas. Espere um minuto e tente de novo.');
    setSent(true);
  }

  async function migrate() {
    setBusy(true);
    try {
      const { imported } = await migrateGuestData(sb, await getLocalRepo());
      setPending(0);
      bump();
      toast(`${imported} ${imported === 1 ? 'item levado' : 'itens levados'} para a sua conta.`);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Não foi possível levar seus dados agora.', 'error');
    }
    setBusy(false);
  }

  if (mode === 'cloud') {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[15px]">
          Conectado como <span className="font-semibold">{userEmail}</span>. Suas avaliações ficam sincronizadas entre aparelhos.
        </p>
        {pending > 0 && (
          <div className="rounded-md border border-line bg-paper p-4">
            <p className="text-[15px]">
              Há {pending} {pending === 1 ? 'item guardado' : 'itens guardados'} neste aparelho, de antes de você entrar.
            </p>
            <Button className="mt-3" onClick={migrate} disabled={busy}>
              {busy ? 'Levando…' : 'Levar para a minha conta'}
            </Button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => sb.auth.signOut()}>
            Sair
          </Button>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            Excluir conta e dados
          </Button>
        </div>
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Excluir sua conta?"
          description="A conta e tudo o que está nela (avaliações, metas, renda) são apagados de forma definitiva."
          confirmLabel="Excluir definitivamente"
          onConfirm={async () => {
            const { error } = await sb.rpc('delete_my_account');
            if (error) return toast('Não foi possível excluir agora. Tente de novo.', 'error');
            await sb.auth.signOut();
            toast('Conta excluída.');
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[14px] text-muted">
        Opcional. Com uma conta, suas avaliações ficam guardadas na nuvem e aparecem no celular e no computador. O que já está neste aparelho pode ir junto.
      </p>
      {sent ? (
        <p role="status" className="rounded-md bg-paper px-4 py-3 text-[15px]">
          Se o e-mail estiver certo, chega um link de acesso em instantes. Abra-o neste aparelho.
        </p>
      ) : (
        <form onSubmit={sendLink} noValidate className="flex flex-col gap-3">
          <Field label="Seu e-mail" error={error}>
            {(a) => <Input {...a} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />}
          </Field>
          <Button type="submit" disabled={busy}>
            {busy ? 'Enviando…' : 'Receber link de acesso'}
          </Button>
        </form>
      )}
      <Button variant="secondary" onClick={() => sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo() } })}>
        Entrar com Google
      </Button>
    </div>
  );
}

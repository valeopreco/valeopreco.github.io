-- VALE? — Row Level Security
-- Regra geral: cada pessoa lê e escreve apenas linhas com user_id = auth.uid().
-- Tabelas filhas (snapshots, decisões) também conferem a posse da avaliação pai (evita IDOR).

alter table public.profiles             enable row level security;
alter table public.financial_profiles   enable row level security;
alter table public.categories           enable row level security;
alter table public.price_references     enable row level security;
alter table public.goals                enable row level security;
alter table public.evaluations          enable row level security;
alter table public.evaluation_snapshots enable row level security;
alter table public.decisions            enable row level security;

-- Papel de administrador vem de app_metadata (só o servidor altera; o usuário não).
create function public.is_admin() returns boolean
language sql stable set search_path = '' as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- profiles
create policy "perfil: ler o próprio"      on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "perfil: criar o próprio"    on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "perfil: editar o próprio"   on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- financial_profiles
create policy "financeiro: dono" on public.financial_profiles for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- categories: leitura pública, escrita só admin
create policy "categorias: leitura pública" on public.categories for select to anon, authenticated using (true);
create policy "categorias: admin escreve"   on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- price_references: globais ativas para todos; pessoais só do dono; globais só admin escreve
create policy "referências: ler globais ativas e as próprias" on public.price_references for select to anon, authenticated
  using ((user_id is null and ativo) or user_id = (select auth.uid()) or public.is_admin());
create policy "referências: criar próprias" on public.price_references for insert to authenticated
  with check (user_id = (select auth.uid()) or (user_id is null and public.is_admin()));
create policy "referências: editar próprias" on public.price_references for update to authenticated
  using (user_id = (select auth.uid()) or (user_id is null and public.is_admin()))
  with check (user_id = (select auth.uid()) or (user_id is null and public.is_admin()));
create policy "referências: excluir próprias" on public.price_references for delete to authenticated
  using (user_id = (select auth.uid()) or (user_id is null and public.is_admin()));

-- goals
create policy "metas: dono" on public.goals for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- evaluations
create policy "avaliações: dono" on public.evaluations for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- evaluation_snapshots: ler e criar; sem update (imutável); delete via cascade da avaliação
create policy "snapshots: ler" on public.evaluation_snapshots for select to authenticated
  using (user_id = (select auth.uid()));
create policy "snapshots: criar para avaliação própria" on public.evaluation_snapshots for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.evaluations e where e.id = evaluation_id and e.user_id = (select auth.uid()))
  );

-- decisions: ler, criar e excluir; sem update (histórico)
create policy "decisões: ler" on public.decisions for select to authenticated
  using (user_id = (select auth.uid()));
create policy "decisões: criar para avaliação própria" on public.decisions for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.evaluations e where e.id = evaluation_id and e.user_id = (select auth.uid()))
  );
create policy "decisões: excluir" on public.decisions for delete to authenticated
  using (user_id = (select auth.uid()));

-- Visitante (anon) não escreve em nada.
revoke insert, update, delete on all tables in schema public from anon;

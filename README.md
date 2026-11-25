# VALE?

**O preço é só o começo.** Ferramenta web (PWA) de percepção de valor antes da compra: tempo de trabalho, equivalências, efeito de repetição, custo por uso e relação com metas. Não julga; a decisão é da pessoa.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # opcional
npm run dev                  # http://localhost:5173
npm test                     # testes do motor de cálculo
npm run build                # typecheck + build de produção em dist/
```

Sem variáveis de ambiente o app funciona 100% no aparelho (IndexedDB) e a seção "Conta" não aparece.

## Estrutura

```
packages/engine/        motor de cálculo puro (TS), sem UI nem banco; testes em test/
src/app/                rotas, bootstrap do armazenamento, PWA
src/features/           avaliação, resultado, histórico, metas, perfil, conta, páginas legais
src/components/         ui/ (primitivos) e vale/ (componentes da marca)
src/data/               modelos, repositórios (local, memória, nuvem), sincronização
src/content/            textos da interface e dados institucionais
supabase/               migrations (tabelas, RLS, funções) e seed
```

A interface fala só com a interface `Repository`. Visitante usa `LocalRepository` (IndexedDB; cai para memória se o navegador bloquear). Com login usa `CloudRepository` (Supabase).

## Motor de cálculo

- Todo dinheiro em centavos inteiros. Percentuais com 1 casa, horas em formato amigável.
- Nenhum bloco aparece sem os dados que o sustentam.
- Ocorrências por ano: diária 365, dias úteis 260, semanal n × 52, mensal n × 12.
- Equivalências: mesma categoria + universais, de 1 a 500 unidades, preferindo 2–50, no máximo 3.
- `ENGINE_VERSION` vai em cada snapshot. Mudou fórmula ou arredondamento → suba a versão.

## Dados do IPCA e reajuste de preços

`scripts/ipca.mjs` roda no build (e no dia 12 de cada mês) e consulta a API de agregados do IBGE
(agregado 7060, sem chave). Gera:

- `public/data/ipca.json`: série de 24 meses de variação dos subitens ligados às referências (lido pelo app);
- `public/data/ipca-pesos.json`: peso e variação de todos os subitens, Brasil e Salvador (para análise).

O vínculo referência → subitem fica em `scripts/ipca-map.json`. O app corrige cada preço de referência
pela inflação acumulada dos meses posteriores à data de conferência (`adjustForInflation` no motor) e
mostra "corrigido até mês/ano". Ao conferir um preço de novo, atualize `updatedAt` em
`src/data/seedReferences.ts`: a correção recomeça a partir dessa data. Se a API falhar, o app segue sem reajuste.

## Ativar a nuvem (Supabase)

1. Crie um projeto em supabase.com.
2. SQL Editor → rode, em ordem, os arquivos de `supabase/migrations/` e depois `supabase/seed.sql` (ou `supabase db push` com a CLI).
3. Authentication → URL Configuration: em *Site URL* e *Redirect URLs* coloque o domínio do app (e `http://localhost:5173` para testes).
4. Authentication → Providers: e-mail (link mágico) já vem ligado. Para Google, crie as credenciais OAuth no Google Cloud e cole no provedor.
5. Project Settings → API: copie `Project URL` e a chave **anon public** para `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
   **Nunca** use a `service_role` key no app.

Papel de administrador (para editar referências globais): no SQL Editor,
`update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'voce@exemplo.com';`

## Publicar no GitHub Pages (valeopreco.github.io)

O workflow `.github/workflows/deploy.yml` testa, gera o build e publica a cada push na `main`.

1. Suba o conteúdo desta pasta para `valeopreco/valeopreco.github.io` (branch `main`).
2. No repositório: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Com o Supabase pronto: Settings → Secrets and variables → Actions → aba **Variables** → crie `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (a anon key é pública por design; a service_role nunca).
4. Actions → "Publicar no GitHub Pages" → Run workflow (ou faça um novo push).
5. No Supabase, Authentication → URL Configuration: Site URL `https://valeopreco.github.io` e o mesmo em Redirect URLs.

O GitHub Pages não aceita cabeçalhos HTTP próprios; por isso o build injeta a Content-Security-Policy no HTML. HSTS e `frame-ancestors` só funcionam em hospedagem com cabeçalhos (Vercel, Cloudflare Pages).

## Publicar na Vercel

1. Importe o repositório na Vercel (framework Vite é detectado; `vercel.json` já traz rotas e cabeçalhos de segurança).
2. Em Environment Variables, defina `VITE_SITE_URL` (ex.: `https://vale.app.br`) e, se usar nuvem, as duas do Supabase.
3. Com `VITE_SITE_URL` definido, o build gera canonical, og:url, `sitemap.xml` e aponta o sitemap no `robots.txt`.

## Antes de lançar

- Preços de referência em `src/data/seedReferences.ts` (e `supabase/seed.sql`) são **ilustrativos** e aparecem com selo "estimativa". Troque por preços com fonte e data reais.
- Revise `src/content/site.ts` (responsável e e-mail de contato das páginas legais).
- Rate limit de login: ajuste em Authentication → Rate Limits no Supabase.

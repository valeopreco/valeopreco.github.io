-- VALE? — esquema inicial
-- Dinheiro em centavos (bigint). IDs de avaliações/metas/decisões gerados no aparelho (uuid),
-- para que a migração do visitante seja idempotente.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Perfis
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text check (char_length(nome) <= 80),
  moeda       text not null default 'BRL' check (moeda ~ '^[A-Z]{3}$'),
  created_at  timestamptz not null default now()
);

create table public.financial_profiles (
  user_id              uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  renda_liquida_cents  bigint not null check (renda_liquida_cents > 0 and renda_liquida_cents <= 10000000000),
  horas_mensais        numeric(5,1) not null check (horas_mensais > 0 and horas_mensais <= 744),
  dias_mensais         smallint check (dias_mensais between 1 and 31),
  updated_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Categorias e referências de preço
-- ---------------------------------------------------------------------------
create table public.categories (
  id     smallint primary key,
  nome   text not null,
  slug   text not null unique,
  ativo  boolean not null default true
);

-- "references" é palavra reservada no PostgreSQL; por isso price_references.
create table public.price_references (
  id              text primary key check (char_length(id) between 1 and 64),
  user_id         uuid references auth.users (id) on delete cascade, -- nulo = referência global
  singular        text not null check (char_length(singular) between 1 and 80),
  plural          text not null check (char_length(plural) between 1 and 80),
  categoria_slug  text not null references public.categories (slug),
  preco_cents     bigint not null check (preco_cents > 0),
  fonte           text not null check (char_length(fonte) between 1 and 120),
  atualizado_em   date not null default current_date,
  universal       boolean not null default false,
  estimado        boolean not null default true,
  ativo           boolean not null default true
);
create index price_references_user_idx on public.price_references (user_id);

-- ---------------------------------------------------------------------------
-- Metas
-- ---------------------------------------------------------------------------
create table public.goals (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome               text not null check (char_length(nome) between 1 and 80),
  valor_alvo_cents   bigint not null check (valor_alvo_cents > 0),
  valor_atual_cents  bigint check (valor_atual_cents >= 0),
  prazo              date,
  ativo              boolean not null default true,
  created_at         timestamptz not null default now()
);
create index goals_user_idx on public.goals (user_id);

-- ---------------------------------------------------------------------------
-- Avaliações, snapshots e decisões
-- ---------------------------------------------------------------------------
create table public.evaluations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  descricao       text check (char_length(descricao) <= 120),
  preco_cents     bigint not null check (preco_cents > 0),
  categoria_slug  text references public.categories (slug),
  frequencia      jsonb check (frequencia is null or frequencia ? 'kind'),
  usos_estimados  integer check (usos_estimados between 1 and 100000),
  created_at      timestamptz not null default now()
);
create index evaluations_user_created_idx on public.evaluations (user_id, created_at desc);

-- Imutável: sem policy de update. Avaliações antigas nunca são recalculadas.
create table public.evaluation_snapshots (
  evaluation_id  uuid primary key references public.evaluations (id) on delete cascade,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  parametros     jsonb not null,
  resultados     jsonb not null,
  versao_motor   text not null check (char_length(versao_motor) <= 20)
);

-- Várias por avaliação; a mais recente é a decisão atual.
create table public.decisions (
  id             uuid primary key default gen_random_uuid(),
  evaluation_id  uuid not null references public.evaluations (id) on delete cascade,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  decisao        text not null check (decisao in ('comprar', 'esperar', 'desistir')),
  observacao     text check (char_length(observacao) <= 500),
  created_at     timestamptz not null default now()
);
create index decisions_evaluation_idx on public.decisions (evaluation_id, created_at);

-- ---------------------------------------------------------------------------
-- Perfil criado automaticamente no cadastro
-- ---------------------------------------------------------------------------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

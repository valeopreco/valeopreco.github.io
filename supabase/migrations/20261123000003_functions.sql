-- VALE? — funções chamadas pelo app

-- ---------------------------------------------------------------------------
-- import_guest_data: leva os dados do modo visitante para a conta.
-- SECURITY INVOKER: roda com as permissões do usuário, então o RLS vale normalmente.
-- Idempotente: IDs já existentes são ignorados (on conflict do nothing).
-- Retorna quantos itens foram processados.
-- ---------------------------------------------------------------------------
create function public.import_guest_data(payload jsonb) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  uid   uuid := auth.uid();
  item  jsonb;
  d     jsonb;
  n     integer := 0;
begin
  if uid is null then
    raise exception 'não autenticado' using errcode = '42501';
  end if;
  if payload ->> 'app' is distinct from 'VALE?' then
    raise exception 'formato inválido' using errcode = '22023';
  end if;
  if jsonb_array_length(coalesce(payload -> 'evaluations', '[]')) > 5000
     or jsonb_array_length(coalesce(payload -> 'goals', '[]')) > 200
     or jsonb_array_length(coalesce(payload -> 'references', '[]')) > 500 then
    raise exception 'volume acima do limite' using errcode = '22023';
  end if;

  -- Perfil financeiro: só preenche se a conta ainda não tiver um.
  if payload #> '{settings,financial}' is not null then
    insert into public.financial_profiles (user_id, renda_liquida_cents, horas_mensais, dias_mensais)
    values (
      uid,
      (payload #>> '{settings,financial,netIncomeCents}')::bigint,
      (payload #>> '{settings,financial,monthlyHours}')::numeric,
      (payload #>> '{settings,financial,workDaysPerMonth}')::smallint
    )
    on conflict (user_id) do nothing;
    n := n + 1;
  end if;

  for item in select * from jsonb_array_elements(coalesce(payload -> 'goals', '[]')) loop
    insert into public.goals (id, user_id, nome, valor_alvo_cents, valor_atual_cents, prazo, ativo, created_at)
    values (
      (item ->> 'id')::uuid, uid, item ->> 'name', (item ->> 'targetCents')::bigint,
      (item ->> 'currentCents')::bigint, (item ->> 'deadline')::date,
      coalesce((item ->> 'active')::boolean, true), coalesce((item ->> 'createdAt')::timestamptz, now())
    )
    on conflict (id) do nothing;
    n := n + 1;
  end loop;

  for item in select * from jsonb_array_elements(coalesce(payload -> 'references', '[]')) loop
    insert into public.price_references (id, user_id, singular, plural, categoria_slug, preco_cents, fonte, atualizado_em, universal, estimado, ativo)
    values (
      item ->> 'id', uid, item ->> 'singular', item ->> 'plural', item ->> 'categorySlug',
      (item ->> 'priceCents')::bigint, item ->> 'source', (item ->> 'updatedAt')::date,
      coalesce((item ->> 'universal')::boolean, false), coalesce((item ->> 'estimated')::boolean, false), true
    )
    on conflict (id) do nothing;
    n := n + 1;
  end loop;

  for item in select * from jsonb_array_elements(coalesce(payload -> 'evaluations', '[]')) loop
    insert into public.evaluations (id, user_id, descricao, preco_cents, categoria_slug, frequencia, usos_estimados, created_at)
    values (
      (item ->> 'id')::uuid, uid, item #>> '{input,description}', (item #>> '{input,priceCents}')::bigint,
      item #>> '{input,categorySlug}', item #> '{input,frequency}', (item #>> '{input,estimatedUses}')::integer,
      (item ->> 'createdAt')::timestamptz
    )
    on conflict (id) do nothing;

    insert into public.evaluation_snapshots (evaluation_id, user_id, parametros, resultados, versao_motor)
    values ((item ->> 'id')::uuid, uid, item #> '{snapshot,parameters}', item #> '{snapshot,result}', item #>> '{snapshot,engineVersion}')
    on conflict (evaluation_id) do nothing;

    for d in select * from jsonb_array_elements(coalesce(item -> 'decisions', '[]')) loop
      insert into public.decisions (id, evaluation_id, user_id, decisao, observacao, created_at)
      values ((d ->> 'id')::uuid, (item ->> 'id')::uuid, uid, d ->> 'decision', d ->> 'note', (d ->> 'createdAt')::timestamptz)
      on conflict (id) do nothing;
    end loop;
    n := n + 1;
  end loop;

  return n;
end;
$$;

-- ---------------------------------------------------------------------------
-- delete_my_account: o próprio usuário apaga a conta; tudo sai por cascade.
-- SECURITY DEFINER é necessário para remover de auth.users; só atua sobre auth.uid().
-- ---------------------------------------------------------------------------
create function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'não autenticado' using errcode = '42501';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.import_guest_data(jsonb) from public, anon;
revoke all on function public.delete_my_account()     from public, anon;
grant execute on function public.import_guest_data(jsonb) to authenticated;
grant execute on function public.delete_my_account()     to authenticated;

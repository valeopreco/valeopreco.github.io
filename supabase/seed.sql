-- VALE? — dados iniciais. Gerado a partir de src/data/seedReferences.ts e src/lib/categories.ts.
-- Preços ILUSTRATIVOS (estimado = true). Troque por preços com fonte e data reais quando tiver.

insert into public.categories (id, nome, slug) values
  (1, 'Alimentação', 'alimentacao'),
  (2, 'Transporte', 'transporte'),
  (3, 'Vestuário', 'vestuario'),
  (4, 'Tecnologia', 'tecnologia'),
  (5, 'Lazer', 'lazer'),
  (6, 'Educação', 'educacao'),
  (7, 'Casa', 'casa'),
  (8, 'Saúde e bem-estar', 'saude'),
  (9, 'Serviços', 'servicos'),
  (10, 'Outros', 'outros')
on conflict (slug) do update set nome = excluded.nome;

insert into public.price_references (id, user_id, singular, plural, categoria_slug, preco_cents, fonte, atualizado_em, universal, estimado, ativo) values
  ('seed-cafe', null, 'cafezinho na padaria', 'cafezinhos na padaria', 'alimentacao', 600, 'estimativa do VALE?', '2026-11-23', true, true, true),
  ('seed-refeicao', null, 'refeição simples (prato feito)', 'refeições simples (prato feito)', 'alimentacao', 2500, 'estimativa do VALE?', '2026-11-23', true, true, true),
  ('seed-onibus', null, 'passagem de ônibus urbano', 'passagens de ônibus urbano', 'transporte', 500, 'estimativa do VALE?', '2026-11-23', true, true, true),
  ('seed-pizza', null, 'pizza grande de delivery', 'pizzas grandes de delivery', 'alimentacao', 6000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-corrida', null, 'corrida curta de aplicativo', 'corridas curtas de aplicativo', 'transporte', 1500, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-gasolina', null, 'litro de gasolina', 'litros de gasolina', 'transporte', 650, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-camiseta', null, 'camiseta básica', 'camisetas básicas', 'vestuario', 4000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-meias', null, 'par de meias', 'pares de meias', 'vestuario', 1500, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-streaming', null, 'mês de streaming de vídeo', 'meses de streaming de vídeo', 'tecnologia', 3000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-fone', null, 'fone de ouvido com fio', 'fones de ouvido com fio', 'tecnologia', 5000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-cinema', null, 'ingresso de cinema', 'ingressos de cinema', 'lazer', 3000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-livro', null, 'livro', 'livros', 'educacao', 5000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-curso', null, 'mês de curso de idiomas on-line', 'meses de curso de idiomas on-line', 'educacao', 9000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-limpeza', null, 'kit básico de produtos de limpeza', 'kits básicos de produtos de limpeza', 'casa', 5000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-academia', null, 'mês de academia', 'meses de academia', 'saude', 10000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-corte', null, 'corte de cabelo', 'cortes de cabelo', 'servicos', 3500, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-botijao', null, 'botijão de gás de 13 kg', 'botijões de gás de 13 kg', 'casa', 12000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-perfume', null, 'perfume nacional', 'perfumes nacionais', 'saude', 15000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-internet', null, 'mês de internet em casa', 'meses de internet em casa', 'servicos', 10000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-tenis', null, 'par de tênis esportivo', 'pares de tênis esportivos', 'vestuario', 30000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-pousada', null, 'diária em pousada simples', 'diárias em pousada simples', 'lazer', 20000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-celular', null, 'celular básico', 'celulares básicos', 'tecnologia', 100000, 'estimativa do VALE?', '2026-11-23', false, true, true),
  ('seed-tv', null, 'TV de 43 polegadas', 'TVs de 43 polegadas', 'tecnologia', 180000, 'estimativa do VALE?', '2026-11-23', false, true, true)
on conflict (id) do update set singular = excluded.singular, plural = excluded.plural, preco_cents = excluded.preco_cents, fonte = excluded.fonte, atualizado_em = excluded.atualizado_em;


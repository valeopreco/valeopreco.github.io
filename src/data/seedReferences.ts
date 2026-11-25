import type { PriceReference } from '@vale/engine';

/**
 * Referências iniciais. Os preços são ILUSTRATIVOS (estimated: true) e aparecem
 * na interface com o selo "estimativa". Substitua por preços levantados com fonte
 * e data reais; o mesmo conteúdo existe em supabase/seed.sql.
 */
const SOURCE = 'estimativa do VALE?';
const DATE = '2026-11-23';

type Seed = [id: string, singular: string, plural: string, cat: PriceReference['categorySlug'], reais: number, universal?: boolean];

const rows: Seed[] = [
  ['cafe', 'cafezinho na padaria', 'cafezinhos na padaria', 'alimentacao', 6, true],
  ['refeicao', 'refeição simples (prato feito)', 'refeições simples (prato feito)', 'alimentacao', 25, true],
  ['onibus', 'passagem de ônibus urbano', 'passagens de ônibus urbano', 'transporte', 5, true],
  ['pizza', 'pizza grande de delivery', 'pizzas grandes de delivery', 'alimentacao', 60],
  ['corrida', 'corrida curta de aplicativo', 'corridas curtas de aplicativo', 'transporte', 15],
  ['gasolina', 'litro de gasolina', 'litros de gasolina', 'transporte', 6.5],
  ['camiseta', 'camiseta básica', 'camisetas básicas', 'vestuario', 40],
  ['meias', 'par de meias', 'pares de meias', 'vestuario', 15],
  ['streaming', 'mês de streaming de vídeo', 'meses de streaming de vídeo', 'tecnologia', 30],
  ['fone', 'fone de ouvido com fio', 'fones de ouvido com fio', 'tecnologia', 50],
  ['cinema', 'ingresso de cinema', 'ingressos de cinema', 'lazer', 30],
  ['livro', 'livro', 'livros', 'educacao', 50],
  ['curso', 'mês de curso de idiomas on-line', 'meses de curso de idiomas on-line', 'educacao', 90],
  ['limpeza', 'kit básico de produtos de limpeza', 'kits básicos de produtos de limpeza', 'casa', 50],
  ['academia', 'mês de academia', 'meses de academia', 'saude', 100],
  ['corte', 'corte de cabelo', 'cortes de cabelo', 'servicos', 35],
  // Itens de valor mais alto, para compras maiores não virarem "164 passagens".
  ['botijao', 'botijão de gás de 13 kg', 'botijões de gás de 13 kg', 'casa', 120],
  ['perfume', 'perfume nacional', 'perfumes nacionais', 'saude', 150],
  ['internet', 'mês de internet em casa', 'meses de internet em casa', 'servicos', 100],
  ['tenis', 'par de tênis esportivo', 'pares de tênis esportivos', 'vestuario', 300],
  ['pousada', 'diária em pousada simples', 'diárias em pousada simples', 'lazer', 200],
  ['celular', 'celular básico', 'celulares básicos', 'tecnologia', 1000],
  ['tv', 'TV de 43 polegadas', 'TVs de 43 polegadas', 'tecnologia', 1800],
];

export const SEED_REFERENCES: PriceReference[] = rows.map(([id, singular, plural, categorySlug, reais, universal]) => ({
  id: `seed-${id}`,
  singular,
  plural,
  categorySlug,
  priceCents: Math.round(reais * 100),
  source: SOURCE,
  updatedAt: DATE,
  universal: universal ?? false,
  estimated: true,
  active: true,
}));

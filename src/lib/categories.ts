import type { CategorySlug } from '@vale/engine';

export interface Category {
  slug: CategorySlug;
  name: string;
}

/** Ordem e nomes definidos no briefing. */
export const CATEGORIES: Category[] = [
  { slug: 'alimentacao', name: 'Alimentação' },
  { slug: 'transporte', name: 'Transporte' },
  { slug: 'vestuario', name: 'Vestuário' },
  { slug: 'tecnologia', name: 'Tecnologia' },
  { slug: 'lazer', name: 'Lazer' },
  { slug: 'educacao', name: 'Educação' },
  { slug: 'casa', name: 'Casa' },
  { slug: 'saude', name: 'Saúde e bem-estar' },
  { slug: 'servicos', name: 'Serviços' },
  { slug: 'outros', name: 'Outros' },
];

export function categoryName(slug?: CategorySlug): string | undefined {
  return CATEGORIES.find((c) => c.slug === slug)?.name;
}

import type { Cents } from './types';

export const MAX_PRICE_CENTS = 100_000_000_00; // R$ 100 milhões: limite de sanidade

/** Arredonda para o centavo inteiro mais próximo (meio para cima). */
export function roundCents(value: number): Cents {
  return Math.round(value + Number.EPSILON);
}

/** Percentual com uma casa decimal. */
export function roundPct(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

/**
 * Converte texto digitado em pt-BR para centavos.
 * Aceita "300", "300,5", "300,50", "1.299,90", "R$ 25". Retorna null se inválido.
 */
export function parseBRL(text: string): Cents | null {
  const clean = text.replace(/R\$|\s/g, '');
  if (!/^\d{1,3}(\.\d{3})*(,\d{0,2})?$|^\d+(,\d{0,2})?$/.test(clean)) return null;
  const [intPart = '0', decPart = ''] = clean.replace(/\./g, '').split(',');
  const cents = Number(intPart) * 100 + Number((decPart + '00').slice(0, 2));
  return Number.isSafeInteger(cents) ? cents : null;
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brlNoCents = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/** Formata centavos em reais. Sem centavos quando o valor é inteiro e compact=true. */
export function formatBRL(cents: Cents, opts: { compact?: boolean } = {}): string {
  if (opts.compact && cents % 100 === 0) return brlNoCents.format(cents / 100);
  return brl.format(cents / 100);
}

export function formatPct(value: number): string {
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

import type { Block, Cents, Frequency, RecurrenceData } from './types';
import { roundCents } from './money';

export const MAX_TIMES = 100;

/** Ocorrências por ano para cada frequência. Dias úteis = 5 × 52. */
export function occurrencesPerYear(f: Frequency): number {
  switch (f.kind) {
    case 'once':
      return 1;
    case 'daily':
      return 365;
    case 'weekdays':
      return 260;
    case 'weekly':
      return f.times * 52;
    case 'monthly':
      return f.times * 12;
  }
}

export function frequencyLabel(f: Frequency): string {
  switch (f.kind) {
    case 'once':
      return 'compra única';
    case 'daily':
      return 'todos os dias';
    case 'weekdays':
      return 'nos dias úteis';
    case 'weekly':
      return f.times === 1 ? '1 vez por semana' : `${f.times} vezes por semana`;
    case 'monthly':
      return f.times === 1 ? '1 vez por mês' : `${f.times} vezes por mês`;
  }
}

export function computeRecurrence(priceCents: Cents, frequency?: Frequency): Block<RecurrenceData> {
  if (!frequency) return { available: false, missing: 'no-frequency' };
  if (frequency.kind === 'once') return { available: false, missing: 'one-time-purchase' };
  const occ = occurrencesPerYear(frequency);
  const yearly = priceCents * occ;
  return {
    available: true,
    data: {
      occurrencesPerYear: occ,
      yearlyCents: yearly,
      monthlyAverageCents: roundCents(yearly / 12),
      frequencyLabel: frequencyLabel(frequency),
    },
  };
}

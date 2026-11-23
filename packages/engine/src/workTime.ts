import type { Block, Cents, FinancialProfile, WorkTimeData } from './types';
import { roundCents } from './money';

function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

/**
 * Converte horas em texto amigável evitando falsa precisão:
 * - menos de 1 h: minutos em múltiplos de 5;
 * - de 1 a 10 h: meia hora;
 * - acima de 10 h: horas inteiras.
 */
export function formatHours(hours: number): string {
  const minutes = hours * 60;
  if (minutes < 2.5) return 'menos de 5 minutos';
  if (minutes < 57.5) {
    const m = Math.max(5, Math.round(minutes / 5) * 5);
    return `cerca de ${m} minutos`;
  }
  if (hours < 10.25) {
    const halves = Math.round(hours * 2);
    const whole = Math.floor(halves / 2);
    const half = halves % 2 === 1;
    if (whole === 0) return 'cerca de meia hora';
    return `cerca de ${whole} ${plural(whole, 'hora', 'horas')}${half ? ' e meia' : ''}`;
  }
  const h = Math.round(hours);
  return `cerca de ${h.toLocaleString('pt-BR')} horas`;
}

/** Dias de trabalho, arredondados para meio dia. Só faz sentido a partir de meio dia. */
export function formatWorkDays(days: number): string | undefined {
  const halves = Math.round(days * 2);
  if (halves < 1) return undefined;
  const whole = Math.floor(halves / 2);
  const half = halves % 2 === 1;
  if (whole === 0) return 'cerca de meio dia de trabalho';
  return `cerca de ${whole.toLocaleString('pt-BR')} ${plural(whole, 'dia', 'dias')}${half ? ' e meio' : ''} de trabalho`;
}

export function computeWorkTime(priceCents: Cents, financial?: FinancialProfile): Block<WorkTimeData> {
  if (!financial || !(financial.netIncomeCents > 0) || !(financial.monthlyHours > 0)) {
    return { available: false, missing: 'financial-profile' };
  }
  const rate = financial.netIncomeCents / financial.monthlyHours; // centavos por hora
  const hours = priceCents / rate;
  const data: WorkTimeData = {
    hourlyRateCents: roundCents(rate),
    hours,
    label: formatHours(hours),
  };
  const days = financial.workDaysPerMonth;
  if (days && days > 0) {
    const hoursPerDay = financial.monthlyHours / days;
    const daysLabel = formatWorkDays(hours / hoursPerDay);
    if (daysLabel && hours >= hoursPerDay / 2) data.daysLabel = daysLabel;
  }
  return { available: true, data };
}

import type { Block, Cents, CostPerUseData } from './types';
import { roundCents } from './money';

export function computeCostPerUse(priceCents: Cents, estimatedUses?: number): Block<CostPerUseData> {
  if (!estimatedUses || !Number.isInteger(estimatedUses) || estimatedUses < 1) {
    return { available: false, missing: 'no-estimated-uses' };
  }
  return {
    available: true,
    data: { cents: roundCents(priceCents / estimatedUses), uses: estimatedUses, estimated: true },
  };
}

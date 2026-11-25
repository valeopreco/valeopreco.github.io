import { adjustForInflation, type MonthlySeries, type PriceReference } from '@vale/engine';

/** Formato de public/data/ipca.json, gerado no build por scripts/ipca.mjs. */
export interface IpcaData {
  fonte: string;
  periodo: string;
  geradoEm: string;
  referencias: Record<string, { codigo: string; subitem: string; indice: string; serie: MonthlySeries }>;
}

let cache: Promise<IpcaData | null> | null = null;

/** Carrega uma vez por sessão. Sem arquivo ou sem rede, segue sem reajuste. */
export function loadIpca(): Promise<IpcaData | null> {
  cache ??= fetch(`${import.meta.env.BASE_URL}data/ipca.json`, { cache: 'no-cache' })
    .then((r) => (r.ok ? (r.json() as Promise<IpcaData>) : null))
    .then((d) => (d && typeof d === 'object' && d.referencias ? d : null))
    .catch(() => null);
  return cache;
}

/**
 * Corrige as referências padrão pela inflação acumulada desde a data em que o preço foi
 * conferido. Só referências com subitem do IPCA ligado (ids "seed-<chave>") mudam.
 */
export function applyIpca(refs: PriceReference[], data: IpcaData | null): PriceReference[] {
  if (!data) return refs;
  return refs.map((ref) => {
    const link = data.referencias[ref.id.replace(/^seed-/, '')];
    if (!link) return ref;
    const adj = adjustForInflation(ref.priceCents, ref.updatedAt, link.serie);
    if (!adj.through) return ref;
    return { ...ref, priceCents: adj.cents, adjustment: { through: adj.through, pct: adj.pct, index: link.indice } };
  });
}

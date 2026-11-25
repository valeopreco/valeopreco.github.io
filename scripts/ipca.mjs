// Busca na API de agregados do IBGE (gratuita, sem chave) o peso e a variação de cada
// subitem do IPCA no último mês divulgado, para o Brasil e para a RM de Salvador.
// Saída: public/data/ipca.json. Se a API falhar, mantém o arquivo anterior e não quebra o build.
//
// Agregado 7060 = IPCA a partir de jan/2020 · variável 63 = variação mensal (%) · 66 = peso mensal (%)
// Classificação 315 = Geral, grupo, subgrupo, item e subitem.
import { mkdir, writeFile, readFile } from 'node:fs/promises';

const MESES = 24; // série mensal guardada para corrigir preços conferidos até 2 anos atrás
const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const API = 'https://servicodados.ibge.gov.br/api/v3/agregados/7060';
// ipca.json (pequeno, lido pelo app) · ipca-pesos.json (pesos de todos os subitens, para análise).
const OUT = new URL('../public/data/ipca.json', import.meta.url);
const OUT_PESOS = new URL('../public/data/ipca-pesos.json', import.meta.url);

async function get(path) {
  const res = await fetch(`${API}${path}`, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`IBGE ${res.status} em ${path}`);
  return res.json();
}

function nivel(codigo) {
  // Códigos do IPCA: 1 dígito = grupo, 2 = subgrupo, 4 = item, 7 = subitem.
  return { 1: 'grupo', 2: 'subgrupo', 4: 'item', 7: 'subitem' }[codigo.length] ?? 'geral';
}

async function main() {
  // Brasil + todas as regiões metropolitanas; depois fica só Brasil e Salvador.
  const locs = 'N1[all]|N7[all]';

  const data = await get(`/periodos/-1/variaveis/63|66?localidades=${locs}&classificacao=315[all]`);
  const byVar = Object.fromEntries(data.map((v) => [v.id, v]));
  const periodo = Object.keys(data[0].resultados[0].series[0].serie)[0]; // ex.: 202610

  const regioes = {};
  for (const varId of ['63', '66']) {
    for (const r of byVar[varId].resultados) {
      const [catId, rotulo] = Object.entries(r.classificacoes[0].categoria)[0];
      const [codigo, ...resto] = rotulo.split('.');
      const nome = resto.join('.').trim() || rotulo;
      for (const s of r.series) {
        if (!/^brasil$|salvador/i.test(s.localidade.nome)) continue;
        const reg = (regioes[s.localidade.nome] ??= {});
        const row = (reg[catId] ??= { id: catId, codigo, nome, nivel: nivel(codigo) });
        const v = Number(String(s.serie[periodo]).replace(',', '.'));
        row[varId === '63' ? 'variacaoMes' : 'peso'] = Number.isFinite(v) ? v : null;
      }
    }
  }

  // Série mensal dos subitens ligados às referências de preço (scripts/ipca-map.json).
  const mapa = JSON.parse(await readFile(new URL('./ipca-map.json', import.meta.url), 'utf8'));
  delete mapa._comentario;
  const brasil = Object.values(regioes.Brasil ?? {});
  const porNome = new Map(brasil.filter((r) => r.nivel === 'subitem').map((r) => [norm(r.nome), r]));
  const ligados = {};
  const semPar = [];
  for (const [ref, nomes] of Object.entries(mapa)) {
    const achado = nomes.map((n) => porNome.get(norm(n))).find(Boolean);
    if (achado) ligados[ref] = achado;
    else semPar.push(`${ref} (${nomes.join(' / ')})`);
  }
  if (semPar.length) {
    console.log(`\nReferências sem subitem no IPCA: ${semPar.join('; ')}`);
    const palavras = semPar.flatMap((t) => t.match(/[\p{L}]{4,}/gu) ?? []).map(norm);
    const parecidos = [...porNome.values()].filter((r) => palavras.some((p) => norm(r.nome).includes(p.slice(0, 5))));
    console.log(`Subitens parecidos: ${parecidos.map((r) => r.nome).join('; ')}`);
  }

  const ids = [...new Set(Object.values(ligados).map((r) => r.id))];
  const referencias = {};
  if (ids.length) {
    const serie = await get(`/periodos/-${MESES}/variaveis/63?localidades=${locs}&classificacao=315[${ids.join(',')}]`);
    const porCat = {};
    for (const r of serie[0].resultados) {
      const catId = Object.keys(r.classificacoes[0].categoria)[0];
      for (const s of r.series) {
        if (!/^brasil$|salvador/i.test(s.localidade.nome)) continue;
        const valores = Object.fromEntries(
          Object.entries(s.serie)
            .map(([m, v]) => [m, Number(String(v).replace(',', '.'))])
            .filter(([, v]) => Number.isFinite(v)),
        );
        (porCat[catId] ??= {})[/salvador/i.test(s.localidade.nome) ? 'salvador' : 'brasil'] = valores;
      }
    }
    for (const [ref, sub] of Object.entries(ligados)) {
      const s = porCat[sub.id] ?? {};
      // Prefere Salvador; usa Brasil se a RM não tiver o subitem.
      const usarSalvador = s.salvador && Object.keys(s.salvador).length > 0;
      referencias[ref] = {
        codigo: sub.codigo,
        subitem: sub.nome,
        indice: usarSalvador ? 'IPCA/IBGE, Salvador' : 'IPCA/IBGE, Brasil',
        serie: (usarSalvador ? s.salvador : s.brasil) ?? {},
      };
    }
    console.log(`\nReferências ligadas ao IPCA: ${Object.entries(referencias).map(([k, v]) => `${k} → ${v.subitem} (${v.indice.split(', ')[1]})`).join('; ')}`);
  }

  const meta = {
    fonte: 'IBGE, IPCA (agregado 7060, Sidra) via servicodados.ibge.gov.br',
    periodo: `${periodo.slice(0, 4)}-${periodo.slice(4)}`,
    geradoEm: new Date().toISOString().slice(0, 10),
  };
  const out = {
    ...meta,
    regioes: Object.fromEntries(
      Object.entries(regioes).map(([nome, rows]) => [nome, Object.values(rows).sort((a, b) => (b.peso ?? 0) - (a.peso ?? 0))]),
    ),
  };

  await mkdir(new URL('.', OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify({ ...meta, referencias }));
  await writeFile(OUT_PESOS, JSON.stringify(out));
  console.log(`\nipca.json: ${JSON.stringify({ ...meta, referencias }).length} bytes`);

  // Resumo no log do GitHub Actions: os 25 subitens com maior peso no orçamento.
  for (const [nome, rows] of Object.entries(out.regioes)) {
    console.log(`\n== ${nome} · IPCA ${out.periodo} · subitens com maior peso ==`);
    rows
      .filter((r) => r.nivel === 'subitem')
      .slice(0, 25)
      .forEach((r, i) => console.log(`${String(i + 1).padStart(2)}. ${r.nome} — peso ${r.peso}% · mês ${r.variacaoMes}%`));
  }
  console.log(`\nTotal de subitens: ${Object.values(out.regioes)[0].filter((r) => r.nivel === 'subitem').length}`);
}

main().catch(async (e) => {
  console.warn(`Aviso: não foi possível atualizar o IPCA (${e.message}).`);
  try {
    await readFile(OUT);
    console.warn('Mantendo public/data/ipca.json anterior.');
  } catch {
    console.warn('Sem arquivo anterior; o app segue sem dados do IPCA.');
  }
});

/**
 * Gera lab/material/vale-semente.md a partir do código atual do VALE?:
 * o que o app é, o tom, os textos da interface e exemplos reais calculados pelo motor.
 * Assim o material enviado ao MiroFish nunca fica desatualizado em relação ao app.
 *
 * Uso: npm run lab:material
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { evaluate, formatBRL, formatPct, type EvaluationInput } from '../packages/engine/src';
import { SEED_REFERENCES } from '../src/data/seedReferences';
import { CATEGORIES } from '../src/lib/categories';
import { copy } from '../src/content/copy';
import { VARIANTES } from './variantes';

const financeiro = { netIncomeCents: 240000, monthlyHours: 176, workDaysPerMonth: 22 };
const meta = [{ id: 'm', name: 'Viagem de fim de ano', targetCents: 300000, active: true }];

const exemplos: { titulo: string; input: EvaluationInput }[] = [
  { titulo: 'Dois pastéis de carne-seca', input: { description: 'Dois pastéis de carne-seca', priceCents: 4000, categorySlug: 'alimentacao' } },
  { titulo: 'Revista em quadrinhos', input: { description: 'Revista em quadrinhos', priceCents: 4500, categorySlug: 'lazer', estimatedUses: 10 } },
  { titulo: 'Lanche no delivery toda semana', input: { description: 'Lanche no delivery', priceCents: 4500, categorySlug: 'alimentacao', frequency: { kind: 'weekly', times: 1 } } },
  { titulo: 'Tênis de corrida', input: { description: 'Tênis de corrida', priceCents: 30000, categorySlug: 'vestuario', estimatedUses: 100 } },
  { titulo: 'Celular novo', input: { description: 'Celular novo', priceCents: 180000, categorySlug: 'tecnologia', estimatedUses: 700 } },
];

function exemplo(input: EvaluationInput): string {
  const r = evaluate(input, { financial: financeiro, goals: meta, references: SEED_REFERENCES });
  const l: string[] = [`- Preço: ${formatBRL(input.priceCents)}`];
  if (r.workTime.available) l.push(`- ${copy.q.workTime} → ${r.workTime.data.label} do seu trabalho${r.workTime.data.daysLabel ? ` (${r.workTime.data.daysLabel})` : ''}`);
  if (r.equivalences.available)
    l.push(`- ${copy.q.equivalences} → ${r.equivalences.data.items.map((i) => `${i.quantity} ${i.label}`).join(' · ')}`);
  if (r.recurrence.available) l.push(`- ${copy.q.recurrence} → ${formatBRL(r.recurrence.data.yearlyCents)} (${r.recurrence.data.frequencyLabel})`);
  if (r.costPerUse.available) l.push(`- ${copy.q.costPerUse} → ${formatBRL(r.costPerUse.data.cents)} por uso (${r.costPerUse.data.uses} usos estimados)`);
  if (r.goals.available) l.push(`- ${copy.q.goals} → ${r.goals.data.items.map((g) => `${formatPct(g.pctOfTarget)} da meta "${g.name}"`).join('; ')}`);
  return l.join('\n');
}

const md = `# VALE? — material-semente para o laboratório de público

> Gerado automaticamente em ${new Date().toISOString().slice(0, 10)} a partir do código do app. Não edite à mão: rode \`npm run lab:material\`.

## O produto

O VALE? é um app web gratuito, em português do Brasil, usado **antes de comprar**. A pessoa informa o preço de algo
que quer comprar e vê o que esse valor representa: quanto tempo de trabalho custa, o que mais caberia no mesmo
dinheiro, quanto um hábito soma em um ano, quanto custa cada uso e como a compra se compara a um objetivo pessoal.
Assinatura: "${copy.tagline}" Assinatura secundária: "${copy.subtagline}"

Princípio central: **o VALE? não julga o consumo**. Não diz "não compre", "você gasta demais" ou "economize".
Às vezes vale gastar com sonhos e desejos; o app só amplia a percepção para a decisão ser consciente. A decisão
final (comprar, esperar ou desistir) é sempre da pessoa.

História que inspirou o app: o criador se arrependeu de gastar R$ 40 em dois pastéis de carne-seca em vez de
comprar uma revista em quadrinhos que queria, que achou cara, mesmo sendo um bem muito mais durável.

## Público (hipóteses a testar, não dados medidos)

- Adultos de 30 anos ou mais, de diferentes rendas e escolaridades, muitos no interior da Bahia e no Nordeste.
- Usam o celular (muitas vezes Android simples) como principal tela.
- O tom desejado é leve e bem-humorado, mas sem exagero: gíria demais pode afastar quem tem 30+.
- Comparações com objetos reais e conhecidos funcionam melhor do que números abstratos.

## Como o app fala hoje (textos reais da interface)

- Chamada inicial: "${copy.homeIntro}"
- Perguntas dos blocos: ${Object.values(copy.q).map((q) => `"${q}"`).join(', ')}
- Convite para informar renda: "${copy.setup.workTime}"
- Aviso sobre metas: "${copy.goalsDisclaimer}"
- Sobre registrar a decisão: "${copy.decisionHint}"

## Itens usados nas comparações

${CATEGORIES.map((c) => {
  const refs = SEED_REFERENCES.filter((r) => r.categorySlug === c.slug);
  return refs.length ? `- ${c.name}: ${refs.map((r) => `${r.singular} (${formatBRL(r.priceCents)})`).join(', ')}` : null;
})
  .filter(Boolean)
  .join('\n')}

Preços ilustrativos (estimativa do VALE?), não levantados em loja.

## Exemplos reais do resultado

Pessoa fictícia de exemplo: renda líquida de ${formatBRL(financeiro.netIncomeCents)} por mês, ${financeiro.monthlyHours} h trabalhadas,
meta "Viagem de fim de ano" de ${formatBRL(meta[0]!.targetCents)}.

${exemplos.map((e) => `### ${e.titulo}\n\n${exemplo(e.input)}`).join('\n\n')}

## Duas versões de tom para comparar

${VARIANTES.map((v) => `### ${v.momento}\n\n- **A (atual):** ${v.a}\n- **B (mais descontraída):** ${v.b}`).join('\n\n')}
`;

mkdirSync(new URL('./material/', import.meta.url), { recursive: true });
writeFileSync(new URL('./material/vale-semente.md', import.meta.url), md);
console.log(`lab/material/vale-semente.md gerado (${md.length} caracteres).`);

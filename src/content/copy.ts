/**
 * Textos da interface num lugar só, para revisar o tom.
 * Regra: perguntar e mostrar, nunca julgar. Sem "gastando demais", "não vale a pena", "economize".
 */
export const copy = {
  tagline: 'O preço é só o começo.',
  subtagline: 'Enxergue o valor por trás de cada escolha.',
  homeIntro: 'Diga quanto custa. O VALE? mostra o que esse valor representa no seu tempo, nos seus hábitos e nos seus objetivos. A decisão continua sua.',
  submit: 'Ver o que está por trás do preço',
  privacyNote: 'Sem cadastro. O que você digitar fica guardado neste aparelho.',

  q: {
    workTime: 'Quanto do seu tempo representa essa escolha?',
    equivalences: 'O que mais poderia caber nesse valor?',
    recurrence: 'Quanto esse hábito representa ao longo de um ano?',
    costPerUse: 'Quanto custa cada uso?',
    goals: 'Como essa escolha se relaciona com seus objetivos?',
    decision: 'E então, o que você decidiu?',
  },

  setup: {
    workTime: 'Informe sua renda líquida e as horas que trabalha por mês para ver quanto tempo de trabalho cabe nesse preço.',
    workTimeCta: 'Informar renda e horas',
    goals: 'Cadastre um objetivo, como uma viagem ou um curso, para ver essa compra em relação a ele.',
    goalsCta: 'Criar um objetivo',
  },

  goalsDisclaimer: 'É uma comparação matemática. Não quer dizer que esse dinheiro estava separado para a meta.',
  costPerUseNote: (uses: number) => `Com base na sua estimativa de ${uses.toLocaleString('pt-BR')} ${uses === 1 ? 'uso' : 'usos'}.`,

  decisions: {
    comprar: { label: 'Comprar', past: 'Você decidiu comprar.' },
    esperar: { label: 'Esperar', past: 'Você decidiu esperar.' },
    desistir: { label: 'Desistir', past: 'Você decidiu desistir.' },
  },
  decisionHint: 'Registrar ajuda a perceber, com o tempo, como você costuma decidir.',
} as const;

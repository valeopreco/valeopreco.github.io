# VALE? — material-semente para o laboratório de público

> Gerado automaticamente em 2026-11-27 a partir do código do app. Não edite à mão: rode `npm run lab:material`.

## O produto

O VALE? é um app web gratuito, em português do Brasil, usado **antes de comprar**. A pessoa informa o preço de algo
que quer comprar e vê o que esse valor representa: quanto tempo de trabalho custa, o que mais caberia no mesmo
dinheiro, quanto um hábito soma em um ano, quanto custa cada uso e como a compra se compara a um objetivo pessoal.
Assinatura: "O preço é só o começo." Assinatura secundária: "Enxergue o valor por trás de cada escolha."

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

- Chamada inicial: "Diga quanto custa. O VALE? mostra o que esse valor representa no seu tempo, nos seus hábitos e nos seus objetivos. A decisão continua sua."
- Perguntas dos blocos: "Quanto do seu tempo representa essa escolha?", "O que mais poderia caber nesse valor?", "Quanto esse hábito representa ao longo de um ano?", "Quanto custa cada uso?", "Como essa escolha se relaciona com seus objetivos?", "E então, o que você decidiu?"
- Convite para informar renda: "Informe sua renda líquida e as horas que trabalha por mês para ver quanto tempo de trabalho cabe nesse preço."
- Aviso sobre metas: "É uma comparação matemática. Não quer dizer que esse dinheiro estava separado para a meta."
- Sobre registrar a decisão: "Registrar ajuda a perceber, com o tempo, como você costuma decidir."

## Itens usados nas comparações

- Alimentação: cafezinho na padaria (R$ 6,00), refeição simples (prato feito) (R$ 25,00), pizza grande de delivery (R$ 60,00)
- Transporte: passagem de ônibus urbano (R$ 5,00), corrida curta de aplicativo (R$ 15,00), litro de gasolina (R$ 6,50)
- Vestuário: camiseta básica (R$ 40,00), par de meias (R$ 15,00), par de tênis esportivo (R$ 300,00)
- Tecnologia: mês de streaming de vídeo (R$ 30,00), fone de ouvido com fio (R$ 50,00), celular básico (R$ 1.000,00), TV de 43 polegadas (R$ 1.800,00)
- Lazer: ingresso de cinema (R$ 30,00), diária em pousada simples (R$ 200,00)
- Educação: livro (R$ 50,00), mês de curso de idiomas on-line (R$ 90,00)
- Casa: kit básico de produtos de limpeza (R$ 50,00), botijão de gás de 13 kg (R$ 120,00)
- Saúde e bem-estar: mês de academia (R$ 100,00), perfume nacional (R$ 150,00)
- Serviços: corte de cabelo (R$ 35,00), mês de internet em casa (R$ 100,00)

Preços ilustrativos (estimativa do VALE?), não levantados em loja.

## Exemplos reais do resultado

Pessoa fictícia de exemplo: renda líquida de R$ 2.400,00 por mês, 176 h trabalhadas,
meta "Viagem de fim de ano" de R$ 3.000,00.

### Dois pastéis de carne-seca

- Preço: R$ 40,00
- Quanto do seu tempo representa essa escolha? → cerca de 3 horas do seu trabalho
- O que mais poderia caber nesse valor? → 6 cafezinhos na padaria · 6 litros de gasolina · 2 pares de meias
- Como essa escolha se relaciona com seus objetivos? → 1,3% da meta "Viagem de fim de ano"

### Revista em quadrinhos

- Preço: R$ 45,00
- Quanto do seu tempo representa essa escolha? → cerca de 3 horas e meia do seu trabalho
- O que mais poderia caber nesse valor? → 1 ingresso de cinema · 6 litros de gasolina · 7 cafezinhos na padaria
- Quanto custa cada uso? → R$ 4,50 por uso (10 usos estimados)
- Como essa escolha se relaciona com seus objetivos? → 1,5% da meta "Viagem de fim de ano"

### Lanche no delivery toda semana

- Preço: R$ 45,00
- Quanto do seu tempo representa essa escolha? → cerca de 3 horas e meia do seu trabalho
- O que mais poderia caber nesse valor? → 7 cafezinhos na padaria · 6 litros de gasolina · 3 pares de meias
- Quanto esse hábito representa ao longo de um ano? → R$ 2.340,00 (1 vez por semana)
- Como essa escolha se relaciona com seus objetivos? → 1,5% da meta "Viagem de fim de ano"

### Tênis de corrida

- Preço: R$ 300,00
- Quanto do seu tempo representa essa escolha? → cerca de 22 horas do seu trabalho (cerca de 3 dias de trabalho)
- O que mais poderia caber nesse valor? → 7 camisetas básicas · 6 fones de ouvido com fio · 6 kits básicos de produtos de limpeza
- Quanto custa cada uso? → R$ 3,00 por uso (100 usos estimados)
- Como essa escolha se relaciona com seus objetivos? → 10,0% da meta "Viagem de fim de ano"

### Celular novo

- Preço: R$ 1.800,00
- Quanto do seu tempo representa essa escolha? → cerca de 132 horas do seu trabalho (cerca de 16 dias e meio de trabalho)
- O que mais poderia caber nesse valor? → 36 fones de ouvido com fio · 6 pares de tênis esportivos · 9 diárias em pousada simples
- Quanto custa cada uso? → R$ 2,57 por uso (700 usos estimados)
- Como essa escolha se relaciona com seus objetivos? → 60,0% da meta "Viagem de fim de ano"

## Duas versões de tom para comparar

### Chamada da tela inicial

- **A (atual):** Diga quanto custa. O VALE? mostra o que esse valor representa no seu tempo, nos seus hábitos e nos seus objetivos. A decisão continua sua.
- **B (mais descontraída):** Antes de passar o cartão, dá uma olhada no que esse preço significa de verdade. Quem decide é você, a gente só acende a luz.

### Equivalências

- **A (atual):** O que mais poderia caber nesse valor? 6 botijões de gás de 13 kg · 5 perfumes nacionais · 8 meses de internet em casa
- **B (mais descontraída):** Com esse dinheiro, daria para levar 6 botijões de gás. Ou 5 perfumes. Ou pagar a internet de casa por 8 meses.

### Tempo de trabalho

- **A (atual):** Quanto do seu tempo representa essa escolha? Cerca de 20 horas do seu trabalho.
- **B (mais descontraída):** Isso dá umas 20 horas de trabalho. Vale cada minuto? Só você sabe.

### Hábito ao longo do ano

- **A (atual):** Quanto esse hábito representa ao longo de um ano? R$ 2.340,00 em um ano, comprando 1 vez por semana.
- **B (mais descontraída):** Toda semana parece pouco, né? No fim do ano, são R$ 2.340. Dá uma viagem de fim de semana.

### Convite para informar a renda

- **A (atual):** Informe sua renda líquida e as horas que trabalha por mês para ver quanto tempo de trabalho cabe nesse preço.
- **B (mais descontraída):** Quer ver isso em horas de trabalho? Conta pra gente quanto você recebe e quantas horas trabalha. Fica só no seu celular.

### Depois da decisão

- **A (atual):** Registrar ajuda a perceber, com o tempo, como você costuma decidir.
- **B (mais descontraída):** Anotado! Com o tempo, você vai ver o seu jeito de decidir. Sem julgamento.

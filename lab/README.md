# Laboratório de público do VALE?

Ferramenta **de pesquisa, fora do app**. Usa o [MiroFish](https://github.com/666ghj/MiroFish), que cria uma
população simulada de pessoas (agentes de IA) e mostra como ela reage a um material. Aqui o material é o próprio
VALE?: o tom das mensagens e as comparações de preço, antes de mostrar para gente de verdade.

Nada desta pasta vai para o site. O app continua sem IA nos cálculos, como manda o briefing.

> **Simulação não é pesquisa.** Agentes de IA imitam opiniões, não as têm. Use o laboratório para descartar ideias
> ruins e escolher o que levar a pessoas reais, nunca como prova de que algo funciona.

## 1. Instalar o MiroFish (uma vez, no seu computador)

Precisa de Node.js 18+, Python 3.11 ou 3.12 e [uv](https://docs.astral.sh/uv/). Confira com
`node -v`, `python --version` e `uv --version`.

```bash
git clone https://github.com/666ghj/MiroFish.git
cd MiroFish
cp .env.example .env
```

Preencha o `.env`:

| Variável | O que colocar |
| --- | --- |
| `LLM_API_KEY` | chave do provedor de IA |
| `LLM_BASE_URL` | endereço compatível com a API da OpenAI (o projeto usa o Qwen via Bailian como exemplo) |
| `LLM_MODEL_NAME` | nome do modelo (ex.: `qwen-plus`) |
| `ZEP_API_KEY` | chave do Zep Cloud (o plano grátis basta para testes simples) |

```bash
npm run setup:all   # instala frontend e backend
npm run dev         # abre em http://localhost:3000
```

Alternativa com Docker: `docker compose up -d` (mesmas portas, 3000 e 5001).

**Segurança:** o `.env` do MiroFish fica na pasta dele, nunca neste repositório. Não use dados reais de quem usa o VALE?.

## 2. Gerar o material do VALE?

Neste repositório:

```bash
npm run lab:material
```

Cria `lab/material/vale-semente.md` com o que o app é, o público, os textos atuais, exemplos de resultado
calculados pelo motor e as variantes de tom (`lab/variantes.ts`). Rode de novo sempre que mudar textos ou preços.

## 3. Rodar um experimento

1. No MiroFish, envie `lab/material/vale-semente.md` como material-semente.
2. Copie o pedido de um experimento de [`experimentos.md`](./experimentos.md) e cole como requisito de previsão.
3. **Comece pequeno:** menos de 40 rodadas. O projeto avisa que o consumo de IA é alto.
4. Leia o relatório e converse com 2 ou 3 agentes de perfis diferentes.
5. Anote o resultado copiando [`resultados/MODELO.md`](./resultados/MODELO.md).

## 4. Controle de custo

- Uma simulação por experimento, com poucas rodadas, antes de qualquer coisa maior.
- Prefira um modelo barato para explorar e um melhor só para confirmar.
- Defina um limite de gasto no painel do provedor de IA.

## Depois do laboratório

Leve as 2 ou 3 melhores ideias para 5 ou 6 pessoas reais do público (30+). Se as pessoas reais concordarem com a
simulação, a mudança entra no app.

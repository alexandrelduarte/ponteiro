# VOZ — o sistema de linguagem do PONTEIRO

**Fase 5 do redesign.** Este documento decide **como o produto fala**. Ele é a regra; o texto
pronto para colar está em `docs/COPY-DECK.md`.

Referências obrigatórias: `docs/MARCA.md` (nome, tagline, personalidade verbal),
`docs/TENDENCIAS-2026.md` (P1 frequências contáveis · P2 texto é dado · P3 linguagem simples),
`docs/DESIGN-V2.md` (o sistema ENXAME), `docs/INVENTARIO.md` (nada pode sumir).

**A camada técnica original não é substituída.** Ela permanece íntegra em `/metodologia`. O que
está aqui é uma **camada a mais** — a tradução — e ela nunca tem o direito de dizer menos verdade
do que o original.

---

## 0. Para quem escrevemos

Uma pessoa adulta, num celular Android barato, com dados móveis contados, que quer saber quem está
ganhando e não tem obrigação nenhuma de saber estatística. **29% dos brasileiros de 15 a 64 anos
estão em analfabetismo funcional** (INAF 2024): decodificar um rótulo difícil já gasta o orçamento
mental que deveria ir para entender o conteúdo.

Escrevemos como um bom professor de escola pública explicando o boletim para a família. Não como um
analista de banco, não como um jornal de economia, e não como quem fala com criança.

**Regra-mãe:** se a frase precisa ser lida duas vezes, ela está errada. Se a frase ficou fácil
porque escondeu a dúvida, ela está errada e é pior.

---

## 1. Os oito princípios de escrita

### 1.1 Uma ideia por frase

Frase de até ~20 palavras. Duas ideias pedem duas frases, não uma vírgula.

> ✗ A probabilidade projetada para o dia da votação incorpora, além da incerteza atual, a deriva da
> opinião pública, que cresce com a raiz do tempo restante.
> ✓ Até outubro a corrida ainda pode andar. Por isso o número do dia da votação é menos cravado que
> o de hoje.

### 1.2 Voz ativa, sujeito visível

Quem faz aparece na frase.

> ✗ Foi observado um erro de 6,3 pontos nas pesquisas de véspera de 2022.
> ✓ Em 2022, as pesquisas de véspera erraram 6,3 pontos no 1º turno.

### 1.3 Palavra comum antes de palavra certa

Quando as duas existem, ganha a comum. Quando só existe a técnica, ela entra **com a explicação na
mesma tela** — nunca atrás de um clique obrigatório (o chip de glossário é atalho, não condição).

### 1.4 O mais importante primeiro

Pirâmide invertida em todo bloco: a resposta, depois o número, depois a ressalva, depois o método.
Ninguém rola para achar a conclusão.

### 1.5 "Você", quando ajuda

Segunda pessoa em instrução e em convite ("toque para ver", "você pode mexer"). Nunca em conclusão
sobre a eleição ("você viu que Lula vai ganhar" é proibido por dois motivos de uma vez).

### 1.6 Título é pergunta; a primeira linha é a resposta

Este é o padrão de bloco do produto — ver §7. O `<h2>` é a pergunta que a pessoa faz; a linha
seguinte já conclui, com o número dentro.

### 1.7 Zero enfeite

Sem emoji, sem exclamação, sem gíria, sem suspense, sem "veja só", sem "surpreendente". O produto
não faz manchete: se dois nomes estão empatados dentro da folga, a frase é "estão empatados".

### 1.8 Explicar ≠ simplificar a verdade

Cortar palavra difícil é obrigatório. Cortar a dúvida é fraude. Toda vez que a simplificação
custaria precisão, a precisão ganha e a frase fica um pouco mais longa.

---

## 2. O padrão numérico obrigatório

### 2.1 Três tipos de número, três tratamentos

O produto publica três coisas diferentes que o leitor confunde. A regra é por tipo:

| Tipo                                 | Como se escreve na superfície pública                                  | Exemplo                                                  |
| ------------------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------- |
| **Chance** (probabilidade do modelo) | **frequência primeiro, percentual junto** — nunca o percentual sozinho | "é eleito em **83 de cada 100** cenários (**83%**)"      |
| **Intenção de voto** (% de pesquisa) | percentual + o que foi medido na mesma frase                           | "**47%** das pessoas ouvidas disseram Lula"              |
| **Diferença** (pontos percentuais)   | "pontos" + tradução em pessoas na primeira aparição da tela            | "**4,7 pontos** — cerca de 5 pessoas a mais em cada 100" |

**A proibição literal:** nenhuma **chance** aparece como percentual solto fora de `/metodologia`.
`83%` sozinho é proibido; `83 em 100 (83%)` é obrigatório.

### 2.2 O denominador é 100. Sempre.

"8 chances em 10" é a leitura natural que este produto persegue, mas o **denominador canônico é
100**, não 10:

1. o elemento-assinatura são **100 bolinhas** — o número escrito tem de ser o número que a pessoa
   consegue contar na tela;
2. arredondar 82 para "8 em 10" faria o texto e o desenho discordarem na mesma dobra;
3. a manchete já é "em 100 eleições parecidas com esta".

"em 10" fica reservado para o **glossário**, onde se explica o que é uma chance sem nenhum número
do modelo em jogo ("uma chance em 10 é o mesmo que 10 em 100").

### 2.3 Arredondamento e soma

- Chance vira **inteiro**. O número escrito e o número desenhado são **o mesmo inteiro**.
- Os dois números da manchete **somam exatamente 100**: arredonda-se um e subtrai-se o outro.
  "83 e 18" é defeito, não detalhe.
- Piso e teto de prosa (já implementados em `pctComPiso`): nunca "0 em 100" nem "100 em 100".
  Escreve-se **"menos de 1 em 100"** e **"mais de 99 em 100"**. Improbabilidade não é
  impossibilidade — e o espelho vale para os dois lados (R4).
- Decimal com **vírgula**; ponto de milhar; data dd/mm.

### 2.4 Ordem dos nomes: a da régua, nunca a do placar

Lula sempre à esquerda, Flávio sempre à direita, em toda frase com os dois — **porque essa é a
posição deles na régua da diferença**, não porque um esteja na frente. Se a ordem mudasse conforme
quem lidera, a ordem viraria juízo (R4). Mesmo tamanho, mesma estrutura de frase, mesma quantidade
de palavras para os dois.

---

## 3. As analogias canônicas

Aprovadas para uso literal. Cada uma tem um limite escrito: o que ela **não** pode dizer.

| Conceito            | Analogia canônica                                                                                | O que ela NÃO pode dizer                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Margem de erro      | **"a folga da medida"** — o número real pode estar um pouco para cima ou um pouco para baixo     | que o valor real está _garantidamente_ dentro da folga; e **nunca** que a folga simples serve para comparar os dois candidatos — na diferença ela vale **em dobro** (H5) |
| Deriva              | **"o quanto a corrida ainda pode andar"** até o dia da votação                                   | que a corrida _vai_ andar, ou para que lado                                                                                                                              |
| Viés                | **"e se todas as pesquisas estiverem puxando para o mesmo lado?"**                               | que elas estão puxando; é sempre pergunta e hipótese                                                                                                                     |
| Erro sistemático    | **"o erro que todas as pesquisas podem cometer juntas"**                                         | que esse erro vai acontecer, ou o tamanho dele em 2026                                                                                                                   |
| Empate técnico      | **"a diferença é menor que O DOBRO da folga da medida — não dá para saber quem está na frente"** | **nunca** "estão iguais" nem "estão empatados no voto"; e nunca com a folga simples — o modelo marca empate em `\|diferença\| ≤ 2 × folga`                               |
| Peso da pesquisa    | **"pesquisa mais nova e com mais gente ouvida conta mais"**                                      | que pesquisa com peso baixo é pesquisa ruim                                                                                                                              |
| Pesquisa            | **"uma foto do momento"**                                                                        | que a foto vale para outubro                                                                                                                                             |
| As 100 bolinhas     | **"cada bolinha é um resultado possível, e todas valem o mesmo"**                                | que são 100 eleições que vão acontecer; são cenários                                                                                                                     |
| Chance              | **"em 100 eleições parecidas com esta, acontece em NN"**                                         | "vai acontecer" / "vai ganhar"                                                                                                                                           |
| Ponto (p.p.)        | **"uma pessoa a mais em cada 100"**                                                              | comparação entre bases diferentes (voto válido × total ouvido)                                                                                                           |
| Votos válidos       | **"o bolo depois de tirar branco, nulo e quem não sabe"**                                        | que branco e nulo "contam para alguém"                                                                                                                                   |
| Tendência pareada   | **"a gente compara cada instituto com ele mesmo, da vez passada para esta"**                     | que a tendência vai continuar                                                                                                                                            |
| Média das pesquisas | **"a leitura do painel sobre as pesquisas"**                                                     | que a média é "a verdade" ou mais certa que as pesquisas                                                                                                                 |
| Faixa de 80%        | **"em 8 de cada 10 cenários a diferença fica entre X e Y"**                                      | que os outros 2 em 10 são impossíveis                                                                                                                                    |
| Replay 2022         | **"uma conta de 'e se': aplicamos hoje exatamente o erro de 2022"**                              | que o erro vai se repetir, ou que 2026 é igual a 2022                                                                                                                    |

Analogia nova só entra por decisão registrada em `DECISOES.md`, com o limite escrito junto.

---

## 4. Tom: respeita, não infantiliza

**O que é respeitar:** dar o número inteiro, dizer o que não se sabe, explicar antes que a pessoa
peça, e confiar que ela aguenta a resposta "depende".

**O que é infantilizar** — proibido:

- Autoelogio de clareza: "explicando bem fácil", "em bom português", "sem enrolação".
- Diminutivo e paternalismo: "é só uma continha", "não se assuste com o gráfico".
- Simplificar até mentir: "Lula está ganhando" no lugar de "está na frente, e ainda pode mudar".
- Emoji, ponto de exclamação, interjeição, tratamento de "amigo/galera".
- Explicar o óbvio duas vezes na mesma tela.
- Esconder o número atrás de uma metáfora: a metáfora acompanha o número, não o substitui.

**O produto não torce.** Nenhum adjetivo de torcida ("disparado", "derrete", "dispara",
"desidrata", "amarga"). Nenhuma ênfase (negrito, tamanho, cor de fundo) que um candidato receba e o
outro não. Nenhum verbo de guerra ("cravar", "atropelar", "encostar").

---

## 5. Palavras banidas na superfície pública → substitutas

Superfície pública = `/`, `/historico`, rodapé, OG, compartilhamento, `/admin`. **Em
`/metodologia` a coluna "explicação técnica" mantém tudo isto intacto** — lá o termo é o conteúdo.

### 5.1 Jargão de estatística

| Banido                                  | Substituta obrigatória                                                                                                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| agregado, agregador (como substantivo)  | "a média das pesquisas", "o painel" — **única exceção:** `alternateName` do JSON-LD e texto de busca, onde o nome antigo sobrevive como descrição (`MARCA.md` §5.1). Nunca em texto lido na tela. |
| média ponderada, ponderação, ponderada  | "a média que dá mais peso às pesquisas mais novas e maiores" (1ª vez) → depois só "a média"                                                                                                       |
| sigma, σ, desvio-padrão, desvio         | "a folga", "o tanto que o número pode variar"                                                                                                                                                     |
| incerteza sistemática, erro sistemático | "o erro que todas as pesquisas podem cometer juntas"                                                                                                                                              |
| p.p., ponto percentual (sem explicar)   | "pontos" + "uma pessoa a mais em cada 100" na 1ª aparição da tela                                                                                                                                 |
| viés, viés direcional                   | "puxada para um lado" (o termo fica no glossário, como chip)                                                                                                                                      |
| deriva, coeficiente de deriva           | "o quanto a corrida ainda pode andar"                                                                                                                                                             |
| meia-vida da recência                   | "quanto tempo uma pesquisa continua valendo"                                                                                                                                                      |
| decaimento exponencial                  | "vai perdendo peso conforme envelhece"                                                                                                                                                            |
| intervalo de confiança, faixa de 80%    | "em 8 de cada 10 cenários, fica entre X e Y"                                                                                                                                                      |
| distribuição, densidade, curva normal   | "como os cenários se espalham"                                                                                                                                                                    |
| dispersão entre institutos              | "o quanto os institutos discordam entre si"                                                                                                                                                       |
| quantil, percentil, mediana             | "cada bolinha vale o mesmo"                                                                                                                                                                       |
| probabilidade combinada                 | "somando os dois caminhos: ganhar já no 1º turno ou ganhar no 2º"                                                                                                                                 |
| caminho modal, cenário modal            | "o caminho mais provável"                                                                                                                                                                         |
| condicional a, dado que                 | "se isso acontecer, então…"                                                                                                                                                                       |
| calibragem, recalibrar, calibrado       | "corrigir o método usando o resultado real"                                                                                                                                                       |
| amostra, n, MoE                         | "quantas pessoas foram ouvidas", "a folga da medida"                                                                                                                                              |
| estimulada, espontânea                  | "quando mostram a lista de nomes" / "sem mostrar a lista"                                                                                                                                         |
| série, rodada                           | "as pesquisas" / "a pesquisa nova daquele instituto"                                                                                                                                              |
| variável, parâmetro, premissa           | "régua", "o que você supõe", "os números que dá para mexer"                                                                                                                                       |
| projeção (sem explicação)               | "o número para o dia da votação" (o termo fica no glossário)                                                                                                                                      |

### 5.2 Certeza fabricada

| Banido                                                    | Substituta obrigatória                                    |
| --------------------------------------------------------- | --------------------------------------------------------- |
| vai ganhar, vencerá, será eleito                          | "é eleito em NN de cada 100 cenários"                     |
| garantido (afirmando)                                     | — ; **"não garantido" é obrigatório** na faixa 90+ (H2)   |
| favorito (sozinho, sem ressalva)                          | "está na frente" + a cláusula de mudança (§6, H2)         |
| cravado (nos dois sentidos), certo, imbatível, sem chance | "carrega mais dúvida", "carrega menos dúvida"             |
| virada impossível                                         | "virada muito improvável"                                 |
| "as pesquisas erram sempre"                               | "em 2018 e 2022 as pesquisas erraram para o mesmo lado"   |
| "as pesquisas estão erradas"                              | "se as pesquisas estiverem erradas…" (sempre condicional) |
| exatamente, precisamente (sobre resultado)                | "perto de", "em torno de"                                 |
| tendência de alta/queda (como continuidade)               | "subiu N pontos desde a rodada anterior"                  |

### 5.3 Moldura errada

| Banido                                       | Por quê                                                                                                                                                                                                                            |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apuração, boletim, urna, contagem            | soa órgão oficial/TSE (veto de `MARCA.md` §1) e é a estética v1 banida (`CLAUDE.md`). Para falar do resultado de uma eleição passada, a palavra é **"o resultado real"** — o produto não precisa da palavra "urna" em lugar nenhum |
| aposta, chance de bancar, odds               | encosta em bets — o oposto da bandeira do produto                                                                                                                                                                                  |
| corrida de cavalo, páreo, disparar na frente | enquadramento que a honestidade estatística critica                                                                                                                                                                                |
| placar, gol, virada no último minuto         | transforma eleição em jogo; é o erro perceptual da barra 83/17 da v1. Para a divisão de votos, usa-se **"resultado"** ou **"divisão de votos"**                                                                                    |
| previsão, prever                             | o produto diz literalmente "não é previsão"                                                                                                                                                                                        |
| CAIXA ALTA em rótulo, texto espacejado       | o formato de leitura mais lento que existe (P3)                                                                                                                                                                                    |
| "clique aqui", "saiba mais", "veja"          | rótulo tem de dizer o destino: "ver as 13 pesquisas"                                                                                                                                                                               |

### 5.4 Termos que **ficam**, com glossário obrigatório

Não dá para escrever este produto sem eles. Eles aparecem como **chip tocável** e a definição de
1–2 frases abre na mesma tela: **margem de erro · 2º turno · votos válidos · tendência · viés ·
empate técnico · projeção · peso · registro no TSE**.

---

## 6. Regras de honestidade (H1–H14)

Escritas para serem **auditáveis frase a frase** pelo data-scientist. Cada uma é um veto.

- **H1 — Probabilidade nunca vira certeza.** Nenhum verbo no futuro do indicativo sobre resultado
  ("vai ganhar", "será eleito"). A forma correta é sempre de contagem de cenários.
- **H2 — Todo favoritismo carrega a ressalva, e a ressalva é definida pelo modelo.** Enquanto a
  chance do líder estiver **abaixo de 90 em 100**, a frase carrega **"e ainda pode mudar"** (ou
  equivalente explícito). De **90 em 100 para cima**, a ressalva vira **"não é garantia"** — nunca
  desaparece. As faixas são as do próprio modelo (50–60 · 60–75 · 75–90 · 90+), não o gosto do
  redator.
- **H3 — O escrito e o desenhado são o mesmo número.** Mesmo inteiro, e a soma fecha 100.
- **H4 — A dúvida mora na mesma tela do número.** Nunca atrás de clique, nunca em rodapé, nunca em
  corpo menor que o mínimo. "Não é previsão" não é responsivo-opcional: não some a 390px.
- **H5 — "Empate técnico" nunca vira "estão iguais", e o fator é DOIS.** A definição obrigatória é:
  _a diferença é menor que **o dobro** da folga da medida, então não dá para dizer quem está na
  frente_. O modelo marca `empate2` quando `|margem2| ≤ 2 × moe` (`nucleo.ts`), porque a folga da
  **diferença** entre dois candidatos é cerca do dobro da folga de cada número isolado — escrever
  "menor que a folga" é **falso e verificável contra a própria tabela da página** (hoje, 2 das 3
  pesquisas marcadas como empate técnico contradiriam a versão sem o dobro). É proibido escrever
  que os dois têm o mesmo número.
- **H6 — O Replay 2022 é uma conta de "e se".** Proibido "o erro vai se repetir" e "como em 2022,
  vai acontecer". Obrigatório dizer, no mesmo bloco, que **isto não é uma previsão** e que 2026 tem
  outro candidato à direita, outro contexto e nenhuma garantia de repetição.
- **H7 — Simulação sempre rotulada (R5).** Nenhum número saído de slider ou de pesquisa adicionada
  aparece sem a palavra **"simulação"** visível na mesma tela, mais um caminho de volta ao oficial
  a **um toque**, sem rolagem.
- **H8 — O passado é afirmação; o futuro é condição.** "As pesquisas erraram em 2022" é fato.
  Qualquer frase sobre erro em 2026 começa com "se".
- **H9 — Simetria de tratamento.** Mesma ordem, mesmo tamanho, mesma estrutura de frase e mesma
  quantidade de ressalvas para os dois candidatos. Se um recebe "ainda pode mudar", o outro recebe
  a contraparte na mesma dobra.
- **H10 — Número que se move vem com o porquê (P2).** Quando a chance muda, o texto diz **qual
  pesquisa entrou e para que lado ela puxou**. Número que muda sem explicação é combustível de
  desconfiança.
- **H11 — A média não é a verdade.** Ela é a leitura do painel sobre as pesquisas. Proibido
  sugerir que a média corrige o erro das pesquisas.
- **H12 — Procedência sempre alcançável.** Instituto, registro no TSE e link da fonte nunca somem
  (R4) — no celular podem estar a um toque, nunca a uma pesquisa no Google. Proibido "segundo
  especialistas" e qualquer fonte anônima.
- **H13 — Nem 0, nem 100.** "menos de 1 em 100" e "mais de 99 em 100" são os extremos publicáveis.
- **H14 — Nada de precisão fabricada.** Chance sempre inteira; diferença com uma casa decimal;
  proibido "exatamente" sobre qualquer resultado futuro.

### 6.1 Frases-modelo já aprovadas contra H1–H14

> ✓ "Em 100 eleições parecidas com esta, Lula é eleito em 83 e Flávio em 17."
> ✓ "Lula está na frente por 4,7 pontos. É menos que a dúvida do painel — ainda pode mudar."
> ✓ "Esta pesquisa está em empate técnico: a diferença é menor que o dobro da folga da medida. Não
> dá para dizer quem está na frente."
> ✓ "Isto não diz que o erro vai se repetir. É uma conta de 'e se'."
>
> ✗ "Lula é favorito e deve vencer." (H1, H2)
> ✗ "83% de chance." (§2.1, percentual solto)
> ✗ "Empate: os dois estão com 45%." (H5)
> ✗ "Como em 2022, as pesquisas vão subestimar a direita." (H6, H8)

---

## 7. O padrão de bloco: pergunta → resposta → traduzindo

`DESIGN-V2.md` pede duas coisas que parecem brigar: **§6.1** manda o `<h2>` ser um título-pergunta,
e **§5.2** manda o bloco abrir com uma frase que **conclui**. As duas valem, em camadas:

1. **`titulo`** — a pergunta que a pessoa faz, curta, no `<h2>`: _"Isso ainda pode virar?"_
2. **`resposta`** — a primeira linha do bloco, que **conclui e traz o número**:
   _"Pode. Em 18 de cada 100 cenários, Flávio ganha a decisão."_
3. **`traduzindo`** — 2 a 3 frases que explicam **o que a pessoa está vendo** e de onde saiu.
4. Só depois vêm o gráfico, a tabela e os detalhes.

Nenhum bloco começa por gráfico. Nenhum bloco começa por número sem frase.

**Tamanho:** `titulo` ≤ 6 palavras · `resposta` ≤ 25 palavras · `traduzindo` ≤ 55 palavras.

---

## 8. Formato — regras mecânicas

- **Números:** vírgula decimal, milhar com ponto (2.004 pessoas). Chance inteira. Diferença com uma
  casa. Datas dd/mm; ano só quando muda de ano.
- **Nomes:** "Lula" e "Flávio" no corpo (é como o país fala); "Lula (PT)" e "Flávio Bolsonaro (PL)"
  na primeira aparição da página e em qualquer lugar institucional. Nunca só o sobrenome de um e o
  primeiro nome do outro.
- **Institutos:** nome inteiro sempre que couber; abreviação **intencional e legível**
  ("PoderD.", "Datafol."), nunca corte cego.
- **Turnos:** "1º turno" e "2º turno" (com ordinal), nunca "1T/2T" na superfície pública.
- **Sinal:** "+4,7" e "−1,6" com o sinal tipográfico correto (−, não hífen). Quando o sinal
  carregar sentido, ele vem escrito também: "+3,1 pontos a favor de Lula".
- **Links:** o texto do link diz o destino. Externo abre com `rel="noopener noreferrer"`.
- **Leitor de tela:** todo número-manchete e todo gráfico têm versão em palavras. `aria-valuetext`
  dos sliders sempre com unidade em português.

---

## 9. Checklist de revisão (é por aqui que o data-scientist audita)

Antes de publicar qualquer frase nova:

1. Tem verbo no futuro sobre resultado? → reescrever (H1).
2. Tem chance como percentual solto? → falta a frequência (§2.1).
3. O número escrito bate com o desenhado, e a soma fecha 100? (H3)
4. A ressalva de mudança está na mesma tela, na forma que a faixa do modelo exige? (H2, H4)
5. "Empate técnico" está definido como _diferença menor que **o dobro** da folga_? (H5)
6. Alguma frase sobre 2026 sem "se"? (H8)
7. Os dois candidatos receberam o mesmo tratamento na mesma dobra? (H9)
8. Alguma palavra da lista §5 escapou? → substituir.
9. A frase mais longa passa de 20 palavras? → cortar.
10. Um número mudou sem que o texto diga por quê? (H10)
11. É número de simulação? A palavra "simulação" está visível? (H7)
12. A fonte e o registro no TSE continuam alcançáveis? (H12)

---

## 10. Decisões novas desta fase (contexto → decisão → porquê)

Para registro em `DECISOES.md` (R6).

1. **Denominador único 100** — o briefing pedia "8 chances em 10" ao lado de "82%" → **a
   frequência publicada é sempre em 100**, e "em 10" fica só no glossário → o elemento-assinatura
   tem 100 bolinhas contáveis; "8 em 10" faria o texto discordar do desenho na mesma dobra, e a
   manchete já é "em 100 eleições parecidas".
2. **A proibição do percentual solto vale para CHANCE, não para tudo** — a leitura literal
   ("nenhum percentual sozinho") tornaria a tabela de pesquisas impossível → **intenção de voto
   continua em %**, com o que foi medido dito na mesma frase; **chance** nunca aparece sem a
   frequência → % de pesquisa é um dado publicado pelo instituto; chance é uma saída de modelo, e é
   ela que a literatura mostra ser mal lida em porcentagem (P1).
3. **Ponto percentual ganha tradução fixa** — "p.p." está banido e "ponto" sozinho é vago →
   **"NN pontos" + "uma pessoa a mais em cada 100"** na primeira aparição de cada tela → dá
   denominador visível à diferença sem inventar precisão.
4. **A ordem dos nomes é a da régua, não a do placar** — a tentação é "o líder primeiro" →
   **Lula à esquerda, Flávio à direita, sempre** → ordem que muda com a liderança vira juízo
   editorial a cada rodada e quebra R4.
5. **A cláusula de ressalva é uma função do modelo** — "ainda pode mudar" viraria tique de redator
   → **abaixo de 90 em 100 usa-se "ainda pode mudar"; de 90 para cima, "não é garantia"** → amarra
   o texto às faixas que o modelo já publica (50–60/60–75/75–90/90+) e torna a regra auditável.
6. **Padrão de bloco em três camadas (pergunta → resposta → traduzindo)** — `DESIGN-V2.md` §6.1
   pede título-pergunta e §5.2 pede abertura que conclui → **as duas coisas, em linhas separadas**
   → a pergunta é a porta de entrada (é como a pessoa pensa), a resposta é o texto-dado que P2
   exige, e nenhuma das duas exigências foi sacrificada.
7. **"Premissa" sai do título da simulação** — o briefing sugeria "Quer mexer nas premissas?" →
   **"Quer mexer nos números você mesmo?"** → "premissa" é palavra de baixa frequência para o
   público-alvo; o sentido (testar a própria suposição) fica inteiro e o convite fica legível.
8. **"Apuração", "urna" e "boletim" entram na lista de banidos** — são o vocabulário do cabeçalho
   v1 → **substituídos por "pesquisas"** → `MARCA.md` §1 vetou esse campo semântico por soar órgão
   oficial, e `CLAUDE.md` bane o motivo "urna/boletim/apuração" em qualquer superfície.
9. **O slider de deriva mostra o efeito, não o coeficiente** — o rótulo original era "0,35 ×√dias"
   → **mostra-se "o quanto a corrida ainda pode andar" e o efeito em pontos até 25/10** → "×√dias"
   é ilegível para o público e o número que importa para a decisão é o efeito, não o coeficiente; a
   fórmula continua inteira em `/metodologia`.
10. **O slider de viés diz a direção por extenso** — "+3,1 p.p." não informa a favor de quem →
    **"+3,1 pontos a favor de Lula" / "−1,0 ponto a favor de Flávio"** → sinal sozinho é jargão de
    planilha, e a direção é justamente o que a pergunta do leitor pede.

11. **Empate técnico leva o fator DOIS — correção pós-auditoria** — a primeira versão desta VOZ
    codificou a analogia como "diferença menor que a folga da medida", e o COPY-DECK herdou o erro
    em 4 chaves → **a definição obrigatória passa a ser "menor que O DOBRO da folga da medida"**
    (§3, H5, §6.1, §9) → o modelo marca `empate2` em `|margem2| ≤ 2 × moe` e o protótipo já escrevia
    isso por extenso; com a folga simples, 2 das 3 pesquisas hoje marcadas como empate técnico
    contradiriam a definição publicada **na mesma tela** (`AUDITORIA-COPY.md` §3.1).

12. **A direção só se escreve uma vez** — "+3,1 pontos a favor de Lula" repete o sentido, e com
    viés negativo renderizava "−1,0 pontos a favor de Flávio", onde sinal e palavra se anulam →
    **toda frase que já diz a direção por extenso usa `{{VIES_ABS}}`** (valor absoluto) → decisão do
    auditor (`AUDITORIA-COPY.md` §4); aplicada também ao rótulo do lado de Lula, para os dois lados
    ficarem com a mesma forma (H9).

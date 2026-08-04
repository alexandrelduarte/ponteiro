# DESIGN v2 — o sistema ENXAME

**Fase 3 (parte 2) do redesign.** Este documento é a fonte da verdade visual do produto a partir
daqui. Ele substitui `docs/DESIGN.md` (v1, estética "boletim de urna", **banida** por decisão
permanente do dono do produto — ver CLAUDE.md). `DESIGN.md` fica como registro histórico e
contraexemplo; nenhum valor dele é reaproveitado.

Os tokens correspondentes estão em **`src/app/tokens-v2.css`** (Tailwind v4, `@theme static`).
Marca, nome e voz: `docs/MARCA.md`. Princípios de referência: `docs/TENDENCIAS-2026.md` (citado
aqui como P1…P12).

---

## 1. A decisão

**Vencedor: conceito B · ENXAME.** Escolha do orquestrador na Fase 3 parte 1, sobre os três style
tiles materializados em `src/app/design-lab/` e os prints de `.qa/design-lab/`.

O que o ENXAME é, em uma frase: **uma conversa em blocos arredondados e generosos, sem borda e sem
filete, boiando numa página tingida de ameixa — cada bloco abre com uma frase que CONCLUI e só
depois mostra o número.**

| Eixo                | Decisão                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| Identidade          | ameixa `#5A3A66` sobre bruma-ameixa `#EFECF1`, placa branca, tinta `#211C26`                             |
| Candidatos          | carmim Lula `#BE1745` (OKLCH L 0,518) × naval Flávio `#26418B` (L 0,399) — ΔL 0,119                      |
| Atenção             | âmbar-queimado `#8F5407`, usado como TINTA (nunca como campo cheio)                                      |
| Tipografia          | Instrument Serif 400 (display, só corpo grande) + Lexend (todo o resto)                                  |
| Layout              | blocos-conversa, raio 24, sem borda; hierarquia por tinta de fundo, não por moldura                      |
| Elemento-assinatura | **O ENXAME DE 100** — quantile dotplot sobre a régua da diferença, com a coluna do zero chamada "empate" |
| Motion              | as bolinhas caem e assentam (300 ms, `translateY`+`opacity`, escalonado por coluna)                      |

### 1.1 Os descartes, e por quê

**A · LATÃO** — descartado. A régua de 100 unidades (o campo contável como fita contínua) **falha a
390px**: para caber 100 unidades numa largura útil de ~318px cada unidade fica com ~3px, e o
elemento-assinatura deixa de ser contável exatamente no viewport onde o conceito precisa nascer
(P12). Print: `.qa/design-lab/conceito-a-390.png` (comparar com `conceito-a-1440.png`, onde o mesmo
elemento funciona — é o diagnóstico clássico de conceito que só existe no desktop).

**C · CHUMBO** — descartado. Frio e acromático por decisão (identidade em cinza-chumbo), e o campo
de 100 quadrados chapados **grita**: a mancha vermelha de 83 casas contíguas ocupa meia tela e é
lida como território conquistado, não como distribuição de cenários — o mesmo erro perceptual da
barra 83/17 da v1 (P4), agora em grade. Prints: `.qa/design-lab/conceito-c-390.png` e
`conceito-c-1440.png`. **Ressalva:** o gráfico "cada pesquisa contra a linha do empate" do C foi
absorvido — ver §4.3.

**B · ENXAME** — vencedor. Prints: `.qa/design-lab/conceito-b-390.png` e `conceito-b-1440.png`.
A pilha inteira É a incerteza (a forma vem antes da linha, P4), a informação não depende de cor
(quem está de que lado é POSIÇÃO em relação ao "empate", P6), e o formato é o que a melhor
evidência disponível recomenda para leitor de baixa numeracia (quantile dotplot, P1).

---

## 2. As duas correções mandatórias

Anexadas à vitória pelo orquestrador. Não são sugestões.

### 2.1 A manchete usa o número de SER ELEITO

O style tile manchetava com `pL2dia` (chance de estar à frente **no 2º turno**: 82/18) enquanto a
prosa abaixo citava a chance de **ser eleito** (83/17). Dois números-manchete concorrentes na mesma
dobra é exatamente o defeito que P2 existe para evitar.

**Regra:** a manchete do produto é sempre **a chance de SER ELEITO** — `eleito.dia.l`, o número que
o resto do site, o OG, o JSON-LD e o compartilhamento também publicam.

> **Em 100 eleições parecidas com esta, Lula é eleito em 83 e Flávio em 17.**

O enxame vive **logo abaixo**, como visual da **diferença no 2º turno**, com micro-legenda própria
que reconcilia os dois números na mesma tela (nunca atrás de um clique):

> Estas 100 bolinhas mostram a **diferença no 2º turno**: 82 caem do lado de Lula. A manchete diz
> 83 porque soma também o caminho de vitória já no 1º turno — esse cenário não tem 2º turno para
> cair de um lado.

**Veto do data-scientist:** a formulação final das duas frases (manchete e micro-legenda) está
sujeita a veto do data-scientist, inclusive quanto a nomear "diferença no 2º turno" e à redação da
reconciliação. O que **não** está em disputa é a regra: a manchete é `eleito.dia`, o enxame é
`pL2dia`, e a diferença entre os dois números é explicada na mesma tela.

### 2.2 Bolinha ≥8px a 390

Medido no print `conceito-b-390.png`: com o domínio fixo do style tile (`[-11, +21]` = 32 colunas)
a bolinha sai com **~7,8px** de diâmetro na largura útil de 318px. Abaixo do piso.

**Regra:** `--spacing-bolinha` = **8px é piso duro** do diâmetro a 390, e a folga entre bolinhas é
≥2px (`--spacing-bolinha-folga`) — a folga não é estética: é ela que mantém cada bolinha com o
próprio limite a ≥3:1 contra a placa (1.4.11), já que carmim e naval entre si dão só 1,54:1 (§10.3).

Como o piso é obtido, em ordem:

1. **O domínio deixa de ser fixo.** Ele é o intervalo que os 100 quantis de fato ocupam,
   arredondado para fora até fechar colunas inteiras. Com os números atuais (margem +4,7 · σ 5,2)
   isso dá ~27 colunas em vez de 32 → passo 318/27 = **11,8px** → bolinha **9,9px**. ✔
2. **A coluna vale 1 ponto percentual** e é ancorada de modo que o **zero seja SEMPRE uma borda de
   coluna**, nunca um centro (`floor(q / largura) * largura`, como no style tile). É isso que
   permite a régua do empate passar no vão entre colunas e nunca por cima de bolinha.
3. **Se ainda assim não couber** — se o domínio pedir mais de 33 colunas a 390 (passo < 9,5px) — a
   coluna dobra para **2 p.p.** e o número de colunas cai pela metade. Dobrar (e não usar 1,5)
   preserva a leitura "cada coluna é um número redondo de pontos".
4. **Empilhamento.** Altura da pilha = maior coluna × (bolinha + folga). Com 1 p.p. e σ ≈ 5, a maior
   coluna tem ~8 bolinhas → ~99px de pilha a 390. Se passar de **180px**, aplica-se o passo 3.
5. Em md+ a bolinha cresce junto com o passo (0,84 × passo) sem teto: a 1440 ela chega a ~22px e o
   enxame lê como dotplot de verdade — ver `conceito-b-1440.png`.

---

## 3. Sistema

### 3.1 Cor

Paleta completa, valores e contrastes em `src/app/tokens-v2.css` e §10. As regras de uso:

- **Ameixa é a marca.** Família cromática terceira (OKLCH H ≈ 316°), neutra em relação à disputa.
  Todos os degraus (`forte`, `pressa`, `clara`, `bruma`, `tenue`) dividem a mesma matiz: hover e
  pressed são o mesmo tom mais fundo, nunca outra cor.
- **Vermelho e azul são dos candidatos, em toda superfície do produto — inclusive `/admin`.**
  Não existe "sucesso verde" nem "perigo vermelho" neste sistema (§5.8).
- **A cor nunca é o único canal.** Onde aparece carmim ou naval, aparece junto o nome do candidato
  ou a posição em relação à régua do empate.
- **Os dois fundos claros de candidato são isocromos** (ΔL OKLCH 0,003, contraste entre si ≈ 1,0):
  nenhum lado pode parecer mais pesado num placar (R4). Como corolário, **eles nunca podem ser os
  dois lados de uma mesma forma dividida** — a divisão seria invisível em P&B. Ver §4.3.
- **A dúvida é sempre o lilás da faixa** (`--color-faixa`), em qualquer gráfico. Nenhum candidato é
  dono da incerteza.
- **Profundidade vem de tinta de fundo**, não de sombra: bruma (página) → placa (bloco) → nicho
  (caixa dentro do bloco). Sombra só para o que flutua acima do conteúdo (§3.5).

### 3.2 Tipografia

- `--font-display` = Instrument Serif 400. **Só em corpo grande**: manchete (`--text-manchete`) e
  placar serif (`--text-manchete-2`). Nunca em rótulo, nunca em caixa alta, nunca abaixo de 32px.
- `--font-texto` = Lexend, e é também `--font-sans` (o padrão do documento). Cobre corpo, títulos-
  pergunta, rótulos, botões, tabela e números.
- **Mono não volta.** O par Archivo + IBM Plex Mono está banido como identidade; numeral alinhado é
  resolvido pelo utilitário `numeros` (`tabular-nums` + `font-feature-settings`) na própria Lexend
  (P7). _Verificação pendente para a Fase 6: confirmar que a Lexend servida pelo next/font traz a
  feature `tnum`; se não trouxer, a coluna numérica ganha largura reservada em `ch` e alinhamento à
  direita — em nenhuma hipótese volta uma segunda família só para dígito._
- **Piso de 13px em tudo** (`--text-micro`); corpo nasce em **16px** a 390 e vai a 18px (a v1
  explicava o modelo a ~13px). Tick de gráfico usa `--text-micro`, não menos.
- **Zero rótulo em caixa-alta espacejada** — é o formato de leitura mais lento que existe e a v1 o
  aplicava justamente ao texto que mais importa (P3). Não há tracking positivo no sistema.

### 3.3 Espaço

Base 4px (`--spacing: 0.25rem`); tudo é múltiplo de 4. Nomes só para o ritmo estrutural: goteira
(16/24/40), padding de bloco (20/32), respiro entre blocos (16/24), alvo de toque (44) e piso de
alvo do WCAG 2.2 SC 2.5.8 (24).

### 3.4 Raio

`--radius-bloco` 24 (o bloco-conversa) · `--radius-nicho` 16 (caixa dentro do bloco) ·
`--radius-campo` 12 (input) · `--radius-plena` (chip e botão-pílula).

### 3.5 Sombra — e a regra de quando NÃO usar

Dois níveis (`--shadow-flutua`, `--shadow-erguido`) e **o nível padrão é zero**. Bloco parado não
leva sombra: ele já se separa da página pela tinta. Sombra é exclusiva de superfície que flutua
**acima** do conteúdo — bottom sheet, popover do glossário, faixa de simulação fixa. Empilhar
elevação em bloco estático é o neumorfismo que TENDENCIAS §3 bane.

### 3.6 Breakpoints

`md` 48rem (768) · `lg` 71.25rem (1140). 390px (`--container-base`, 24.375rem) **não é
breakpoint**: é o viewport onde o conceito nasce e o piso de todo cálculo (P12).

---

## 4. O elemento-assinatura, em três escalas

P12 exige **um** elemento-assinatura, nascido a 390px, presente em três escalas. Aqui ele é uma
gramática, não um desenho único:

> **A régua horizontal da diferença, com o zero chamado "empate".**
> Esquerda = Flávio na frente · direita = Lula na frente · o zero é uma régua de tinta, 3px.

Sobre essa mesma régua vivem as três escalas:

### 4.1 Hero — O ENXAME DE 100 (grande, contável)

100 bolinhas nos quantis da margem projetada, empilhadas em colunas de 1 p.p. A pilha inteira É a
incerteza. Régua do empate em `--color-tinta` (3px) passando no vão entre as colunas que ladeiam o
zero, rotulada **empate**. Eixo em `--color-contorno` (3,52:1). Legendas nas duas pontas:
"← Flávio na frente" / "Lula na frente →". Especificação de tamanho: §2.2.

### 4.2 Simulação — o mini-enxame (resultado dos sliders)

O resultado da simulação é expresso **na mesma linguagem de frequência do hero** (P11): as mesmas
100 bolinhas, mesma régua, mesma gramática, numa faixa de ~64px de altura, com a frase "nesta
simulação, 62 em 100". É o que permite comparar maçã com maçã sem reaprender nada.

### 4.3 Série de pesquisas — cada pesquisa contra a linha do empate

**Decisão sobre a sugestão aberta do orquestrador: ADOTADA, com adaptação.** O gráfico do conceito
C entra no sistema porque:

1. Ele é o único jeito de cumprir o item 4 do checklist da TENDENCIAS — **"empate técnico" deixa de
   ser badge de texto e passa a ser VISTO**: a barra é 2× a margem de erro e, quando atravessa a
   régua, o empate é geométrico, não uma palavra.
2. Ele fala a língua do ENXAME sem esforço: **mesma régua, mesmo zero chamado "empate", mesma
   convenção esquerda/direita**. Não é enxerto — é a mesma gramática com outra marca em cima.
3. Ele **não é barra-com-bigodinho** (P4): não há barra saindo do zero afirmando um valor; a forma
   inteira É o intervalo. É literalmente o que P4 prescreve.
4. Custa DOM/CSS puro — nada de Recharts, nada de bundle novo num Android barato (P9).

**Adaptações obrigatórias para caber na linguagem do ENXAME:**

| Conceito C (original)                                | ENXAME (adotado)                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| barra retangular, contorno `inset 1.5px`             | barra de raio pleno, sem contorno interno                           |
| barra bicolor, dividida no zero em rosa/azul pálidos | **barra monocromática em `--color-faixa`** (o lilás da dúvida)      |
| ponto na cor do candidato, halo branco               | mantido: ponto na cor do candidato + halo de 2px em `--color-placa` |
| régua do empate atrás da barra                       | mantida atrás da barra e **à frente do lilás**, tinta 3px           |

Por que a barra deixa de ser bicolor: os dois fundos de candidato são isocromos por exigência de
R4 (§3.1), então a divisão no zero teria contraste ≈ 1,0 entre si — invisível em P&B e para
daltônico. O que precisa ser visto é **a barra atravessando a régua**, e isso a régua de tinta
(12,09:1 sobre o lilás) entrega sozinha. De quebra, "dúvida = lilás" passa a valer em todo o
produto: faixa do gráfico de evolução, barra de pesquisa e enxame contam a mesma história.

---

## 5. Aplicação, seção a seção

### 5.1 `/` — hero

Ordem no primeiro scroll de 390px, sem exceção: **wordmark + tagline → linha de tempo → manchete
serif → enxame → micro-legenda do enxame → parágrafo de procedência**.

- Linha de tempo (`--text-etiqueta`, `--color-tinta-media`): "2º turno · 25 de outubro · faltam 83
  dias", com `numeros`.
- Manchete (`--text-manchete`, display): a frase de §2.1, com os dois números em carmim e naval
  dentro da frase. Máximo ~17ch por linha a 390.
- Enxame: §4.1. Micro-legenda logo abaixo: §2.1.
- Parágrafo de procedência (`--text-corpo`): "Não é previsão: é o que as 13 pesquisas registradas
  no TSE dizem hoje." **"NÃO É PREVISÃO" nunca é responsivo-opcional** (regra herdada da v1 que
  continua valendo: o disclaimer não some a 390).
- O hero inteiro é HTML do servidor. Nenhum número-manchete espera JS (P9).

### 5.2 `/` — cartões-conversa

Cada bloco é uma placa de raio 24, sem borda, sobre a bruma. **Cada um abre com um título-pergunta
que CONCLUI** (`<h2>`, `--text-pergunta`, Lexend 600) e só depois mostra o número:

- "Lula está na frente por 4,7 pontos — menos do que a dúvida."
- "Desde janeiro a diferença encolheu — e nunca saiu da faixa da dúvida."

Dentro: nichos de valor (`--radius-nicho`) com o nome do candidato em `--color-lula`/`--color-flavio`
sobre `--color-*-fundo`, e o valor em display. Termos técnicos são **chips de glossário** inline
(âmbar-queimado como tinta + contorno, fundo bruma), que abrem bottom sheet (§6.4).

### 5.3 `/` — evolução com a faixa dominante

A **faixa é a forma principal**; a média ponderada é uma linha `--color-ameixa` **dentro** dela
(P4). A faixa tem **borda obrigatória** em `--color-faixa-borda` — é ela que cumpre o 3:1 de objeto
gráfico (§10.2), e é ela que vira **tracejada depois de "hoje"** para separar observado de
projetado (nenhum token de cor novo para isso). Linha de referência do empate em tinta, rotulada
**em palavras** ("empate"), nunca "0" mudo (P5). Rótulos diretos nas pontas ("Lula na frente ↑" /
"Flávio na frente ↓"), sem depender de tooltip — tooltip em celular barato é aposta, não interface.

### 5.4 `/` — série de pesquisas

Abaixo de `md`: **lista de cartões**, um por pesquisa, cada um com a barra de §4.3 como marcador de
dispersão inline. A partir de `md`: tabela completa com `caption`/`scope`, e a barra vira uma
coluna. Instituto, registro TSE e link da fonte são **sempre acessíveis** (R4) — no cartão, via
bottom sheet "ver o registro completo"; na tabela, na própria linha. Números com `numeros`.
Adicionar/remover é **modo simulação** (R5).

### 5.5 `/` — parâmetros, sliders e simulação

Sliders são **conteúdo editorial**, não configuração avançada: ficam na página. Trilho
`--color-grade` / preenchido `--color-ameixa`; thumb de **24px visíveis** dentro de alvo de 44px
(a borda do UA desconta do diâmetro — usar `box-shadow` de blur zero, não `border`: é bug já
diagnosticado na v1 e a solução continua válida). Resposta em `--dur-rapida`/`--dur-base` com
`--ease-padrao`, recálculo com debounce para manter INP ≤200ms (P9).

Saída da simulação: o mini-enxame de §4.2 + marcação persistente "simulação" + **reset de um
toque** visível sem rolagem (P11). A faixa de simulação é a única superfície do painel que usa
`--shadow-flutua`, e só quando fixa.

### 5.6 `/historico`

Mesma gramática: título-pergunta, blocos-conversa, régua do empate onde houver diferença. O gráfico
de probabilidade ao longo do tempo usa a faixa lilás com borda (não linha nua). A linha do tempo de
transparência é uma lista de blocos com data em `--text-etiqueta` e o ato em `--text-corpo` — o
feed é anônimo por desenho (nunca mostra quem praticou o ato).

### 5.7 `/metodologia`

Página de prosa: coluna em `--container-texto` (~58ch), `--text-corpo` a 16–18px,
`--leading-leitura`. Títulos-pergunta como `<h2>`. Zero cartão decorativo: o conteúdo é texto e o
texto é o produto aqui. Cada termo do glossário aparece definido em uma frase + um exemplo
numérico concreto.

### 5.8 `/admin` — utilitário

Superfície interna, mas **mesma paleta e mesmo piso de acessibilidade**. Densidade maior:
`--spacing-bloco` mesmo em md+, `--radius-nicho` no lugar de `--radius-bloco`.

- Ação primária (aprovar/publicar): botão ameixa cheio, texto `--color-tinta-inversa`.
- Ação destrutiva (remover/rejeitar): botão-fantasma com tinta e contorno em **âmbar-queimado**,
  confirmação em 2 passos inline (não `window.confirm`).
- Estado "pendente": chip âmbar. Estado "publicado": chip ameixa. **Nunca verde/vermelho** — um
  print do /admin não pode ser lido como tomando partido (R4).

### 5.9 Estados vazios e de erro

- **Série vazia** (o leitor removeu todas as pesquisas em simulação): nenhum número do modelo é
  renderizado. Bloco-conversa com título-pergunta ("Sem pesquisa nenhuma, não há o que calcular."),
  a explicação e o botão de restaurar como ação primária ameixa.
- **Sem banco** (R8, degradação graciosa): a página funciona com o seed local; o aviso é uma nota
  em `--color-atencao` dentro do bloco, nunca uma tela de erro.
- **Falha de rede**: nunca derruba a página. O bloco afetado mostra a última informação conhecida +
  nota âmbar dizendo o que não pôde ser atualizado e quando.
- Esqueleto de gráfico: `--color-nicho`, **altura exata** do gráfico final (CLS 0), sem
  pulsar/shimmer (§7).

---

## 6. Spec mobile-first, componente a componente

Tudo abaixo é medido a **390px** primeiro. Se um componente só funciona a partir de md, ele não é
o componente (P12).

### 6.1 Regras que valem para todo componente

| Regra                        | Valor                                                                    |
| ---------------------------- | ------------------------------------------------------------------------ |
| Título de bloco              | **`<h2>`**, título-pergunta que conclui, `--text-pergunta` (21px a 390)  |
| Subtítulo dentro do bloco    | `<h3>`, `--text-secao`                                                   |
| Alvo de toque, ação primária | **≥44×44px** (`--spacing-toque`)                                         |
| Alvo de toque, secundário    | ≥24×24px ou 24px de espaçamento entre alvos (WCAG 2.2 SC 2.5.8 AA)       |
| Corpo de texto               | ≥16px (`--text-corpo`); micro/tick nunca abaixo de 13px (`--text-micro`) |
| Medida de leitura            | ≤ `--container-texto` (~58ch)                                            |
| Goteira                      | 16px a 390 · 24 em md · 40 em lg                                         |
| Foco                         | anel ameixa 2px + offset 2px, em 100% dos elementos focáveis             |

### 6.2 Enxame

Piso de 8px por bolinha e folga ≥2px (§2.2). `role="img"` com `aria-label` que **diz os dois
números em português** ("Cem bolinhas, uma por cenário: 82 caem do lado de Lula e 18 do lado de
Flávio"). O SVG escala por `width: 100%; height: auto` — os rótulos (empate, marcas de eixo) ficam
**fora do SVG**, posicionados em porcentagem, para não encolherem junto com o desenho a 390.

### 6.3 Série de pesquisas: tabela ⇄ cartões

Abaixo de `md`, **cartões** — nunca tabela com rolagem horizontal, e nunca oito linhas de microtipo
espremidas (P10). A partir de `md`, tabela real com `caption`/`scope`. São **duas árvores
alternadas por `hidden`**, não uma tabela com `display: block`: a semântica precisa sobreviver nos
dois casos. Abreviação de instituto, quando necessária, é **intencional e legível** ("PoderD.",
"Datafol."), nunca `slice(0,7)` cego — o nome do instituto é procedência (R4/P9).

### 6.4 Bottom sheet

Container único de detalhe no celular (P10): registro completo da pesquisa **e** glossário usam o
mesmo. Alça de arrasto, fecho por toque fora e por `Esc`, foco preso enquanto aberto, retorno do
foco ao elemento que abriu. `--shadow-erguido` + `--color-veu` atrás. Em md+ o mesmo conteúdo vira
popover ancorado. Altura máxima 85svh, conteúdo rolável dentro.

### 6.5 Botões e chips

- Primário: campo ameixa, texto `--color-tinta-inversa` (8,91:1), raio pleno, min-height 44.
- Fantasma: campo placa, texto ameixa, contorno 2px por `box-shadow: inset` (não `border`: borda
  come o raio e desalinha o texto).
- Hover/pressed **desenhados um a um**: primário → `--color-ameixa-forte` / `--color-ameixa-pressa`;
  fantasma → `--color-ameixa-tenue` / `--color-ameixa-bruma`.
- Chip de glossário: min-height 32px dentro de alvo de 44, tinta e contorno em âmbar-queimado,
  campo bruma. O "?" é `aria-hidden`; o nome acessível diz "o que é margem de erro".

### 6.6 Deslizador

Thumb de 24px **visíveis** (`--spacing-thumb`) dentro de alvo de 44px (`--spacing-toque`), anel por
`box-shadow` de blur zero e `border: 0`. `aria-valuetext` em português **com unidade** —
`aria-valuenow` sozinho lê "4" e não significa nada.

---

## 7. Motion — a lista fechada

Orçamento: **só `transform` e `opacity`**, nada acima de 300ms, entrada em `ease-out`, tudo
interrompível (P8). Os tokens estão em `tokens-v2.css` §13.

### 7.1 O que anima

| O quê                              | Duração         | Easing          | Observação                                                                                                                        |
| ---------------------------------- | --------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Bolinhas do enxame caem e assentam | `--dur-entrada` | `--ease-mola`   | `translateY(--desloc-entrada)` + `opacity`, **stagger por COLUNA** (`--stagger-passo`, teto `--stagger-teto`) — nunca por bolinha |
| Hover/pressed de botão e chip      | `--dur-rapida`  | `--ease-padrao` | só cor de campo                                                                                                                   |
| Bottom sheet abre                  | `--dur-base`    | `--ease-padrao` | `translateY` + véu em `opacity`                                                                                                   |
| Bottom sheet fecha                 | `--dur-rapida`  | `--ease-saida`  | saída acelera                                                                                                                     |
| Faixa de simulação entra/sai       | `--dur-base`    | `--ease-padrao` | `opacity` + `translateY` curto                                                                                                    |
| Abas 1ºT/2ºT trocam                | `--dur-rapida`  | `--ease-padrao` | só `opacity` do conteúdo                                                                                                          |

O stagger é **por coluna** por um motivo de conteúdo: o gesto precisa dizer "a nuvem é acumulada",
e é a coluna (o bin) que representa o acúmulo. Escalonar por bolinha viraria chuva decorativa.

### 7.2 O que NUNCA anima

- **A régua do empate, o eixo e os rótulos.** São a referência: referência que se mexe mente.
- **Números.** Nenhum count-up, nenhum roll de dígito. O número é dado, não espetáculo — e um
  número que "sobe" sugere tendência que o modelo não afirmou.
- **A agulha da marca.** Salvaguarda anti-_needle_ já registrada em DECISOES.md: a agulha do
  PONTEIRO é **marca estática** e está proibida de virar medidor animado de probabilidade. O
  contraexemplo canônico é o "needle" do NYT 2016 (P1).
- **A faixa de incerteza.** Ela não cresce, não pulsa, não "respira": incerteza é forma, não efeito.
- **Gráficos do Recharts.** `isAnimationActive={false}` em tudo — movimento a serviço de dado é
  proibido; e o custo de animação num Android barato sai do orçamento de INP (P9).
- **Esqueletos de carregamento.** Sem shimmer/pulse: bloco `--color-nicho` parado, na altura exata.
- **Scroll.** Zero scroll-jacking, zero parallax, zero reveal-on-scroll. A página existe para ser
  lida em 20 segundos.
- **Ação iniciada por teclado** não recebe animação de entrada (P8).

### 7.3 `prefers-reduced-motion`

Três camadas, todas em `tokens-v2.css`: (1) os tokens de duração/deslocamento/stagger **zeram**;
(2) `[data-motion="decorativo"]` — que é o enxame, e só ele — perde a animação por inteiro e as 100
bolinhas nascem assentadas; (3) rede de segurança global para qualquer transição não tokenizada.
`transform` **não** é resetado globalmente: ele também posiciona (centralização por `translate`), e
zerá-lo quebraria layout em vez de acalmar movimento.

---

## 8. A marca: PONTEIRO

Nome, tagline, checagem de colisão e lista de renomeação: `docs/MARCA.md` (execução na Fase 6).
O que este documento decide é a **aplicação visual**.

### 8.1 Símbolo — disco + agulha, ESTÁTICO

Um disco em `--color-ameixa-bruma` com uma agulha em `--color-ameixa` apontando para cima-direita e
um eixo em `--color-tinta` na base. Geometria pura, sem texto, sem gradiente, sem sombra: legível a
16px na aba do navegador e nítido em qualquer rasterização.

**A agulha é marca, nunca instrumento.** Está proibida de virar medidor animado de probabilidade no
hero — salvaguarda anti-_needle_ já registrada em DECISOES.md, com o "needle" do NYT 2016 como
contraexemplo canônico (P1). Quem comunica probabilidade é o campo contável de 100 unidades. A
agulha também não muda de inclinação com o dado: se ela apontasse "para o lado que está ganhando",
a marca tomaria partido a cada rodada (R4).

### 8.2 Wordmark

`PONTEIRO` em **Instrument Serif 400**, corpo 30–36px no cabeçalho, `letter-spacing: -0.01em`, em
`--color-tinta`. Tagline logo abaixo em Lexend, `--text-etiqueta`, `--color-ameixa`:

> Para onde apontam as pesquisas.

O nome antigo, "Agregador Presidencial 2026", sobrevive como **descrição** (`alternateName` no
JSON-LD, texto de SEO) — nunca como marca.

### 8.3 Cor de marca e neutralidade

- **Ameixa é a cor da marca**, e a marca não empresta cor a dado nenhum: nenhum candidato, nenhuma
  categoria, nenhum estado usa ameixa como identidade própria. Ameixa é o produto falando.
- **A linha da média ponderada é ameixa** — é a leitura do produto sobre a evidência, não a cor de
  um lado.
- **Vermelho e azul são exclusivos dos dois candidatos, nos DADOS**, em toda superfície (§3.1).
- **Zero imagem de pessoa, partido, bandeira ou símbolo oficial** (R4). Nenhum ícone de "vitória",
  nenhum troféu, nenhuma seta de tendência com juízo de valor.
- **Simetria mensurável:** os dois fundos de candidato têm ΔL 0,003 (§10). Quando os dois nomes
  aparecem lado a lado, aparecem com o mesmo peso, o mesmo tamanho e a mesma ordem em toda a
  página (Lula à esquerda porque está à esquerda **na régua**, não por precedência).
- **A marca nunca aparece dentro da área de plotagem.** Nada de watermark sobre gráfico: o gráfico
  é dado público, e o dado não é anúncio.

---

## 9. Integração — o que a Fase 6 tem de fazer

1. Trocar o `@import "./tokens.css"` de `globals.css` por `./tokens-v2.css` e **apagar**
   `tokens.css`. Até lá os dois arquivos convivem: os nomes de token da v2 são todos novos, nenhum
   reaproveita nome antigo com valor diferente.
2. Carregar Instrument Serif (400) e Lexend por `next/font` no layout raiz, expondo
   `--font-instrument-serif` e `--font-lexend` (é o que `--font-display` e `--font-texto` esperam).
   Self-host obrigatório: zero request a terceiros em runtime.
3. Reescrever `globals.css`: a base do produto (`body`) passa a ser bruma-ameixa + Lexend; o grão
   de papel e o CSS da tela da urna saem inteiros.
4. Redesenhar `icon.svg`, `apple-icon`, `opengraph-image` e o cabeçalho com o wordmark (§8) —
   a arte v1 (cursor `▊`, dígitos de urna, paleta fósforo) é substituída, não adaptada.
5. Aplicar a renomeação listada em `docs/MARCA.md` §5.
6. Confirmar a feature `tnum` da Lexend (§3.2) e medir a bolinha do enxame a 390 (§2.2) —
   as duas verificações são de aceitação, não de opinião.

---

## 10. Contrastes calculados (WCAG 2, matemática de conformidade)

Calculados, não estimados, com a fórmula de luminância relativa do WCAG 2 (a mesma que audita e
que a lei cobra; APCA não é norma — P6). Piso: **4,5:1 texto**, **3:1 não-texto (1.4.11)**.

### 10.1 Texto — piso 4,5:1

| Texto           | Sobre           | Contraste     | Uso                             |
| --------------- | --------------- | ------------- | ------------------------------- |
| `tinta`         | `placa`         | **16,68:1** ✔ | corpo dentro do bloco           |
| `tinta`         | `bruma`         | **14,25:1** ✔ | texto solto na página           |
| `tinta`         | `nicho`         | **15,16:1** ✔ | nota/caixa dentro do bloco      |
| `tinta`         | `ameixa-bruma`  | **12,40:1** ✔ | chip                            |
| `tinta`         | `faixa`         | **12,09:1** ✔ | rótulo sobre a faixa da dúvida  |
| `tinta`         | `lula-fundo`    | **12,96:1** ✔ | valor no nicho de Lula          |
| `tinta`         | `flavio-fundo`  | **12,98:1** ✔ | valor no nicho de Flávio        |
| `tinta`         | `atencao-fundo` | **14,30:1** ✔ | texto do aviso âmbar            |
| `tinta-media`   | `placa`         | **7,13:1** ✔  | texto secundário                |
| `tinta-media`   | `bruma`         | **6,09:1** ✔  | linha de tempo, legenda de eixo |
| `tinta-media`   | `nicho`         | **6,48:1** ✔  | estado desabilitado legível     |
| `ameixa`        | `placa`         | **9,41:1** ✔  | link, tagline, rótulo de marca  |
| `ameixa`        | `bruma`         | **8,04:1** ✔  | tagline no cabeçalho            |
| `ameixa`        | `ameixa-tenue`  | **8,23:1** ✔  | botão-fantasma em hover         |
| `ameixa`        | `ameixa-bruma`  | **6,99:1** ✔  | botão-fantasma pressed · chip   |
| `tinta-inversa` | `ameixa`        | **8,91:1** ✔  | botão primário                  |
| `tinta-inversa` | `ameixa-forte`  | **11,54:1** ✔ | botão primário em hover         |
| `tinta-inversa` | `ameixa-pressa` | **15,80:1** ✔ | botão primário pressed          |
| `lula`          | `placa`         | **6,18:1** ✔  | nome/numeral de Lula            |
| `lula`          | `bruma`         | **5,28:1** ✔  | nome de Lula fora do bloco      |
| `lula`          | `lula-fundo`    | **4,80:1** ✔  | nome no nicho de Lula           |
| `flavio`        | `placa`         | **9,50:1** ✔  | nome/numeral de Flávio          |
| `flavio`        | `bruma`         | **8,11:1** ✔  | nome de Flávio fora do bloco    |
| `flavio`        | `flavio-fundo`  | **7,39:1** ✔  | nome no nicho de Flávio         |
| `atencao`       | `placa`         | **6,11:1** ✔  | chip de glossário, nota         |
| `atencao`       | `bruma`         | **5,22:1** ✔  | chip sobre a página             |
| `atencao`       | `atencao-fundo` | **5,23:1** ✔  | aviso âmbar cheio               |
| `tinta-inversa` | `atencao`       | **5,78:1** ✔  | chip âmbar cheio (/admin)       |

### 10.2 Não-texto — piso 3:1 (SC 1.4.11)

| Objeto                            | Contra         | Contraste     | Nota                                           |
| --------------------------------- | -------------- | ------------- | ---------------------------------------------- |
| bolinha `lula`                    | `placa`        | **6,18:1** ✔  | é a folga de 2px que garante este par          |
| bolinha `flavio`                  | `placa`        | **9,50:1** ✔  | idem                                           |
| régua do empate (`tinta`)         | `placa`        | **16,68:1** ✔ | a referência do produto inteiro                |
| régua do empate (`tinta`)         | `faixa`        | **12,09:1** ✔ | régua atravessando a barra de pesquisa         |
| eixo (`contorno`)                 | `placa`        | **3,52:1** ✔  | linha de base do enxame                        |
| `contorno`                        | `bruma`        | **3,01:1** ✔  | borda significativa fora do bloco              |
| `faixa-borda`                     | `placa`        | **5,34:1** ✔  | limite externo da faixa da dúvida              |
| `faixa-borda`                     | `faixa`        | **3,87:1** ✔  | limite interno — é por isso que a borda existe |
| linha da média (`ameixa`)         | `placa`        | **9,41:1** ✔  | leitura do produto sobre a evidência           |
| linha da média (`ameixa`)         | `faixa`        | **6,82:1** ✔  | a linha vive DENTRO da faixa                   |
| traço secundário (`ameixa-clara`) | `placa`        | **5,71:1** ✔  | série do 1º turno, marcas de eixo              |
| ponto `lula`                      | `faixa`        | **4,48:1** ✔  | marcador sobre a barra de pesquisa             |
| ponto `flavio`                    | `faixa`        | **6,88:1** ✔  | idem                                           |
| anel de foco (`foco`)             | `placa`        | **9,41:1** ✔  |                                                |
| anel de foco (`foco`)             | `bruma`        | **8,04:1** ✔  |                                                |
| anel de foco (`foco`)             | `lula-fundo`   | **7,31:1** ✔  | foco dentro do nicho de Lula                   |
| anel de foco (`foco`)             | `flavio-fundo` | **7,32:1** ✔  | foco dentro do nicho de Flávio                 |
| anel de foco (`foco`)             | `ameixa-bruma` | **6,99:1** ✔  | foco em chip                                   |
| anel invertido (`foco-inverso`)   | `ameixa`       | **9,41:1** ✔  | foco sobre campo ameixa                        |

### 10.3 Pares abaixo de 3:1 — declarados, com a compensação escrita

Nenhum deles carrega informação sozinho. Isto não é tolerância: é a lista fechada de onde o produto
**não pode** depender de contraste, e o que faz o lugar dele.

| Par                           | Contraste              | Por que é aceitável                                                                                                                                                                                                                                                                        |
| ----------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `lula` × `flavio`             | **1,54:1**             | Os dois nunca compartilham fronteira: no enxame há ≥2px de placa entre bolinhas (cada uma faz 6,18/9,50 contra a placa) e a régua do empate os separa; a informação é **posição + nome**, não cor. Em OKLCH a separação existe: **ΔL 0,119** (sobrevive ao P&B e ao filtro de daltonismo). |
| `lula-fundo` × `flavio-fundo` | **≈1,0:1**             | Isocromia **deliberada** (ΔL 0,003) exigida por R4. Por isso os dois **nunca** são lados de uma forma dividida (§4.3); são campos de nichos separados, cada um com o nome do candidato dentro.                                                                                             |
| `lula-fundo` / `flavio-fundo` | 1,29 / 1,28 vs `placa` | Superfícies decorativas: quem informa é o rótulo dentro do nicho, não o limite do nicho.                                                                                                                                                                                                   |
| `faixa` vs `placa`            | **1,29:1**             | O campo da faixa é claro de propósito (linha e rótulos vivem em cima). Quem cumpre 1.4.11 é a **borda obrigatória** (5,34 / 3,87). Faixa sem borda é defeito, não escolha.                                                                                                                 |
| `grade` vs `placa`            | **1,28:1**             | Grade **decorativa**. A única referência que o leitor precisa ver é o empate, em tinta a 16,68:1.                                                                                                                                                                                          |
| `filete` vs `placa`           | **1,49:1**             | Separador decorativo dentro do bloco; não delimita conteúdo.                                                                                                                                                                                                                               |
| `bruma` vs `placa`            | **1,17:1**             | É a hierarquia de superfície do sistema, não um limite semântico.                                                                                                                                                                                                                          |
| `contorno` vs `faixa`         | **2,55:1**             | Registrado como **proibição**: `contorno` não pode ser usado em cima da faixa. Ali usa-se `faixa-borda` ou `tinta`.                                                                                                                                                                        |

### 10.4 Clareza OKLCH (para a próxima calibração)

`ameixa` L 0,404 · `ameixa-forte` 0,338 · `ameixa-pressa` 0,279 · `ameixa-clara` 0,520 ·
`lula` 0,518 · `flavio` 0,399 · `atencao` 0,503 · `tinta` 0,237 · `tinta-media` 0,462 ·
`faixa` 0,895 · `faixa-borda` 0,593 · `contorno` 0,631.

**ΔL(OKLCH) Lula × Flávio = 0,119** · **ΔL(OKLCH) lula-fundo × flavio-fundo = 0,003**.

---

## 11. Decisões novas desta fase (contexto → decisão → porquê)

Para o registro em `DECISOES.md` (R6).

1. **Gráfico do conceito C** — a sugestão aberta do orquestrador era absorver "cada pesquisa contra
   a linha do empate" → **adotado, adaptado** (§4.3) → é o único jeito de fazer "empate técnico"
   ser VISTO em vez de lido, ele já fala a gramática da régua do ENXAME, não é barra-com-bigodinho
   (é o que P4 prescreve) e custa DOM/CSS puro, sem bundle novo.
2. **Barra de pesquisa monocromática** — o original do C dividia a barra no zero em rosa/azul
   pálidos → **barra inteira em `--color-faixa` (lilás), sem divisão** → os dois fundos de candidato
   são isocromos por exigência de R4 (ΔL 0,003), então a divisão teria contraste ≈1,0 e sumiria em
   P&B; quem mostra o cruzamento é a régua de tinta (12,09:1). Efeito colateral bom: "dúvida =
   lilás" passa a valer no produto inteiro.
3. **Domínio do enxame deixa de ser fixo** — `[-11,+21]` hardcoded dava bolinha de 7,8px a 390 →
   **domínio = intervalo dos 100 quantis, arredondado para colunas inteiras; coluna dobra para
   2 p.p. se passar de 33 colunas** → o piso de 8px vira consequência do desenho, não um número
   torcido à mão; e o enxame se adapta sozinho quando σ mudar.
4. **A faixa de incerteza ganha borda obrigatória** — o campo lilás faz só 1,29:1 contra a placa e
   escurecê-lo até 3:1 mataria a leitura da linha por cima → **borda `--color-faixa-borda`
   (5,34:1 vs placa · 3,87:1 vs faixa)** → cumpre 1.4.11 sem transformar a dúvida num campo pesado.
   A mesma borda, tracejada, separa observado de projetado — zero token de cor novo.
5. **Sem verde de sucesso e sem vermelho de perigo, inclusive no /admin** — a paleta pedia
   semânticas de estado → **só âmbar-queimado (atenção) e ameixa (afirmativo)** → vermelho e azul
   são propriedade dos candidatos em toda superfície (R4): um print do /admin não pode ser lido
   como tomando partido, e o produto não tem nada a comemorar.
6. **Sombra proibida em bloco parado** — o briefing pedia 2 níveis de elevação → **os dois tokens
   existem, mas só para o que flutua acima do conteúdo (bottom sheet, popover, faixa fixa)** →
   empilhar elevação em bloco estático é exatamente o neumorfismo banido; aqui a profundidade vem
   de tinta de fundo (bruma → placa → nicho).
7. **Mono não volta nem como fonte de dados** — a v1 usava IBM Plex Mono em número → **numeral
   tabular sai da própria Lexend, pelo utilitário `numeros`** → P7 só admite mono onde ela presta
   serviço real, e `tabular-nums` resolve alinhamento sem trocar de tipo. Verificação de `tnum`
   fica como gate de aceitação da Fase 6.
8. **`--font-sans` aponta para `--font-texto`** — o preflight do Tailwind v4 lê a família padrão do
   documento de `--font-sans` → **alias explícito** → o corpo do site nasce em Lexend sem nenhuma
   classe, e ninguém precisa lembrar de aplicar `font-texto` em cada página.
9. **`prefers-reduced-motion` não reseta `transform`** — a rede de segurança óbvia seria zerar
   transform junto com animação → **zera duração, deslocamento e stagger, e mata a animação de
   `[data-motion="decorativo"]`; `transform` fica intacto** → `transform` também posiciona
   (centralização por `translate`): zerá-lo quebraria layout em vez de acalmar movimento.
10. **Stagger por coluna, nunca por bolinha** — 100 atrasos individuais eram a leitura natural de
    "as bolinhas caem" → **atraso por COLUNA, com teto de 260ms** → a coluna é o bin, e é o bin que
    representa acúmulo; escalonar por bolinha viraria chuva decorativa e estouraria o orçamento de
    300ms.

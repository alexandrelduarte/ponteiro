# Crítica — ITERAÇÃO 4 do loop v2

**Autor:** qa-critic · **Base:** os 36 PNGs de `.qa/iter-v2-4/`, lidos contra os 38 de
`.qa/iter-v2-3/`, contra a minha própria `.qa/iter-v2-3/critica.md`, e contra `docs/DESIGN-V2.md`,
`docs/VOZ.md`, `docs/MARCA.md`.
**Gates automáticos** (142 unit + golden · 60 e2e com console limpo · axe zero · Lighthouse
**97/100/100/100**, LCP 2,6 s · CLS 0): verdes, **não re-julgados aqui**. Conferi de passagem que
o artefato bate com a declaração — `lighthouse.json` desta pasta traz `performance 97`,
`accessibility 100`, `best-practices 100`, `seo 100`, LCP 2,6 s, CLS 0, TBT 40 ms, FCP 0,9 s,
colhido em `2026-08-04T20:44:17Z`. Conferir não é re-julgar; era um número novo (era 92 na
iteração 3) e um número novo merece um olhar.

Formato: `[SEVERIDADE] print — critério(nº) — descrição acionável com posição`.
Coordenadas em pixels do PNG citado (origem no topo esquerdo).

---

## Método desta rodada — e por que ele é mais forte que o das anteriores

A correção foi de **uma classe**. Isso permite uma prova de não-regressão que eu não tinha nas
rodadas anteriores: **comparação byte a byte dos 36 prints contra os da iteração 3**.

| resultado | quantidade |
| --- | --- |
| PNGs **byte-idênticos** ao da iteração 3 | **25 de 36** |
| PNGs diferentes | 11 |

Dos 11 diferentes, **um** é o alvo do conserto e **dez** são prints da home. Fui atrás de cada
faixa de diferença, uma por uma:

| print | faixas alteradas | o que é |
| --- | --- | --- |
| `metodologia-390-full.png` | **y 480–579, x 16–373, 2 373 px — e mais nada na página** | **o conserto** |
| `home-390-full.png` / `-candidatos` | y 5 638–5 852 (x 234–326) · y 6 944–6 953 (x 256–263) · 8 px no eixo | vertical "hoje" + as duas bordas do cone tracejado da evolução; `peso médio 0,84 → 0,83` num cartão de pesquisa |
| `home-768-full.png` / `-candidatos` | y 4 539–4 782 · y 5 534–5 544 · y 12 963–12 992 · y 15 422–15 430 | os mesmos + o **cruzamento** das duas curvas de sensibilidade |
| `home-1440-full.png` / `-candidatos` | y 4 279–4 575 · y 5 354–5 366 · y 11 887–11 926 | idem |
| `home-{390,768,1440}-pesquisas`, `-evolucao` | ≤ 756 px cada | recortes das mesmas faixas |

Ampliei as três maiores em 4× e sobrepus as máscaras de diferença: são **a linha do "hoje", as
duas bordas do cone de projeção e o ponto de cruzamento das curvas, deslocados por menos de um
pixel**, mais um dígito de peso. Tudo isso é função do relógio (as capturas distam ~55 min).
**Nenhuma mudança de layout, nenhuma mudança de altura:**

| página | iteração 3 | **iteração 4** |
| --- | --- | --- |
| home 390 / 768 / 1440 | 23 338 / 17 423 / 16 065 | **iguais** |
| metodologia 390 / 768 / 1440 | 6 843 / 5 698 / 6 129 | **iguais** |
| historico 390 / 768 / 1440 | 2 977 / 2 305 / 2 276 | **iguais** |

Além disso, casei cada print de seção contra o print de página inteira por correlação de linhas:
**erro 0** em 18 dos 24 casamentos, e ≤ 926 px nos 6 que contêm gráfico dependente do relógio.
Ou seja: os prints de seção e os de página inteira descrevem o mesmo DOM. Não há discrepância de
carga preguiçosa escondida entre as duas capturas.

---

## Item 1 — ANTI-REGRESSÃO: **PASSA** (quarta vez)

Varredura das 18 cores da v1 nas **12 páginas inteiras** (home ×3, metodologia ×3, historico ×3,
candidatos ×3), tolerância ≤ 6 na soma dos canais:

| cor da v1 | pixels |
| --- | --- |
| `#E8E8DF` · `#0E241A` · `#A7EFBB` · `#D8FBE2` · `#1E3A2C` · `#C6C6B8` | **0** |
| `#C4122F` lula-v1 · `#16418C` flavio-v1 · `#D96A1B` · `#1E7A46` | **0** |
| `#7C3AED` · `#0E7C86` · `#E8791D` · `#A16207` · `#0F766E` | **0** |
| `#D96A7A` · `#E8A4AE` | **0** |

Único acerto: `#F6F6F0`, **5 762 px** — antialiasing de `#f6f3f7` sobre branco. Rodei a mesma
varredura nos **mesmos 12 arquivos** da iteração 3: **5 764 px**. Diferença de 2 px, e a queda
frente aos 25 402 que reportei na rodada passada é só o conjunto de arquivos (aquela contagem
incluía os dois prints "aberto", que somam 48 mil linhas a mais). A métrica é estável.

---

## Itens

### BLOCKER

**Nenhum.**

### MAJOR

**Nenhum.**

### MINOR

**Nenhum.** O único MINOR do loop v2 fechou — a prova está na seção seguinte.

### NIT (cinco; nenhum deles muda um pixel da tela)

**[NIT] `src/data/constantes.ts:13-25,60-66` e `src/lib/modelo/derivados.ts:212-213` —
critérios 13, 1 — terceira rodada, não corrigido (deliberado).** A paleta v1 continua inteira no
dado morto e `derivados.ts` ainda escreve `cor: CORES.flavio`, `CORES.lula`, `"#D96A7A"`,
`"#E8A4AE"` nas bandas do cenário-base. **Zero px chegam à tela** — medido acima, quarta vez.
Fica registrado pelo mesmo motivo de sempre: o campo morto é o caminho por onde a v1 volta.

**[NIT] `scripts/qa/screenshots.mjs:62` — ferramenta, não produto — não corrigido.** O `newPage`
continua sem `locale: "pt-BR"` (o `playwright.config.ts` passa). Por isso o `<input type="date">`
de "Adicionar uma pesquisa à minha simulação" segue saindo `mm/dd/yyyy` nos prints — e é por isso
que os prints da home continuam byte-idênticos nessa região: o produto está certo, a captura é que
mente. Uma linha.

**[NIT] tutorial "Como ler esta página", passo 3 — critério 10 — inalterado, e continua
deliberado.** Sem os prints "aberto" nesta rodada, verifiquei **no código**:
`como-ler.tsx:64` usa `<Termo chave="margemErro" />` sem filho, logo imprime o rótulo do verbete,
`"margem de erro"` (`textos.ts:127-128`); `serie-pesquisas.tsx:183` passa o filho e imprime
`"folga da medida"`. O tutorial ensina um rótulo que a superfície não usa — **e continuo contra
mudar**, porque esse chip é a terceira ponte de vocabulário e o cartão que ele abre começa
justamente por "'Folga da medida' e 'margem de erro' são a mesma coisa".

**[NIT] `home-1440-full-aberto.png` — critério 6 — carregado da iteração 3, NÃO reverificável
nesta rodada.** Os vãos de ~123 px e ~130 px nas colunas dos blocos "As contas, em uma linha cada"
e "De onde vêm esses números?" só aparecem com os disclosures abertos, e **os dois prints "aberto"
não foram tirados** (36 prints contra os 38 da rodada passada). O código dessas rotas não foi
tocado; registro o NIT como carregado e a lacuna de evidência abaixo.

**[NIT] `src/components/site/seletor-metodologia.tsx:67` — documentação, não produto.** O
cabeçalho do arquivo explica em seis linhas por que o trilho ganhou anel, mas **não explica por
que o raio é condicional**. A classe agora é
`rounded-nicho ... sm:rounded-plena`, e a razão (abaixo de `sm` o controle quebra em duas linhas e
um estádio de 100 px de altura vira raio 50, que engole a pílula) é exatamente o tipo de coisa que
o próximo leitor "limpa" por parecer inconsistência. Duas linhas de comentário no padrão da casa
fecham a porta da reincidência. **Não é defeito de produto e não entra na contagem de severidade.**

---

## O MINOR da iteração 3: **FECHADO** — medido, não aceito de palavra

**Onde:** `metodologia-390-full.png`, y 480–579. É a **única** faixa da página que mudou:
2 373 px alterados, x 16–373, e **nenhum outro pixel dos 6 843 × 390 da página**. O conserto não
empurrou nada.

**O que o trilho é agora.** Perfil de aresta lido linha a linha:

| y | 480 | 484 | 486 | 488 | **490 → 566** | 570 | 575 | 579 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| x esquerdo | 27 | 20 | 19 | 17 | **16 (77 linhas retas)** | 17 | 20 | 27 |
| x direito | 362 | 369 | 370 | 372 | **373** | 372 | 369 | 362 |

Ajustei um arco a esses pontos (usando a borda inferior de cada linha de pixel, que é o que o
rasterizador cobre): **raio 16 px**, erro máximo **0,8 px**, nos **quatro** cantos, simétrico nos
dois eixos. 16 px é `--radius-nicho` (`tokens.css:255`). É token, não valor mágico — critério 13.

**A colisão morreu, com número.** Comparação direta, mesma medição nas duas rodadas:

| | iteração 3 (estádio, r 50) | **iteração 4 (r 16)** |
| --- | --- | --- |
| folga mínima pílula ↔ anel, lado esquerdo | **0 px** (em y 504–506) | **4 px** (em y 505) |
| folga no topo da pílula (y 484) | 6 px | **22 px** |
| linhas do trilho **sem traço de anel** à esquerda | **1** (y 496 — anel coberto pela pílula) | **0** |
| salto de descontinuidade no perfil do anel | sim: x 20 → **41** entre y 502 e 506 | **nenhum**; perfil monotônico |

O sintoma que eu tinha descrito — "~44 px do anel superior-esquerdo somem atrás da pílula, e o
contorno lê como interrompido" — **não existe mais**: o perímetro fecha inteiro. Ampliação 3× dos
dois estados lado a lado confirma a olho o que a medição diz.

**O anel está com o contraste que o token promete.** Cortei a seção transversal da borda: o pixel
de borda é **exatamente `#8E8598`** (x = 16 na aresta esquerda, y = 480 na superior), com um único
pixel de mistura ao lado — ou seja, o traço de 1,5 px rende **1 px cheio + 1 px de meia cobertura**,
e não dois pixels lavados. `#8E8598` contra a bruma `#efecf1` = **3,01:1**, como `tokens.css:130`
declara. Critério 7 mantido no controle consertado.

**A pílula continua alvo de toque legal:** y 484–527, **altura 44 px** (`min-h-toque`), x 20–212.

**Ganho colateral que vale registrar.** O estádio antigo tocava a margem do texto (x = 16) em um
trecho de **~22 px**; a aresta reta agora coincide com a coluna de leitura por **77 px**. Medi as
duas coisas: rótulo "Como você quer ler esta página?", trilho, parágrafo abaixo e a prosa da
página **começam todos em x = 16**. O controle está mais alinhado com o texto do que estava — o
conserto não foi só remendo.

**768 e 1440: estádio intacto, e a prova é a mais forte possível.**
`metodologia-768-full.png` e `metodologia-1440-full.png` são **byte-idênticos** aos da iteração 3.
O `sm:rounded-plena` fez exatamente o que devia: não tocou em um pixel dos viewports onde o
controle cabe em uma linha. Conferi também a olho nos dois — trilho-estádio, pílula contida,
prosa sem cartão em volta.

**Uma ressalva honesta, e ela não é um item.** Os prints só fotografam o estado **"Explicação
simples"** (pílula na 1ª linha). No estado "técnica" a pílula vai para a 2ª linha, e o canto que
importa passa a ser o **inferior-esquerdo**. Não tenho pixel disso; tenho geometria: a aresta reta
do trilho vai de y 490 a y 566, a pílula da 2ª linha é um estádio de raio 22 centrado em y ≈ 553,
e o ponto mais à esquerda dela (x = 20) cai **dentro** desse trecho reto → folga de **4 px**, igual
à da 1ª linha; nas alturas em que o trilho arqueia (y ≥ 567) a pílula já recuou para x ≥ 22,4 por
causa do próprio raio. **É derivação, não medição** — e é a única coisa nesta crítica que não
verifiquei no pixel. Um print a mais na próxima captura fecha isso (ver o fim).

---

## Amostragem dirigida — o que fui conferir para saber se algo regrediu

Pedido explícito, feito região por região. Onde o print é byte-idêntico ao da iteração 3 eu digo,
porque identidade binária é prova mais forte que releitura — mas **reli assim mesmo** todas as
regiões abaixo, porque olhar é o meu trabalho.

| região | print | estado |
| --- | --- | --- |
| **dobra 390** | `home-390-hero.png` (byte-idêntico) | intacta: wordmark + tagline · "2º turno · 25 de outubro · **faltam 82 dias**" · manchete serif em 3 linhas com **83** carmim e **17** naval · "o mesmo que dizer 83% de `chance ?`" · enxame com régua "empate" · "← Flávio na frente · **18**" / "**82** · Lula na frente →" · micro-legenda com **"até outubro isso ainda pode mudar"** em negrito · "**Isto não é previsão.** É o que as 13 pesquisas registradas no TSE dizem" com duas linhas inteiras dentro dos 844 px |
| **contexto traduzido** | `home-390-full.png` y 9 750–11 400 | traduzido, sem jargão cru: "Governo com aprovação entre 42% e 48% **costuma disputar de igual para igual: continua na disputa, mas sem vantagem grande**" · "**sobra pouca gente para conquistar**" · "**fatos grandes, vindos de fora da disputa**" · datas por extenso ("16/08", "04/10 e 25/10", "desde 22/07", "dezembro de 2024"). MAJOR 1 da iteração 2 continua fechado |
| **rodapé único** | `home-390-full.png` y 22 530–23 338; `historico-390-full.png` y 2 150–2 977; `historico-1440-full.png` | um bloco "Antes de sair", **três** parágrafos, fonte única. Uma ocorrência de "Chance alta não é garantia…", uma de "A lista só cresce…", uma de "Os números pertencem aos respectivos institutos…". Idêntico nas três páginas |
| **/metodologia, coluna de leitura** | `metodologia-390/768/1440-full.png` | prosa direto sobre a bruma, **zero cartão** na coluna, nos três viewports. §5.7 cumprido. 768 e 1440 byte-idênticos |
| **ponte da margem de erro** | `home-390-full.png` y 2 820–2 960 | presente e em negrito, na primeira ocorrência do termo: "menor que **o dobro** da **folga da medida — a margem de erro**. É essa a folga que vale quando se comparam os dois números" |
| **enxames em escala** | `home-{390,768,1440}-hero.png` | contagem por componentes conexos com filtro de circularidade: **82 carmim + 18 naval = 100** nos **três** viewports. Diâmetro do herói **9 / 18,5 / 27 px** (390/768/1440) — cresce com o viewport, sem teto, e continua o maior enxame da página |
| **candidatos** | `home-390-candidatos.png` y 9 020–10 700; `home-1440-candidatos.png` y 6 900–7 900 | nove linhas no ritmo de duas ("Nº · Nome" / "Partido · média de N pesquisas"), régua fixa 0–50 % com o tique de 25 % no mesmo x em todas, líder **sem** barra cheia (41,4 % numa régua que vai até 50 %), legenda da régua embaixo |
| **curva** | `home-390-full.png` y 16 700–17 500; cruzamentos a 768 e 1440 | rótulos **empilhados acima** da plotagem ("onde você está", "As pesquisas estão certas", "Igual a 2022", "Teste-limite: 6,3"), vertical ameixa começando abaixo deles, "a linha tracejada no 50 é a metade a metade" como legenda de topo. **Zero colisão** nos três viewports |

**Controle irmão, porque o defeito era de família.** Fui procurar outra instância do mesmo padrão
(trilho com anel + `flex-wrap` + raio pleno). `grep` em todo o `src`: **o seletor da /metodologia é
o único**. Os dois outros segmentados que existem — o "1º turno / 2º turno" da evolução e o
"Lula × Flávio / Candidatos testados (9)" — são campo cheio **sem anel**, e medi o segundo, que é
o único que quebra a linha do rótulo a 390: pílula contida com **4 px** de folga à direita e
~5 px em cima e embaixo. Sem anel não há anel para partir. Nada a filar.

---

## Teste do leigo — 4 de 4, segunda vez

**Persona:** homem de 47 anos, ensino fundamental incompleto, Android de entrada, dados contados.
`home-390-hero.png` é **byte-idêntico** ao da iteração 3, então as quatro respostas que eu
transcrevi lá valem por identidade. Reli o print inteiro assim mesmo:

1. **"Quem está na frente?"** — "O Lula. *Lula é eleito em **83** e Flávio em **17***, e o montão
   de bolinha vermelha tá no lado que diz **82 · Lula na frente →**." **PASSA.**
2. **"É certeza?"** — "Não, em 17 de cada 100 ganha o outro; e tá escrito que *nenhuma é o
   resultado*." **PASSA.**
3. **"Isso pode mudar até a eleição?"** — "Pode: ***até outubro isso ainda pode mudar***, com
   letra grossa." **PASSA.** A cláusula está a 172 px da dobra.
4. **"O que é margem de erro?"** — "Achei rolando: ***folga da medida — a margem de erro***; e em
   **Metodologia** é o primeiro verbete, com exemplo de 45 a 49." **PASSA.**

**Critério 2: PASSA inteiro, pela segunda rodada seguida.**

---

## Varredura final da rubrica de 14 itens

| # | critério | veredito desta rodada | como sei |
| --- | --- | --- | --- |
| 1 | anti-regressão vs v1 | **PASSA** (4ª) | 17 de 18 cores da v1 em **0 px** nas 12 páginas; a 18ª é antialias |
| 2 | teste do leigo | **PASSA** (4/4) | acima |
| 3 | craft dos gráficos | **PASSA** | amostrei enxame do herói ×3, evolução ×3, sensibilidade ×3, cápsulas-exemplo com legenda, barras dos 9 candidatos, cruzamento das curvas. Faixa de incerteza, régua "empate", "hoje", cone tracejado rotulado como `projeção ?` — nada com cara de default de biblioteca |
| 4 | microinterações / 60 fps | **fechado** (auditado na iteração 3) | o conserto é um raio; não criou transição. O botão segue em `transition-colors duration-(--dur-rapida) ease-(--ease-padrao)` — token |
| 5 | dobra responde em 5 s | **PASSA** | banda a banda no herói 390, acima |
| 6 | hierarquia tipográfica | **PASSA** | manchete serif domina a dobra; escala consistente nos três viewports |
| 7 | contraste / alvo / foco / axe | **PASSA** | pílula com **44 px** de altura; anel do trilho medido em `#8E8598` puro = **3,01:1** vs bruma; axe zero é gate |
| 8 | cartões a 390 / sem scroll acidental | **PASSA** | tinta contida na placa nas 12 páginas: 390 → x 16..373 · 768 → 24..743 · 1440 → 220..1219. Idêntico à iteração 3 |
| 9 | linguagem simples em toda superfície | **PASSA** | contexto, "virar", pesquisas, cenário-base e simulação relidos nesta rodada; jargão só em /metodologia, e lá com seletor |
| 10 | marca consistente | **PASSA** com a ressalva de sempre | wordmark PONTEIRO + "Para onde apontam as pesquisas" nas três páginas; favicon e OG existem no código mas **não aparecem em print** — continuam declarados, não julgados, terceira rodada |
| 11 | neutralidade | **PASSA** | 83/17 no mesmo peso tipográfico, um carmim e um naval; identidade da casa em ameixa (terceira cor); nos 9 candidatos, os dois primeiros nas cores de partido e os outros sete em neutros |
| 12 | honestidade estatística | **PASSA — nada a assinar** | 82 + 18 = 100 nos três viewports; reconciliação 83↔82 e 63↔69 escritas; régua fixa 0–50 %; nenhum eixo truncado |
| 13 | tokens | **PASSA** | o conserto usa `--radius-nicho` e `--radius-plena`; nenhum valor mágico entrou. O NIT do dado morto continua sendo dado, não pixel |
| 14 | console e rede | **gate** | 60 e2e com console limpo |

---

## Suspeitas que morreram na verificação, e que eu NÃO filei

Quatro nesta rodada. A regra anti-desperdício vale nos dois sentidos, e ela vale **mais** numa
rodada que pode ser a primeira limpa: é exatamente aqui que a tentação de mover a trave aparece.

1. **"A home mudou em dez prints — alguma coisa regrediu."** Não. Fui atrás das 17 faixas de
   diferença uma a uma, com máscara ampliada em 4×: são a vertical do "hoje", as bordas do cone de
   projeção, o cruzamento das curvas de sensibilidade e um `peso médio 0,84 → 0,83`. Deslocamentos
   sub-pixel de coisas que dependem do relógio, com as capturas separadas por ~55 min. Zero mudança
   de altura em nove páginas.
2. **"O anel do trilho está lavado — 1,5 px nunca chega à cor cheia."** Medi a seção transversal:
   o pixel de borda é `#8E8598` **exato**. O traço rende 1 px cheio + 1 px de meia cobertura. 3,01:1
   confirmado. Não é defeito.
3. **"A folga entre a pílula e o anel é apertada (2–3 px de branco visível no ponto mais largo)."**
   É o `p-1` (4 px) menos a espessura do anel, é **igual nos três viewports e nos dois estados**, é
   a mesma relação desde a iteração 1 — e eu passei por ela sem filar em três rodadas. Filá-la
   agora, na rodada que pode fechar o loop, seria mover a trave por gosto. Deixo a medição aqui
   para o design-lead me derrubar se quiser.
4. **"Trilho retangular a 390 e estádio a 768 é incoerência de forma."** Um usuário vê **um** dos
   dois. E a forma segue a função: estádio é a forma certa de um controle de uma linha; de duas
   linhas, estádio vira raio 50 e engole o conteúdo — que foi o defeito. A troca é a correção,
   não um sintoma dela.

---

## Lacunas de evidência (declaradas, não julgadas)

Duas, e nenhuma é defeito:

1. **Os dois prints "aberto" não foram tirados** (36 nesta rodada contra 38 na anterior). Com isso,
   a segunda camada — o que os disclosures revelam — não foi refotografada. Eu a auditei **no
   pixel** na iteração 3 e concluí que é dedup honesto; o código dessas rotas não foi tocado e
   nenhum print fechado mudou de altura. O NIT dos vãos de grid a 1440 vive nessa camada e por isso
   fica **carregado, não reverificado**.
2. **O estado "Explicação técnica" do seletor não é fotografado em viewport nenhum.** É o estado
   que põe uma pílula na **segunda** linha do trilho — justamente onde mora o canto inferior. Julguei
   por geometria (folga de 4 px, mesma da primeira linha) e digo que é derivação.

Nenhuma das duas reabre item. As duas são um pedido de uma linha ao script de captura, e ficam no
fim.

---

## Veredito

| severidade | iteração 1 | iteração 2 | iteração 3 | **iteração 4** |
| --- | --- | --- | --- | --- |
| **BLOCKER** | 2 | 0 | 0 | **0** |
| **MAJOR** | 12 | 4 | 0 | **0** |
| **MINOR** | 13 | 8 | 1 | **0** |
| **NIT** | 6 | 5 | 4 | **5** |
| **total** | 33 | 17 | 5 | **5** |

- **Item 1 (anti-regressão): PASSA**, quarta vez, com 0 px da paleta v1 em 12 páginas.
- **Critério 2 (teste do leigo): 4 de 4**, segunda vez.
- **Critério 12: nada a assinar.**
- **O MINOR da iteração 3: FECHADO**, com o anel contínuo e 4 px de folga onde havia 0.
- **Regressões: zero** — e desta vez isso não é opinião: 25 dos 36 prints são **byte-idênticos** e
  os 11 restantes diferem só em pixels que dependem do relógio.

### Esta é a **PRIMEIRA ITERAÇÃO LIMPA** do loop v2

**0 BLOCKER · 0 MAJOR · 0 MINOR.** **Contador de iterações limpas: 1 de 2.**

O loop ainda **não** fecha: o critério de parada exige **duas consecutivas**, mais o veredito a
quatro mãos com o design-lead. A iteração 5 precisa apenas **não quebrar nada** — e, se ela chegar
limpa, o veredito conjunto vem em cima dela.

### Declaração anti-desperdício (obrigatória — e é a que eu prometi por escrito)

Na iteração 3 eu escrevi: *"Se a iteração 4 fechar o MINOR sem quebrar nada, eu declaro por escrito
agora: não terei melhoria alguma para apontar que um usuário real perceba."* A condição foi
cumprida — o MINOR fechou, medido, e nada quebrou, provado byte a byte. Honro a promessa:

> **Não consigo apontar nenhuma melhoria que um usuário real perceberia.**

Não é fórmula. É o resultado de ter procurado, nesta rodada, nos lugares onde eu tinha mais chance
de achar: o controle consertado (medido em quatro cantos, dois estados, três viewports), o irmão
mais próximo dele em outro componente, as dez faixas de pixel que mudaram na home, e as quatro
suspeitas acima — das quais **três** eu poderia ter filado como MINOR se quisesse adiar o fim do
loop por gosto, e nenhuma sobreviveu à medição.

Os cinco NITs são: dado morto que não chega ao pixel; um parâmetro do meu próprio script de
captura; um rótulo de tutorial que também funciona como ponte de vocabulário; dois vãos de grid
que leem como respiro e que sequer foram refotografados; e um comentário de código que falta.
**Nenhum deles muda o que uma pessoa vê, entende ou consegue fazer nesta página.**

Fica valendo, para a próxima rodada, a outra metade do que prometi: **assino o veredito a quatro
mãos com o design-lead — "é outro produto, é bonito, e um leigo entende" — no fechamento do
segundo ciclo limpo.**

### Próxima iteração — ordem de ataque

**Nada é obrigatório.** Não existe defeito aberto. Se houver apetite, nesta ordem:

1. **Duas linhas no script de captura** — `locale: "pt-BR"` no `newPage` (mata um falso positivo
   por rodada) e, no conjunto de prints, **os dois "aberto" de volta** + **um print do seletor da
   /metodologia a 390 no estado "técnica"**. Isso fecha as duas lacunas de evidência declaradas
   acima e é o único pedido que eu faço para poder assinar a segunda rodada limpa **sem nenhuma
   derivação geométrica**.
2. `constantes.ts` / `derivados.ts:212-213` — tirar a paleta v1 do dado morto e fechar o caminho de
   reentrada. Não conta para o veredito.
3. Duas linhas de comentário em `seletor-metodologia.tsx:67` explicando o raio condicional.

E nada mais. Qualquer mudança além destas três é risco sem contrapartida, a uma rodada do fim do
loop — e eu seria o primeiro a filar a regressão que ela causasse.

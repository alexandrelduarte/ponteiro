# TENDÊNCIAS 2026 — pesquisa de referência para o redesign v2

**Fase 1 do redesign.** Este documento não decide paleta, tipo, layout ou componente: ele
estabelece o *padrão de qualidade* e os *princípios* que a Fase 2 em diante tem de satisfazer.

Regra de método: **princípios, nunca cópia.** Nenhuma paleta, grid, escala tipográfica ou
layout de terceiros é transcrito aqui. O que foi extraído das fontes é sempre a *razão* por trás
de uma decisão, e essa razão é reescrita contra o nosso problema real — comunicar probabilidade
eleitoral a um público brasileiro amplo, majoritariamente no celular, com escolaridade variada.

**Contraexemplo permanente:** a v1 (`v1-urna`). Os prints em `.qa/antes/` foram lidos como
diagnóstico. Os defeitos que este documento existe para não repetir:

- rótulos em **caixa-alta monoespaçada** (`CHANCE DE SER ELEITO · LULA (ESQ.) × FLÁVIO (DIR.)`)
  — o formato de leitura mais lento que existe, aplicado justamente ao texto que mais importa;
- **parágrafos de ~90 palavras a ~13px** explicando o modelo dentro do card de manchete;
- a barra dupla **83% ▮▮▮▮ 17%**, que o olho lê como *placar de jogo encerrado*, não como
  distribuição de cenários — o oposto do que o modelo diz;
- eixo Y do gráfico de evolução truncado em **30–55** sem que nada explique o que 50 significa;
- **cards indiferenciados** do topo ao rodapé: tudo tem a mesma moldura, nada tem hierarquia;
- selo `empate técnico` como *badge* de texto, quando "empate técnico" é uma afirmação
  geométrica (as faixas se sobrepõem) que deveria ser vista, não lida.

O público-alvo mudou: entra gente de baixa escolaridade, em celular barato. Isso não é um pedido
de "simplificar visualmente" — é um pedido de **rigor**: cada elemento tem de ganhar o seu lugar
provando que comunica.

---

## Os 12 princípios acionáveis

### P1 — Probabilidade se conta, não se lê: frequência natural antes de porcentagem

**Fontes:** Kay, Kola, Hullman, Munson — *Uncertainty Displays Using Quantile Dotplots or CDFs
Improve Transit Decision-Making* (CHI 2018, PDF aberto em mjskay.com) · Yang, Mortenson, Nisbet,
Diakopoulos, Kay — *In Dice We Trust: Uncertainty Displays for Maintaining Trust in Election
Forecasts Over Time* (CHI 2024, **Best Paper**; listagem aberta no Mu Collective, Northwestern) ·
literatura de frequências naturais / *icon arrays* em comunicação de risco (Gigerenzer &
Hoffrage; aplicação em dataviz revista via Datawrapper Academy).

**Princípio.** Porcentagem é o pior formato possível para leitor de baixa numeracia: é um número
abstrato sem denominador visível. Formatos de **frequência discreta e contável** — *quantile
dotplot*, *icon array*, grade de resultados possíveis — melhoram a qualidade da decisão, e o ganho
é *maior* exatamente entre quem tem menos numeracia. No estudo eleitoral de 2024, os dois formatos
que sustentaram mais confiança ao longo do tempo (inclusive depois de resultado surpreendente)
foram **resumo em texto** e **quantile dotplot** — não a barra, não o medidor.

**Neste produto:** o **hero de probabilidade** deixa de ser a barra 83/17 e passa a ser um campo de
resultados contáveis — *"em 100 eleições parecidas com esta, Lula vence em 83 e Flávio em 17"* —
com as 100 unidades desenhadas e contáveis a 390px. O `83%` continua existindo, mas como **rótulo
do campo**, não como a mensagem inteira. Esse campo contável é o **elemento-assinatura** do
produto (ver P12): ele reaparece em miniatura no resultado dos **sliders de premissas** e como
marcador de dispersão na **tabela de pesquisas**.

---

### P2 — Texto é dado: manchete que conclui, anotação que explica o movimento

**Fontes:** Datawrapper — *Fix my chart: Using text elements* (Rose Mintzer-Sweeney) ·
Observable — *What Data Teams Can Learn from Journalists About Data Visualization* (mar/2026) ·
Cai, Wang, Mortenson, Yang, Nisbet, Kay — *Through a Live Elections Dashboard, Darkly: Managing
Expectations and Trust in Progressive Vote Counting During the 2024 U.S. Election* (CHI 2026;
308 participantes, dashboard ao vivo com dados reais da AP).

**Princípio.** O texto divide o trabalho com a codificação visual: o **título afirma a conclusão**
(não descreve o eixo), a legenda diz o que está sendo medido, a nota carrega premissa e método, e
a anotação orienta a leitura. O estudo do dashboard ao vivo de 2024 mostra o caso mais duro: o que
protege a confiança quando um número se mexe é **explicação em texto de por que ele se mexeu** —
qual processo, qual evento, o que ainda falta entrar na conta. Número que muda sem explicação é
combustível de desconfiança.

**Neste produto:** cada módulo ganha uma manchete que conclui em pt-BR chão
(*"Lula está à frente, mas a eleição ainda pode virar"*) e uma linha única de "o que isso quer
dizer". E toda variação passa a ser narrada: quando uma pesquisa nova entra e a probabilidade se
move, o produto diz **qual pesquisa entrou e para que lado puxou** — no lugar do parágrafo de 90
palavras da v1, que explicava o modelo mas nunca explicava a *mudança*.

---

### P3 — Linguagem simples não é tom de voz: é requisito de público e política pública

**Fontes:** Lei 15.263/2025 — Política Nacional de Linguagem Simples (noticiário do Senado
Federal e da CAPES) · INAF 2024 — Indicador de Alfabetismo Funcional (Fundação Itaú / Agência
Brasil): **29% dos brasileiros de 15 a 64 anos** em analfabetismo funcional, sem recuo em seis
anos · *Guia de Linguagem Simples* Icict/Fiocruz (PDF aberto) · Microsoft Research — *UIs for
Low-Literate Users* (>700h de campo, 570 participantes de baixa renda/baixo letramento).

**Princípio.** Frases curtas, voz ativa, informação mais importante primeiro (pirâmide
invertida), zero jargão não explicado, número sempre contextualizado, e **validação com usuário
real** — não com a intuição do time. Para leitor de baixo letramento, a decodificação de rótulo
compete com a compreensão do conteúdo: cada caractere difícil de ler é orçamento cognitivo tirado
do entendimento.

**Neste produto:** proibido rótulo em caixa-alta monoespaçada (v1) — ele custa velocidade de
leitura exatamente ao público que acabamos de incluir. O **glossário para leigos** deixa de ser
página separada e vira **inline**: `margem de erro`, `2º turno`, `voto válido`, `peso da
pesquisa`, `empate técnico` aparecem sublinhados no corpo do texto e abrem uma definição de uma
frase + um exemplo numérico concreto. Meta editorial de frase: uma ideia por frase, e nenhum
parágrafo de manchete acima de ~40 palavras.

---

### P4 — A incerteza ocupa área. Barra com bigodinho mente

**Fontes:** Correll & Gleicher (2014), *within-the-bar bias* — leitores julgam valores **dentro**
da barra como mais prováveis que valores fora, mesmo com barra de erro desenhada (citado e
aplicado na Datawrapper Academy) · Datawrapper Academy — *How to show confidence intervals in
Datawrapper line/bar/column charts* · Padilla, Kay & Hullman — capítulo *Uncertainty
Visualization* (Handbook of Computational Statistics and Data Science).

**Princípio.** Incerteza acoplada a uma barra é lida errado por vício perceptual conhecido: a
barra afirma, o bigode sussurra, e o leitor acredita na barra. Se a incerteza é a mensagem, ela
tem de ser a **forma principal** — uma faixa, uma nuvem, uma área que o olho lê antes da linha
central — e não um enfeite sobreposto a uma forma que já comunicou certeza.

**Neste produto:** o gráfico de evolução vira **faixa de incerteza como forma dominante**, com a
média ponderada como linha discreta *dentro* dela. `empate técnico` deixa de ser badge de texto na
**tabela de pesquisas** e passa a ser o que de fato é: **sobreposição visível** entre as duas
faixas naquela linha. E a barra dupla 83/17 do hero morre — ela é a materialização do
*within-the-bar bias* aplicada à manchete do produto (o data-scientist tem veto aqui, conforme o
briefing).

---

### P5 — Gráfico de evolução: hierarquia por peso, eventos anotados, eixo nomeado em palavras

**Fontes:** Datawrapper — *Fix my chart: Presidential approval ratings* (Gregor Aisch, mar/2026):
colorir as linhas em vez do fundo, tirar opacidade dos pontos brutos e engrossar a média, rotular
diretamente no gráfico, restaurar anotações de eventos históricos, e **não usar cor sem
significado particular** · Datawrapper — *Fix my chart: The y-axis*: rotular a linha de base **em
palavras**, não só em números, e repetir o mesmo símbolo/formato no eixo e no tooltip.

**Princípio.** Num gráfico de série de pesquisas há duas camadas com pesos diferentes: pontos
brutos (evidência, ruidosa) e média ponderada (leitura, estável). A hierarquia se faz por
**espessura e opacidade**, não por mais cores. Eventos ganham anotação. E toda linha de referência
tem de dizer o que significa em português.

**Neste produto:** o eixo do **gráfico de evolução** deixa de ser `30 · 35 · 40 · 45 · 50 · 55`
mudo — a linha de 50 passa a se chamar **"empate"**, e o intervalo mostrado é justificado no
próprio gráfico em vez de ser um recorte silencioso. Pontos de pesquisa recuam; a faixa e a média
lideram. Cada instituto é rotulado no ponto quando couber, em vez de exigir tooltip — tooltip em
celular barato é uma aposta, não uma interface.

---

### P6 — Cor: marca em família neutra terceira; par de candidatos que sobrevive ao daltonismo e ao P&B

**Fontes:** paleta Wong e guias de cor acessível para dataviz (Tableau, *Data Visualisation
Guide* do data.europa.eu — "se usar outras combinações, garanta que variem em **luminosidade**")
· Adrian Roselli — *WCAG3 Contrast as of April 2026*: o algoritmo de contraste do WCAG 3 segue
"a ser determinado"; APCA saiu do rascunho em 2023 e **não é norma**; WCAG 2.2 AA continua sendo o
baseline operacional e legal · Vercel Geist — "high contrast, accessible color system".

**Princípio.** Vermelho × azul em luminosidades parecidas é um risco real: deuteranopia e
protanopia somam ~8% dos homens, e o par colapsa. A separação tem de existir em **luminosidade**
(sobrevive ao print P&B e ao filtro de daltonismo) e a informação nunca pode depender **só** de
cor. E contraste se **calcula com a matemática do WCAG 2 AA**, que é o que audita e o que a lei
cobra; APCA pode informar o julgamento estético, jamais substituir o número de conformidade.

**Neste produto:** a cor de marca é uma **família cromática terceira e neutra** — vermelho e azul
são propriedade exclusiva dos dois candidatos **nos dados** (R4), recalibrados para ter ΔL
significativo entre si. Em toda superfície onde o candidato aparece (hero, evolução, tabela,
sliders) a cor vem **acompanhada de rótulo ou posição fixa**, nunca sozinha. Todo par
texto/fundo em `tokens.css` nasce com o número de contraste WCAG 2 calculado e anotado — sem
"parece que dá".

---

### P7 — Tipografia de leitura, não de painel de controle

**Fontes:** siteinspire — as tags dominantes do acervo curado são *Typographic* (2.084),
*Minimal* (742) e *Grid Layout* (651), acima de qualquer categoria de efeito · levantamento de
tipografia 2026: eixo de **optical size** em fontes variáveis (ajusta contraste de haste e
espacejamento por tamanho), e grotescas de leitura longa em contexto editorial · estudo da
linguagem visual da Stripe: peso leve mesmo em display, **tracking que fecha conforme o corpo
cresce**, e contagem de tokens deliberadamente curta.

**Princípio.** Uma família variável bem escolhida, com eixo óptico, resolve display e corpo sem
virar zoológico. Corpo de texto tem de ser de **leitura**, não de dashboard. Monoespaçada só
sobrevive onde presta serviço real: **numerais tabulares** em coluna.

**Neste produto:** o par `Archivo + IBM Plex Mono` como identidade está banido e não volta em
outra roupa. O corpo de texto sobe do ~13px da v1 para um tamanho de leitura de verdade a 390px;
o número-manchete usa o extremo superior do eixo óptico com tracking fechado; a **tabela de
pesquisas** usa `tabular-nums` da *mesma* família (colunas alinham sem trocar de tipo). O cursor
`▊` não existe mais em superfície nenhuma.

---

### P8 — Craft de execução vem de Linear/Vercel/Stripe. Estética de Awwwards, não

**Fontes:** Awwwards — lista de *Sites of the Day* consultada em 03/08/2026 (Lacoste Ace Breaker,
Hearst Exhibit 2026, Noomo Showcase, 2xA Studio, CIAO ENERGY…): domínio de showcase de estúdio com
Three.js/WebGL/GSAP · Emil Kowalski (time Web da Linear) — *Great Animations*: abaixo de 300ms,
`ease-out` para entrada, **só `transform` e `opacity`** (as demais propriedades disparam layout e
paint), animação **interrompível**, `prefers-reduced-motion` respeitado, e **nunca animar ação
iniciada por teclado** · Rauno Freiberg (Staff Design Engineer, Vercel) em entrevista na ui.land:
prototipar direto em código porque "muito do detalhe só nasce na implementação" · Vercel Geist:
presets de raio, preenchimento, traço e sombra.

**Princípio.** Essas duas coisas são separáveis e é obrigatório separá-las. De Linear/Vercel/
Stripe se importa o **padrão de acabamento**: estados de hover/focus/pressed/disabled/loading
desenhados um a um, transições interrompíveis, orçamento de motion apertado, número de tokens
pequeno. Do circuito de premiação **não** se importa o gênero — hero 3D, scroll sequestrado,
spectacle — que é feito para um júri em desktop, não para um eleitor num Android de entrada.

**Neste produto:** os **sliders de premissas** ganham press/drag/focus reais e resposta em
150–220ms `ease-out`, com o resultado recalculando sem *jank*; o campo contável do hero anima só
por `opacity`/`transform`; nada de scroll-jacking em página cuja função é ser lida em 20 segundos;
tudo que for decorativo desliga em `prefers-reduced-motion` — e o que não puder desligar é porque
não deveria existir.

---

### P9 — Performance é acessibilidade quando o público está num Android barato

**Fontes:** web.dev — INP como Core Web Vital, meta de **≤200ms no p75**; a atualização de 2026
manteve os limiares (LCP 2,5s / INP 200ms / CLS 0,1) e apertou a metodologia de medição em páginas
com muita interação · Google *Next Billion Users* e Microsoft Research — restrições reais de
aparelho, armazenamento e conectividade intermitente do público de baixa renda.

**Princípio.** O p75 obriga a projetar para o **pior caso razoável**, não para o aparelho do time
de design. Em Android médio/baixo, com main thread ocupada por parse de JS e overhead de
framework, 200ms de INP é difícil — e se torna impossível se um gráfico interativo for condição
para ver o número principal.

**Neste produto:** o **hero de probabilidade** renderiza em HTML do servidor (já é convenção do
repo) e não depende de biblioteca de gráfico; Recharts fica confinado ao **gráfico de evolução**,
carregado abaixo da dobra; os **sliders** fazem *debounce* do recálculo para manter a interação
abaixo de 200ms; webfont nunca bloqueia a pintura do número-manchete. Regra prática: se um
elemento visual custa mais orçamento de rede/CPU do que informa, ele não entra.

---

### P10 — Bottom sheet é o container de detalhe no celular; alvo de toque é medida, não estimativa

**Fontes:** levantamentos de padrão de UI móvel 2026 a partir de acervos tipo Mobbin: o **bottom
sheet** (painel arrastável ancorado na base) virou o container esperado para conteúdo secundário —
filtros, detalhe, confirmação, compartilhamento — enquanto FAB empilhado perde terreno para ação
integrada à barra · WCAG 2.2 SC **2.5.8 Target Size (Minimum)**, nível AA: alvo mínimo **24×24
px CSS** (ou 24px de espaçamento entre alvos), com 44×44 recomendado para ação primária em toque.

**Princípio.** Em tela pequena, densidade se resolve por **camada**, não por redução de corpo de
texto. O que não cabe legível vai para uma folha inferior que o polegar abre e fecha — e todo
alvo tocável é medido, não estimado.

**Neste produto:** cada linha da **tabela de pesquisas** deixa de espremer oito linhas de
microtipo (instituto, peso, campo, 1º turno, n, margem, registro TSE) e passa a abrir um **bottom
sheet** com o registro completo, incluindo registro TSE e link da fonte — que R4 exige que estejam
sempre acessíveis, não que estejam sempre *espremidos*. O **glossário** usa exatamente o mesmo
container: termo sublinhado → folha inferior → definição em uma frase. Sliders e abas
(`1º turno` / `2º turno`) respeitam 44px na área tocável.

---

### P11 — Simulação é participação — desde que rotulada, reversível e narrada na mesma língua do hero

**Fontes:** Observable — *What Data Teams Can Learn from Journalists About Data Visualization*:
**localizar/personalizar** a tendência agregada é o que faz ela importar para alguém ·
The Pudding (índice de ensaios jun–jul/2026): arquivos pesquisáveis, jogos e artefatos que
transformam leitor em participante · Marco Hernandez, *2025: the year in graphics*: formato
escolhido por história (swipe story, reconstrução 3D, diagrama animado), não por moda.

**Princípio.** Um agregador nacional é impessoal por natureza; a alavanca de engajamento honesta é
deixar a pessoa **testar a premissa dela** e ver o resultado. Mas participação sem rótulo vira
desinformação: a saída da simulação precisa ser inconfundivelmente distinta do dado oficial e
sempre a um toque de voltar.

**Neste produto:** os **sliders de premissas** são o dispositivo de participação (R5: estado local
rotulado "simulação", nunca tocam a base). Duas exigências de design: (1) o resultado da simulação
é expresso **na mesma linguagem de frequência do hero** — *"nesta simulação, 62 em 100"* — para o
leitor comparar maçã com maçã; (2) existe marcação persistente de "simulação" e um **reset de um
toque**, visível sem rolagem, para que ninguém saia de lá achando que viu o número oficial.

---

### P12 — Um elemento-assinatura, ancorado no assunto, prototipado em código a 390px

**Fontes:** Awwwards — o júri avalia fundamento (semântica, responsividade, performance) junto com
o impacto, não só o efeito · Rauno Freiberg (ui.land): prototipar cedo em código e compartilhar
"vídeos e demos minúsculos" para validar direção, tratando código exploratório como descartável ·
Marco Hernandez: o diferencial está no **conceito e na colaboração**, com o formato subordinado à
história.

**Princípio.** Identidade de produto de dados não vem de invólucro estilístico — vem de **uma
forma de visualização própria, derivada do assunto**, que a pessoa reconhece e compartilha. E ela
nasce no menor viewport: se o conceito só funciona a 1440px, ele não é o conceito.

**Neste produto:** o elemento-assinatura é o **campo de resultados contáveis** do P1 — ancorado no
que o produto realmente é (probabilidade entre dois candidatos, com tempo até a eleição). Ele tem
de existir em três escalas: **hero** (grande, contável, com manchete que conclui), **inline**
(marcador de dispersão na tabela de pesquisas), **resultado de simulação** (saída dos sliders).
Ordem de trabalho da Fase 2: protótipo em código a 390px primeiro, num aparelho lento, antes de
qualquer decisão de paleta ou de escala tipográfica — e é esse print de 390px que decide se o
conceito vive.

---

## 3 tendências que vamos IGNORAR conscientemente

### 1. Web imersiva 3D/WebGL como camada primária de renderização (+ gamificação)

**Onde aparece:** Awwwards — o acervo de *Sites of the Day* consultado em 03/08/2026 é dominado
por showcase de estúdio em Three.js/WebGL/GSAP, e a leitura de mercado corrente atribui a maioria
dos SOTD de 2026 a experiências 3D imersivas; Figma, *Web design trends* (Resource Library), lista
"3D and Immersive Elements" e "Gamified Design" entre as tendências de 2026.

**Por que ignorar:** custa exatamente o orçamento que o nosso público não tem — CPU de aparelho
barato, dados móveis, INP (P9) — e **não carrega um bit de informação** sobre probabilidade
eleitoral. Pior: espetáculo é o registro errado para um produto cuja moeda é credibilidade e
neutralidade (R4). Gamificação (pontos, badges, progresso) é ainda mais tóxica aqui, porque
transforma uma disputa eleitoral real em placar — o mesmo erro perceptual que a barra 83/17 da v1
já cometia (P4). Do circuito de premiação levamos o rigor de fundamento; não levamos o gênero.

### 2. Dark mode como padrão / "dark mode dominance"

**Onde aparece:** Figma, *Web design trends* (Resource Library), item "Dark Mode", justificado por
fadiga ocular, bateria OLED e personalização; repetido em praticamente todo levantamento de
tendência mobile de 2026.

**Por que ignorar:** já é cláusula banida do repo ("dark mode sem justificativa"), e há razão
técnica além da regra. Adrian Roselli (*WCAG3 Contrast as of April 2026*) confirma que o
algoritmo de contraste do WCAG 3 segue indefinido e que APCA não é norma — ou seja, a matemática
do WCAG 2 continua sendo o que audita, e ela é reconhecidamente pouco confiável para polaridade
escura. Fabricar um segundo tema significa dobrar a superfície de contraste **usando a fórmula
menos confiável para metade dela**, num produto onde a cor dos dois candidatos precisa continuar
distinguível (P6). Benefício de bateria OLED é irrelevante para o parque de aparelhos LCD baratos
que acabamos de assumir como público. Tema escuro só entra se algum dia houver caso de uso
declarado *e* contraste calculado nos dois modos — nunca como gesto de estilo.

### 3. Maximalismo / neo-brutalismo / "dopamine design" saturado / neumorfismo (+ tipografia cinética)

**Onde aparece:** Figma, *Web design trends* (Resource Library), itens "Maximalism", "Neo-Brutalism
/ Anti-Design", "Vibrant Color Palettes" (atribuídas a nostalgia Y2K e dopamine design),
"Neumorphism" ("soft shadows and subtle gradients") e "Bold Typography" levada "beyond legibility
into storytelling".

**Por que ignorar:** neste produto **só duas cores têm direito a significar** — a de cada
candidato (R4/P6). Qualquer paleta saturada decorativa entra em competição direta com a única
codificação que precisa ser inequívoca, e o leitor perde a âncora. Neumorfismo é, na prática, a
família de sombras suaves e gradientes que o repo já bane junto com glassmorphism, e a própria
referência de craft que adotamos vai no sentido oposto (na Stripe, profundidade vem de tinta de
fundo, não de elevação empilhada). "Tipografia além da legibilidade" é uma troca que podemos
fazer com um público de designers e não podemos fazer com 29% de analfabetismo funcional na sala
(P3): aqui legibilidade **é** a narrativa. Restrição cromática e tipográfica não é timidez — é a
condição para o dado ser lido.

---

## Fontes efetivamente abertas

**Lidas na íntegra (página/PDF buscado e processado):**

- Awwwards — *Websites / Sites of the Day*: https://www.awwwards.com/websites/ (consulta 03/08/2026)
- siteinspire: https://www.siteinspire.com/
- Figma Resource Library — *Web design trends*: https://www.figma.com/resource-library/web-design-trends/
- Datawrapper Blog — índice de posts: https://www.datawrapper.de/blog/posts
- Datawrapper — *Fix my chart: Presidential approval ratings*: https://www.datawrapper.de/blog/fix-my-chart-approval-ratings
- Datawrapper — *Fix my chart: The y-axis*: https://www.datawrapper.de/blog/fix-my-chart-y-axis
- Datawrapper — *Fix my chart: Using text elements*: https://www.datawrapper.de/blog/fix-my-chart-text-elements
- The Pudding — índice de ensaios: https://pudding.cool/
- Mu Collective (Northwestern) — publicações: https://mucollective.northwestern.edu/
- Matthew Kay et al. — *Uncertainty Displays Using Quantile Dotplots or CDFs Improve Transit Decision-Making* (CHI 2018), PDF: https://www.mjskay.com/papers/chi2018-uncertain-bus-decisions.pdf
- Emil Kowalski — *Great Animations*: https://emilkowal.ski/ui/great-animations
- Rauno Freiberg — entrevista na ui.land: https://ui.land/interviews/rauno-freiberg
- Vercel — *Geist Design System, Introduction*: https://vercel.com/geist/introduction
- Observable — blog (índice): https://observablehq.com/blog
- Observable — *What Data Teams Can Learn from Journalists About Data Visualization*: https://observablehq.com/blog/what-data-teams-can-learn-from-journalists-about-data-visualization
- Adrian Roselli — *WCAG3 Contrast as of April 2026*: https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html
- Marco Hernandez — *2025: the year in graphics*: https://mhinfographics.com/2025/12/03/2025-the-year-in-graphics/
- Icict/Fiocruz — *Guia de Linguagem Simples* (PDF): https://www.ufsm.br/app/uploads/sites/341/2024/10/guia-de-linguagem-simples.pdf
- Reuters Institute — *Visual storytelling on mobile phones* (página de apresentação da pesquisa): https://reutersinstitute.politics.ox.ac.uk/news/visual-storytelling-mobile-phones
- BU College of Communication — *The Backstory to "Swaying the Public": Design Chronicle of Election Forecast Visualizations*: https://www.bu.edu/com/research/design-chronicle-of-election-forecast-visualizations/
- Interface Craft (Emil Kowalski): https://www.interfacecraft.dev/ — só material institucional; conteúdo é fechado a membros

**Conhecidas por resumo de busca, não por leitura da íntegra** (a ACM DL respondeu **403**;
registrar aqui para que a Fase 2 não trate como leitura primária):

- Yang, Mortenson, Nisbet, Diakopoulos, Kay — *In Dice We Trust* (CHI 2024, Best Paper),
  `10.1145/3613904.3642371` — quatro displays de incerteza + correção de probabilidade subjetiva;
  resumo em texto e quantile dotplot sustentam mais confiança ao longo do tempo
- Cai, Wang, Mortenson, Yang, Nisbet, Kay — *Through a Live Elections Dashboard, Darkly*
  (CHI 2026), `10.1145/3772318.3793385` — 308 participantes, dashboard ao vivo com dados da AP
- Correll & Gleicher (2014) — *within-the-bar bias* (via Datawrapper Academy)
- Lei 15.263/2025, Política Nacional de Linguagem Simples (noticiário Senado/CAPES)
- INAF 2024 — 29% de analfabetismo funcional entre 15 e 64 anos (Fundação Itaú / Agência Brasil)
- WCAG 2.2 SC 2.5.8 *Target Size (Minimum)* — 24×24 px CSS mínimo, AA
- web.dev — INP ≤200ms no p75; limiares mantidos na atualização de 2026
- Google *Next Billion Users* / Microsoft Research *UIs for Low-Literate Users*
- Paleta Wong e guias de cor acessível para dataviz (Tableau, data.europa.eu)

**Tentadas e bloqueadas:** dl.acm.org (403 em página e fullHtml), godly.website (301 →
recent.design, 403), niemanlab.org (403), PDFs de linguagem simples do gov.br (binário ilegível
via fetch).

---

## O que a Fase 2 tem de entregar contra este documento

Checklist derivado, para o veredito do loop não virar opinião:

1. O hero comunica probabilidade em **formato contável** e não em barra de placar. (P1, P4)
2. Cada módulo tem **manchete que conclui**; mudança de número vem com explicação. (P2)
3. Nenhum termo técnico aparece sem **glossário a um toque**; zero caixa-alta monoespaçada. (P3, P7)
4. A incerteza é a **forma dominante** do gráfico de evolução; "empate técnico" é visto. (P4, P5)
5. Linha de 50% se chama "empate"; hierarquia por peso/opacidade, não por mais cor. (P5)
6. Marca em família **neutra terceira**; par de candidatos separado em luminosidade; contraste
   WCAG 2 AA **calculado e anotado** em `tokens.css`. (P6)
7. Corpo de texto em tamanho de leitura a 390px; mono só em numeral tabular. (P7)
8. Motion: `transform`/`opacity`, <300ms, interrompível, `prefers-reduced-motion`. (P8)
9. Número-manchete no HTML do servidor; INP p75 ≤200ms medido em aparelho lento. (P9)
10. Detalhe de pesquisa e glossário em **bottom sheet**; alvos ≥44px em ação primária. (P10)
11. Simulação inconfundível e com **reset de um toque**, expressa em frequência. (P11)
12. Existe **um** elemento-assinatura, nascido a 390px, presente em três escalas. (P12)

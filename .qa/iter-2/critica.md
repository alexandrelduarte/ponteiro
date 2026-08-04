# Crítica — iteração 2

Base: 30 PNGs de `.qa/iter-2/`, lidos um a um nos três viewports (390×844, 768×1024, 1440×900),
mais recortes em resolução plena e amostragem de pixel (PIL) extraídos dos full-page. Onde afirmo
uma cor, um tamanho ou uma sobreposição, o valor medido está no item. Gates automáticos (139 unit,
21 e2e com console limpo, axe zero, Lighthouse 94/100/100/100, CLS 0) não são re-julgados aqui.

Os gráficos **estão pintados** nesta rodada — o artefato de captura da iteração 1 caiu, o critério 5
foi auditado de fato, e a aba "Todos os candidatos" foi capturada nos três viewports. As três
descobertas mais graves desta iteração vêm exatamente dessas duas áreas que antes não podiam ser
vistas.

## Itens

[MAJOR] `home-1440-graficos.png`, `home-768-graficos.png` e `home-390-full.png` (y≈2150–2178) —
critério 5 (gráficos legíveis) — **o último tick do eixo X da evolução está cortado ao meio do
glifo nos três viewports**: "06/08" renderiza como `06/0` + a metade esquerda do `8` (zoom
nearest-neighbour em `tick1440_x.png`/`tick390_x.png`: o glifo tem a haste esquerda e as três
barras horizontais, sem haste direita; um `8` íntegro do mesmo corpo aparece em `BR-07845/2026` na
mesma página). Não é o cartão que corta: a 1440 o texto vai de x=658 a x=690 e a borda do cartão
está em x=711 — quem corta é o próprio `<svg>` do ResponsiveContainer, cujo viewport termina em
x≈691. É a data mais recente da série — a ponta "hoje" do gráfico que ancora a página inteira — e
o leitor vê um caractere quebrado, que lê como bug de renderização, não como design. Reservar
margem direita no `<XAxis>` (`padding`/`tickMargin`) ou ancorar o último tick à direita.

[MAJOR] `home-390-full.png` (y≈7786–7804) e `home-390-sensibilidade.png` — critério 5 (ticks e
legendas sem colisão a 390px) — **as anotações do topo da curva de sensibilidade se sobrepõem**:
"réplica 2022" e "teste-limite +6,3" ocupam os mesmos pixels — o `2` final de `2022` e o `t`
inicial de `teste` se fundem, e a varredura de colunas de 169px a 310px não encontra nenhum
intervalo em branco entre os dois rótulos (contra 12px de folga entre "sem viés" e "réplica").
Lido em varredura sai `réplica 202₂este-limite +6,3`. Em 768 e 1440 os mesmos três rótulos ficam
folgados — 390 é a largura quebrada, e 390 é o viewport primário (§1). É a legenda que nomeia os
três cenários clicáveis do gráfico mais interativo da página (§7.8). Encurtar os rótulos abaixo de
`sm`, alternar altura, ou mover as três marcações para a legenda textual que já existe abaixo do
gráfico.

[MAJOR] `home-1440-candidatos.png` (y≈1288–1300), `home-768-candidatos.png` e
`home-390-candidatos.png` (tabela cruzada "CANDIDATO × instituto") — critério 11 (microcopy) + P9
(rastreabilidade) — **os nomes dos institutos no cabeçalho estão truncados em 7 caracteres, sem
reticências, nos três viewports**: `PODERDA`, `ATLASIN`, `DATAFOL`, `GENIAL` (contra `NEXUS`,
`GERP`, `INDEXA`, que cabem inteiros por terem ≤6 letras). Não é falta de espaço: a 1440 as
colunas ficam a ~100px uma da outra e "PODERDA" termina em x≈490 com a coluna seguinte só em
x=553 — sobram ~60px livres. É corte fixo de string, não responsividade. O instituto **é** a
procedência do número (P9: "instituto é o link para a fonte"), e sai como palavra mutilada em toda
a matriz que sustenta a aba de 9 candidatos. Ou publicar o nome inteiro, ou abreviar de propósito
(`PoderD.`, `Atlas`, `Datafolha`), nunca fatiar no meio.

[MAJOR] `home-390-full.png` (bloco cenário-base, y≈10480–10520), `home-1440-full.png` (y≈5000–5090),
`home-390-urna.png` (veredito) e `home-1440-graficos.png` (mini-cartões) — critério 2 (mono só
para dados) — **item da iteração 1 declarado corrigido e inalterado**. A regra do §4.1 ("se o
conteúdo muda quando o modelo recalcula, é mono") continua aplicada token a token:

- No mesmo bloco cenário-base, o título imprime `PROBABILIDADE COMBINADA: 83%` com o **83% em IBM
  Plex Mono** e a nota imediatamente abaixo imprime "Um cenário com **17%** de probabilidade
  contrária acontece, no longo prazo, **1 vez a cada 6** eleições parecidas" **em Archivo**. É o
  par complementar da mesma probabilidade, a 40px de distância, em duas famílias.
- No veredito da urna, "92%", "8%" e "25/10" saem em Archivo; `≈46,0%` no cartão do 1ºT sai em
  mono — os dois recalculam igual.
- Dentro de **uma única frase** ("Por que este é o cenário-base"), "6 dos 7 institutos" sai em
  Archivo e `+4,7 p.p.` sai em mono.
- Os mini-cartões (`6%`, `8%`, `88%`, `82%`) e os contadores do cabeçalho (`62`, `83`) saem em
  Archivo Black, contra §7.4 ("número em `text-dado` **mono**") e §4.2, que dimensiona `text-dado`
  justamente para "número de mini-cartão e contador do cabeçalho" — enquanto os rótulos desses
  mesmos blocos (`dias p/ 1º turno 04/10`) estão em mono. A regra está literalmente invertida
  nesses dois componentes.
- Nos gráficos, os ticks estão em mono (correto), mas todas as anotações — `0 · virada`,
  `virada (+4,7)`, `sem viés`, `réplica 2022`, `teste-limite +6,3`, `Lula vence (82%)` — saem em
  Archivo, contra §4.1 ("ticks e tooltips de gráfico" em mono).

§11 pede "Todo dado numérico em IBM Plex Mono". Escolher um lado e aplicar — mas o mínimo
inegociável é o par 83%/17% do cenário-base sair na mesma família.

[MINOR] `home-768-full.png` (y≈6740–7620) e `home-768-tabela.png` — critério 4 + §11/R4 — a série
de pesquisas **não estoura mais a página** (canvas do full-page agora é 768×8465, contra 858 na
iteração 1; nenhum pixel de conteúdo além de x=752) e ganhou afordância de rolagem — há um
esmaecimento medido de x=720 (228,228,221) a x=730 (176,176,167) no limite direito do wrapper. O
BLOCKER está resolvido. **Resta**: no estado inicial, em 768, o cabeçalho aparece como `REGIS` e o
registro como `BR-07…` em **todas as 13 linhas**, e a coluna do `×` fica fora da área visível. O
§7.5 autoriza `overflow-x:auto` no wrapper, então isso não é mais violação de spec — mas 768 é o
retrato de iPad, é a largura em que a spec manda "tabela completa voltar", e o leitor encontra o
dado obrigatório de P9 cortado no meio da string por padrão. Reduzir a densidade de colunas entre
768 e ~900px (ou esconder `n`/`±MoE` nessa faixa) entrega a mesma tabela sem gesto.

[MINOR] `home-1440-sensibilidade.png` (y≈762–900) e `home-768-sensibilidade.png` (y≈196–400) —
critério 7 (ritmo) — **os três cartões de cenário têm o conteúdo centrado verticalmente**, então
os títulos e as linhas `viés +X,X ⟶ NN%×NN%` — o dado que existe para ser comparado entre os três
— ficam escalonados: a 1440 os títulos começam em y=815 / 798 / 780 e as linhas de viés em y=838 /
821 / 802 (**36px de degrau**); a 768, títulos em y=241 / 225 / 208 (**33px**). São irmãos de
grade, de mesma altura, com a mesma estrutura interna: o olho não consegue varrer a linha dos três
viéses. Alinhar o conteúdo ao topo (`items-start`) e deixar a folga sobrar embaixo.

[MINOR] `home-390-candidatos.png` (y≈1000–1200) — critério 12 (neutralidade lado a lado) + §5.1 —
o selo `● disputa principal` cabe na linha do nome para **Lula** e quebra para **Flávio**: o `●`
fica órfão no fim da linha 1 (depois de "(PL)") e as palavras "disputa principal" descem sozinhas
para a linha 2, deixando as duas fileiras do topo com estruturas diferentes no único bloco em que
os nove candidatos aparecem lado a lado. É a mesma classe de defeito do par "Lula × Flávio"
partido que foi corrigido nos cartões: glifo separado do rótulo a que pertence. Em 768 e 1440 não
acontece. Tornar o selo inquebrável (`white-space: nowrap`) ou movê-lo para linha própria nos dois
lados.

[MINOR] `home-390-full.png` (y≈7860–7970), idem em 768 e 1440 — critério 5 — **as anotações de
dentro da área de plotagem não têm halo e são atravessadas pelos traços**: a 390, o rótulo
`virada (+4,7)` é cortado pela curva azul (nas letras "vi") e pela vermelha (no "7)"); e
`◆ atual` é atravessado pela própria linha verde do viés atual, que passa entre o "a" e o "tual",
nos três viewports (medido a 1440: rótulo x≈479–513, linha em x=495). Ambos continuam legíveis,
mas são os dois rótulos que dão sentido ao gráfico (§7.8: "O ponto de virada e a linha ◆ atual
ganham rótulo textual"). Deslocar o rótulo para fora do cruzamento ou dar `paint-order: stroke`
com contorno na cor do papel.

[NIT] `home-1440-candidatos.png` / `home-390-candidatos.png` (as 9 barras) — §5.5 — o contorno
exigido em `--color-linha-forte` existe **só como tampa direita** da barra: medido, o último pixel
de cada preenchimento é `#727267` (114,114,103 — correto), mas as arestas superior e inferior são
a borda do trilho em `--color-linha` `#C6C6B8` (1,59:1 sobre cartão, classificada no §5.4 como
"filete **decorativo** apenas"). Dos 9 preenchimentos, só Zema `#E8791D` fica abaixo do piso de
3:1 (**2,53:1** contra o trilho `#EFEFE6`, calculado); como a tampa delimita a extensão da barra —
que é a dimensão que carrega o dado — o efeito prático é nulo. Fechar o contorno resolve o §5.5 ao
pé da letra. Registrado como NIT de propósito: sozinho não justifica reabrir o loop.

[NIT] `home-390-full.png` (y≈7000–7100) e `home-1440-sensibilidade.png` (bloco "Por que o erro do
1º turno importa AGORA") — §4.3 — "AGORA" em caixa alta como ênfase dentro de um título em caixa
normal (mesmo padrão do "CALIBRADO" corrigido nesta rodada), e os dois parágrafos seguintes
carregam 4+ trechos em negrito cada um ("As pesquisas que alimentam este painel hoje ainda não
passaram por calibragem nenhuma" tem 11 palavras em negrito), contra "negrito reservado a números
e a ~3 palavras por parágrafo".

[NIT] `home-1440-full.png` (y≈1150–1660) — critério 7 — o cartão "DISTRIBUIÇÃO PROJETADA…" termina
o conteúdo ~110px antes da base porque a grade o estica até a altura do cartão "EVOLUÇÃO". É o
mesmo efeito que foi corrigido no bloco REPLAY (onde os cartões passaram a dimensionar por
conteúdo); sobrou aqui e nos cartões de "CONTEXTO SOCIAL" em 768.

## Veredito

**BLOCKER 0 · MAJOR 4 · MINOR 4 · NIT 3** — 11 itens.

O loop **não pode fechar** nesta iteração, por duas razões:

1. **O critério 5, auditado pela primeira vez, reprova em dois pontos.** Um rótulo de data cortado
   ao meio do glifo nos três viewports (a ponta "hoje" da série) e duas anotações sobrepostas a
   390px na curva que a página pede para o leitor tocar. Nenhum dos dois é estética: são texto
   ilegível ou mutilado dentro do gráfico.
2. **Dois defeitos de dado com cara de bug**: os nomes de instituto fatiados em 7 caracteres
   (`PODERDA`, `ATLASIN`, `DATAFOL`) na tabela cruzada da aba de candidatos, nos três viewports e
   com espaço sobrando; e a regra mono/Archivo, apontada na iteração 1 e declarada corrigida, que
   segue imprimindo `83%` em mono e `17%` em Archivo dentro do mesmo bloco.

### Estado dos 27 itens da iteração 1

**Corrigidos (25).** Os dois BLOCKERs: o histórico de erros virou cartões a 390 com URNA /
PESQUISAS DE VÉSPERA / **ERRO** completos; e a série parou de estourar a página em 768 (canvas
exatamente 768, com esmaecimento de rolagem no wrapper) — restou o corte do registro dentro do
wrapper, rebaixado a MINOR acima. Os sete MAJORs: gráficos agora renderizam; `Lula 46,0% × Flávio
43,0%` em linha única nos 13 cartões a 390; cabeçalho da urna empilhado em 768 sem colisão;
rótulos do REPLAY em 2 linhas simétricas com os placares alinhados no mesmo y; os quatro rótulos
de seção viraram etiqueta curta + frase em caixa normal; filete do cartão do 2ºT medido em
`#181C18` (tinta) a 390/768/1440; thumb medido em **24×24px** (altura 523–546 em
`home-390-parametros.png`). Os MINORs: barra e numerais da urna agora centrados no mesmo eixo
(desvio de 1,5px na linha principal e 1px na secundária, contra 21px antes); selo de frescor sem
redundância (o subtítulo largou a data e o selo ganhou "última pesquisa incluída em 28/07");
`(04–25/10,` inquebrável; ponto final assimétrico da legenda removido; linhas de peso baixo
esmaecidas — não por `opacity-55`, mas trocando tinta/`-escuro` por `--color-cinza` `#63685F`
(4,64:1), o que é **melhor** que a spec, já que `opacity-55` derrubaria o texto para ~3,5:1;
coluna de peso e chips em uma linha a 1440; lista de fontes da metodologia sem "·" iniciando linha
e com ritmo regular; mesma ordem das 13 pesquisas nos dois lugares; "≤ 2× **a** margem de erro" em
string única; aviso legal da metodologia alinhado à medida da prosa (232→1000); tick `0 · virada`
presente e eixo Y da evolução em 30–55 de 5 em 5; botão `×` fixo à direita da linha de metadados
em todos os 13 cartões; "Chance de Flávio vencer no 1º turno: **<1%**". Os cinco NITs:
"calibrado" em caixa baixa; contadores sem "·" iniciando linha; cartões do REPLAY dimensionados
por conteúdo (sem espaço morto); separadores tracejados dos sliders alinhados entre as colunas;
cartões vazios do `/historico` com o mesmo filete escuro nos dois.

**Não corrigidos (1).** A inconsistência mono/Archivo — inalterada em todos os pontos citados na
iteração 1, promovida a MAJOR por ter sido declarada resolvida.

**Corrigidos com resíduo (1).** A série em 768: o bloqueio (scroll horizontal de página) acabou;
o registro TSE cortado dentro do wrapper continua, agora como MINOR.

O que está sólido e **não** deve ser mexido: a primeira dobra a 390×844 continua entregando quem
lidera, com que chance e quão incerto sem scroll, agora com o par de linhas da urna alinhado; a
disciplina de identidade segue intacta (exatamente três blocos escuros, zero gradiente decorativo,
zero sombra difusa, zero ícone ilustrativo, zero imagem de pessoa ou partido); os rótulos das
bandas de margem comutam corretamente por clareza (amostrado: `#E8E8DF` sobre `#16418C` e
`#C4122F`, `#181C18` sobre `#D96A7A` e `#E8A4AE`); as setas de tendência usam
`--color-confirma-texto` `#155A34` e `--color-alerta-texto` `#8A4510`, e os chips idem — os usos
proibidos de texto do §5.5 não sobreviveram; o nome de todo candidato da aba "todos" está em
`--color-tinta`; abas (46px), botões (44px) e alternador de turno (44px) medidos acima do piso de
toque; e os quatro estados desenhados (vazio do `/historico`, esqueleto, erro, simulação) seguem
no lugar.

# Crítica — iteração 1

Base: 27 PNGs de `.qa/iter-1/`, lidos um a um nos três viewports, mais recortes em resolução
plena extraídos dos full-page para medição. Medições de pixel e amostragem de cor feitas com PIL;
onde afirmo uma cor ou um tamanho, o valor está no item. Gates automáticos (typecheck, lint, 139
unit, build, e2e 21/21, axe, Lighthouse) não são re-julgados aqui.

## Itens

[BLOCKER] `home-768-tabela.png` + `home-768-full.png` — critério 4 (tabelas a 390px / sem scroll
horizontal acidental) — a tabela "SÉRIE DE PESQUISAS" estoura o viewport em 768. O canvas do
full-page é **858×8385** contra viewport de 768 (390-full = 390, 1440-full = 1440, metodologia-768
= 768, historico-768 = 768: a home em 768 é a única anomalia), e a faixa x=768..858 é papel puro —
ou seja, 90px de scroll horizontal para lugar nenhum. Na dobra visível (`home-768-tabela.png`,
coluna mais à direita, y≈600–1020) o REGISTRO TSE aparece cortado no meio da string em **todas as
13 linhas** ("BR-07845/202", "BR-01489/202", "BR-08602/202"…) e a coluna do botão `×` fica
inteiramente fora da tela. Viola §11 "Nenhum scroll horizontal na página em 390 / 768 / 1140" e
§11/P9 "Registro TSE e fonte visíveis em todas as linhas/cartões da série". Conter a tabela no
wrapper `overflow-x:auto` do §7.5 (que hoje não está segurando o filho) ou reduzir a densidade de
colunas entre 768 e ~900px.

[BLOCKER] `home-390-full.png` (y≈5150–5850, bloco "HISTÓRICO DE ERROS DAS PESQUISAS (URNA ×
VÉSPERA) — E SE REPETIR EM 2026?") — critério 4 — esta tabela **não** virou cartões abaixo de md.
A 390 ela mantém as colunas e o conteúdo é cortado: o cabeçalho "PESQUISAS DE VÉSPERA" e as
células da 3ª coluna truncam no meio do caractere ("Datafolh", "institut", "PESQUISA"), e a 4ª
coluna — **ERRO**, que é a razão de existir da tabela (INVENTÁRIO §2 `HISTORICO_ERROS`: urna, pesq,
erro) — some por completo, sem nenhuma afordância visível de rolagem. Comparar com
`home-768-full.png` (coluna 2 do full-page), onde as 4 colunas aparecem. A série de pesquisas
ganhou o tratamento de cartões do §7.5; esta não ganhou nada.

[MAJOR] `home-390-graficos.png`, `home-390-sensibilidade.png`, `home-768-graficos.png`,
`home-768-sensibilidade.png`, `home-1440-sensibilidade.png` e as áreas de gráfico de
`home-390-full.png` / `home-768-full.png` — critério 5 (gráficos legíveis a 390px) — **todo
canvas de gráfico está pintado como retângulo cinza vazio**. Não é bug de produto: o mesmo gráfico
de sensibilidade aparece renderizado por inteiro (curvas, `virada (+4,7)`, `◆ atual`, eixos
−2…10 / 0%…75%) em `home-768-replay.png` e `home-1440-replay.png`, capturados depois na mesma
página — é artefato de captura (screenshot tirado antes do Recharts pintar). Consequência prática:
**o critério 5 e a checagem específica de colisão de ticks/legendas a 390px não podem ser
auditados nesta iteração**. Recapturar esperando o `<path>` do SVG existir antes do shot; sem isso
o item 5 não fecha.

[MAJOR] `home-390-tabela.png` (cartão PoderData, y≈530–580) e os 13 cartões equivalentes em
`home-390-full.png` — critério 12 (neutralidade lado a lado) + §7.5 — o par-manchete do cartão
quebra em duas linhas: **"Lula 46,0% × Flávio"** na linha 1 e **"43,0%"** na linha 2. O nome do
Flávio fica órfão do próprio número e os dois candidatos deixam de estar lado a lado — que é
exatamente o que o §7.5 desenha como uma única linha (`Lula 48,3%   ×   Flávio 43,6%`) e o que a
§5.1 chama de condição de credibilidade. Acontece em **todos** os cartões (PoderData, Nexus, Gerp,
Genial/Quaest, AtlasIntel, Datafolha…), não em um caso de nome longo. Reduzir o degrau do par no
cartão, ou virar duas linhas rotuladas simétricas — nunca separar um candidato do seu número.

[MAJOR] `home-768-urna.png` (cabeçalho da tela, y≈305–335) — critério 7 (ritmo) + 13 (identidade
disciplinada) — em 768 as duas frases do cabeçalho da urna quebram ao mesmo tempo dentro de um
`justify-between` e colidem: à esquerda "CHANCE DE SER ELEITO · LULA (ESQ.)" / "× FLÁVIO (DIR.)",
à direita "LEITURA DOS DADOS · NÃO É" / "PREVISÃO▊", com **~13px** entre "× FLÁVIO" e "LEITURA".
Lido em varredura, sai "…× FLÁVIO LEITURA DOS DADOS · NÃO É / (DIR.) PREVISÃO". Em 390
(`home-390-urna.png`) empilha limpo e em 1440 (`home-1440-urna.png`) cabe em uma linha cada — 768
é a largura quebrada. É o disclaimer central de P1/P3.

[MAJOR] `home-768-replay.png` (cartões 1 e 2 do bloco REPLAY 2022, y≈540–620) — critério 7 — os
rótulos estilhaçam em 768: "1º TURNO / · ERRO DO / 1ºT-2022 / APLICADO" (4 linhas) e "2º TURNO /
· ERRO / DO 2ºT- / 2022 / APLICADO" (5 linhas, com o token `2ºT-2022` partido no hífen). Como os
dois cartões ficam com contagens de linha diferentes, os placares desalinham: "45,0% × 42,5%"
assenta ~16px acima de "51,0% × 49,0%". Em 390 (`home-390-replay.png`) e 1440
(`home-1440-replay.png`) os mesmos rótulos ocupam 2 linhas. Reservar largura para o badge ou
quebrar rótulo/badge em linhas próprias abaixo de ~900px.

[MAJOR] `home-390-sensibilidade.png` (y≈390–450) e `home-390-parametros.png` (y≈400–440) —
critério 2 (hierarquia) + 11 (microcopy) — os rótulos de seção carregam frases inteiras, e uma
instrução, dentro do estilo de **etiqueta** (mono caixa alta `text-xs` com tracking). A 390 isso
vira bloco caixa-alta de 4 linhas ("CURVA DE SENSIBILIDADE — CHANCE DE SER ELEITO (DIA DA VOTAÇÃO)
CONFORME O VIÉS ASSUMIDO. TOQUE NA CURVA PARA APLICAR AQUELE VIÉS AO PAINEL:") e de 3 linhas
("PARÂMETROS DO MODELO (AJUSTE AS PREMISSAS) — CALIBRADOS PELO HISTÓRICO DE ERROS LOGO ABAIXO"),
imediatamente acima do gráfico mais interativo da página. O §4.3 dimensiona esse estilo para
rótulo, não para prosa; o §7.8 exige que a instrução esteja acima do gráfico, não que ela seja o
rótulo. Separar: etiqueta curta em caixa alta + a frase/instrução em `text-sm` caixa normal
logo abaixo. O mesmo padrão se repete em "CONTEXTO SOCIAL — INDICADORES MEDIDOS QUE SUSTENTAM A
LEITURA (NÃO É ACHISMO)" e "CENÁRIO-BASE — O DESFECHO MAIS PROVÁVEL SEGUNDO O MODELO (RECALCULA
COM SEUS PARÂMETROS)".

[MAJOR] `home-768-graficos.png` (filete de topo do cartão da direita, y≈26) e
`home-1440-graficos.png` (mesmo cartão) — critério 12 (neutralidade) — o cartão "2º TURNO · 25 DE
OUTUBRO (DISPUTA DECISIVA)" leva filete de 3px **em `#C4122F` (amostrado no pixel)**, que é
literalmente `--color-lula` em `tokens.css:54` ("marca (CORES.lula)"); o cartão do 1º turno leva
`#1E7A46` (`--color-confirma`, neutro). Varredura do full-page 1440: é a **única** régua larga em
cor de candidato na página e não existe espelho azul em lugar nenhum. §5.2 lista "filete de topo
de cartão" como uso de *marca*, e §11/R4 exige "Cada tratamento visual tem o espelho do outro
lado". Como o mesmo vermelho significa "Lula" em toda barra, linha e ponto da página, o cartão da
disputa decisiva lê como marcado por um dos lados. Trocar por um neutro (tinta/linha-forte) ou
dar ao 1ºT o espelho.

[MAJOR] `home-390-parametros.png` (thumb de "Meia-vida da recência", y≈495–514, x≈147–165) —
critério 6 (alvos de toque) — o thumb visível mede **19×20px**. O §7.7 exige "Thumb ≥ 24px de
diâmetro visível" e mira 44×44 de área de toque; 20px fica abaixo até do piso de 24×24 do WCAG 2.2
SC 2.5.8. Vale para os quatro sliders (mesma geometria em `home-768-parametros.png` e
`home-1440-parametros.png`). Como P10 declara os sliders **conteúdo editorial** e 390 é o viewport
primário, este é o principal gesto da página. axe não mede alvo — só a régua pega.

[MINOR] `home-1440-urna.png` — critério 2/7 — as duas linhas do elemento-assinatura usam
alinhamentos verticais diferentes. Medido: barra principal y 324–333 (centro **328,5**) contra os
numerais "83%/17%" em y 283–332 (centro **307,5**) → barra 21px baixa, assentada na linha de base;
barra secundária centro **400,5** contra "88%/12%" centro **398,5** → centrada. Mesmo componente,
duas regras; o desvio escala com o corpo do número e fica mais visível justamente em 1440.

[MINOR] `home-390-urna.png` (y≈100–195), idem `home-768-urna.png` e `home-1440-urna.png` —
critério 11 (microcopy) — a string "base editorial de 03/08/2026" aparece **duas vezes com ~20px
de distância** na primeira dobra: no fim do subtítulo e como conteúdo inteiro do selo de frescor.
Além da redundância, o selo perde a função: §8.5 pede que ele diga **quando foi verificado**
("verificado hoje às 09h · última pesquisa incluída em dd/mm") e comute para alerta acima de 48h;
como está, ele repete uma data já na tela.

[MINOR] `home-390-urna.png` (rótulo da linha principal, y≈388–402) — critério 11 — o intervalo de
datas quebra entre linhas: "(04–" fecha a linha 1 e "25/10," abre a linha 2. É o rótulo do número
manchete da página; precisa de tratamento inquebrável.

[MINOR] `home-390-replay.png` (y≈283–292), idem em `home-768-replay.png` e `home-1440-replay.png`
— critério 12/11 — a legenda da curva de sensibilidade lê "■ Lula   ■ Flávio**.**": ponto final em
um candidato e não no outro, no único lugar em que os dois nomes aparecem colados. Pontuação
assimétrica entre lados é exatamente o que a §5.1 proíbe.

[MINOR] `home-1440-full.png` (y≈6160–6320, três últimas linhas: pesos 0,15 / 0,01 / 0,00) e
`home-390-full.png` (cartão Genial/Quaest 08/01–11/01) — critério 2/8 — linhas e cartões com
w<0,15 aparecem **em força total**: amostra do pixel dá `(24,28,24)` tinta e `(179,0,38)`
lula-escuro, idênticos às linhas de peso alto (com `opacity-55` o composto sobre cartão daria
~124). O §7.5 e o INVENTÁRIO §3.10 pedem `opacity-55` **e** o texto "peso baixo"; só o texto
chegou. A série fica sem hierarquia visual de peso, contra P8.

[MINOR] `home-1440-full.png` (mesmas linhas, coluna PESO) — critério 4/7 — a célula de peso empilha
em três linhas ("0,15" / "peso" / "baixo") e os chips de leitura quebram em duas ("empate /
técnico", "Lula à / frente") **no viewport mais largo**, enquanto ~180px de espaço morto ficam
entre REGISTRO TSE e a coluna do `×`. Redistribuir a largura das colunas.

[MINOR] `metodologia-390-full.png` (y≈2280–2760, "Fontes da série (13) · registro no TSE") —
critério 7 — quando o nome do instituto + " · campo …" não cabe, o "·" desce para o começo da
linha seguinte ("Genial/Quaest" / "· campo 10/07–13/07/2026 · BR-07181/2026"). Duas consequências:
linha começando com ponto médio, e o espaçamento entre itens some — "AtlasIntel" encosta na
segunda linha de "Genial/Quaest" enquanto os demais pares têm ~40px. A lista de 13 itens lê como
bloco irregular. Em `metodologia-1440-full.png` cada item cabe em uma linha e o ritmo é regular:
é falha de largura.

[MINOR] `metodologia-1440-full.png` ("Fontes da série") vs `home-1440-tabela.png` ("SÉRIE DE
PESQUISAS (13) · DA MAIS RECENTE PARA A MAIS ANTIGA") — critério 11 — as mesmas 13 pesquisas
aparecem em **duas ordens diferentes**: a metodologia abre AtlasIntel 22/07–27/07 → PoderData
26/07–28/07 → Nexus → Datafolha → Gerp 15/07 → Indexa 16/07; a tabela é PoderData → Nexus →
AtlasIntel → Datafolha → Indexa → Gerp. A lista existe para o leitor conferir linha a linha (P9);
com ordens divergentes ele tem de procurar cada item.

[MINOR] `metodologia-1440-full.png` ("Classificação dos cenários") vs `home-1440-full.png`
(bloco "METODOLOGIA E LIMITAÇÕES — RESUMO", y≈6620–6680) — critério 11 — a mesma definição
operacional sai com dois textos: "«empate técnico» = diferença ≤ 2× margem de erro" na metodologia
e "«empate técnico» = diferença ≤ 2× **a** margem de erro" no resumo do painel. P7 torna essa
definição carregadora de sentido; tem de ser uma string só, usada nos dois lugares.

[MINOR] `metodologia-1440-full.png` — critério 7 — medido: toda a prosa vai de x=232 a x=995
(763px, `max-w-texto`), enquanto a caixa âmbar do aviso legal vai de x=232 a x=1207 (975px,
`container-leitura`). Numa página que é só prosa, o único elemento de largura cheia avança **212px
para fora da margem direita de tudo o que está acima** — o degrau é a coisa mais visível do
rodapé. Alinhar o aviso à medida da prosa quando não há cartão de largura cheia na página.

[MINOR] `home-1440-graficos.png` (gráfico "DISTRIBUIÇÃO PROJETADA DA MARGEM…", eixo X) — critério 5
— os ticks são −16, −1, 14, 25 e **não há tick em 0**, apesar de 0 ser o cruzamento de que o
gráfico inteiro trata; a ReferenceLine escura no zero não tem rótulo. O leitor não consegue
localizar a virada no eixo — só no texto alternativo abaixo. Mesmo problema no eixo Y da evolução
(30, 37, 44, 51, 55 — último passo irregular). Fixar ticks redondos com 0 explícito.

[MINOR] `home-390-tabela.png` (cartão PoderData, y≈645–670) e demais cartões em
`home-390-full.png` — critério 7 — o botão `×` de remover ocupa uma linha vazia própria **acima**
da linha "±2,0 p.p. · BR-07845/2026" na maioria dos cartões, e fica ao lado dela quando o metadado
quebra em duas linhas (cartão Datafolha 03/03). O §7.5 o coloca no canto inferior direito; como
está, a posição muda de cartão para cartão e deixa uma faixa vazia.

[MINOR] `home-390-urna.png` (veredito, y≈620–760) e `home-1440-full.png` (lead do cenário-base)
contra `home-390-graficos.png` ("Em votos válidos, Lula tem ≈46,0%") — critério 2 (mono só para
dados) — a regra do §4.1 ("se o conteúdo muda quando o modelo recalcula, é mono") é aplicada de
forma inconsistente dentro da mesma página: "≈46,0%" sai em IBM Plex Mono no meio da prosa, mas
"92%" e "8%" no veredito e "17%" / "1 vez a cada 6" no cenário-base — igualmente recalculados —
saem em Archivo. Escolher um lado da regra e aplicar nos dois lugares.

[MINOR] `home-390-graficos.png` (cartão 1º turno, linha final) — critério 1/11 — "Chance de Flávio
vencer no 1º turno: **0%**". Um painel cuja tese é que nada está fechado imprime um zero absoluto.
P2 manda arredondar, mas não manda transformar improbabilidade em impossibilidade — usar piso
("<1%"), como o próprio aviso legal faz ao dizer que "probabilidade baixa não é impossibilidade".

[MINOR] cobertura dos 27 prints — critério 3/12 — a aba **"Todos os candidatos (9)"** não foi
capturada em nenhum viewport (todos os shots mostram a aba "Disputa principal"). É justamente a
vista que a §5.5 aponta como a de piores contrastes do protótipo (Zema 2,37:1, Cury 3,99, Caiado
4,01 sobre papel) e onde 9 cores de candidato precisam ser neutras entre si; axe não julga
preenchimento de barra em SVG. Acrescentar uma âncora `home-{390,768,1440}-candidatos` antes de
fechar o loop.

[NIT] `home-390-parametros.png` (dica de "Erro sistemático histórico", y≈695) e
`home-1440-parametros.png` — "CALIBRADO" em caixa alta como ênfase no meio da prosa, enquanto toda
ênfase da página é negrito (§4.3).

[NIT] `home-390-urna.png` (contadores, y≈228–265) — os dois contadores quebram de modo que a
segunda linha começa com ponto médio ("· 04/10", "· 25/10").

[NIT] `home-1440-replay.png` e `home-768-replay.png` — dentro do bloco REPLAY, os cartões 1 e 2
ficam com ~100–150px de espaço morto no rodapé porque só o cartão 3 tem o botão "aplicar réplica
(viés +3,1) ao painel" e a grade estica os três à mesma altura.

[NIT] `home-1440-parametros.png` (grade de sliders, y≈555–650) — a folga entre a dica e o rótulo
da linha seguinte difere ~30px entre as duas colunas (dica esquerda com 2 linhas, direita com 4),
deixando o bloco visivelmente torto. Mesmo efeito em `home-768-parametros.png`.

[NIT] `historico-1440-full.png` — os dois cartões irmãos de estado vazio levam filetes de topo de
cores diferentes (tinta no primeiro, verde no segundo) sem diferença semântica entre eles.

## Veredito

**BLOCKER 2 · MAJOR 7 · MINOR 15 · NIT 5** — 29 itens.

O loop **não pode fechar** nesta iteração, por três razões independentes:

1. Dois BLOCKERs de tabela em viewports auditados: a série de pesquisas estoura a página em 768
   (canvas 858 contra viewport 768, registro TSE cortado nas 13 linhas, botão de remover fora da
   tela) e a tabela de histórico de erros perde a coluna ERRO inteira a 390px, com palavras
   truncadas no meio do caractere. Ambos são perda de dado obrigatório (P9/R4), não estética.
2. Uma falha de neutralidade que o leitor percebe sem procurar: o filete da disputa decisiva em
   `#C4122F` = `--color-lula`, sem espelho, e o par "Lula × Flávio" partido em duas linhas nos 13
   cartões da série a 390px.
3. O critério 5 não foi auditável: todos os canvases de gráfico estão vazios nos prints de 390 e
   768 (artefato de captura, provado pelos crops de replay, onde a mesma curva aparece
   renderizada). Sem recaptura, colisão de ticks/legendas a 390px continua não verificada — e essa
   era uma das checagens pedidas explicitamente.

O que já está sólido e **não** deve ser mexido: a primeira dobra a 390×844 responde quem lidera,
com que chance e quão incerto sem scroll (`home-390-urna.png` mostra manchete + linha de hoje +
veredito completo dentro dos 844px); a disciplina da identidade está respeitada — exatamente três
blocos escuros (tela da urna, "SÍNTESE DO CONTEXTO", "REPLAY 2022"), nenhum gradiente, nenhuma
sombra difusa, nenhum ícone decorativo, nenhuma imagem de pessoa ou partido; o rótulo das bandas
de margem comuta corretamente por clareza (amostrado: `#F6F6F0`/`#E8E8DF` nas bandas escuras,
`#181C18` nas claras — §5.5 cumprido); os numerais de placar usam os degraus `-escuro` espelhados
(`#B30026` / `#2A55A2`); e os estados vazios de `/historico` estão desenhados, não improvisados.

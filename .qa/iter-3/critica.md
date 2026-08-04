# Crítica — iteração 3

Base: 30 PNGs de `.qa/iter-3/`, lidos um a um nos três viewports (390×844, 768×1024, 1440×900),
mais recortes em resolução plena, zoom nearest-neighbour e amostragem de pixel (PIL) extraídos dos
full-page. Gates automáticos (139 unit, 21 e2e com console limpo, axe zero, Lighthouse
94/100/100/100, CLS 0) não são re-julgados aqui.

**Calibração tipográfica.** A iteração 2 errou ao afirmar família de fonte por leitura de pixel.
Nesta rodada só afirmo família quando a medida sustenta: em monoespaçada o avanço do `%` iguala o
de um dígito, em proporcional é ~1,4×. Medido no `88%` da urna a 1440: tinta dos dígitos 17px e
16px, tinta do `%` 18px, avanços 20px e 18px — mono. Medido no `83%` da manchete: dígitos 36px,
`%` 41px (razão 1,14) — mono. Onde a medida não fecha, não afirmo. Os quatro subpontos que a
iteração 2 errou (mini-cartões, contadores do cabeçalho, `92%`/`8%` do veredito) não são
reabertos.

Nenhum full-page excede a largura do viewport (canvas 390/768/1440 exatos nos nove prints de
página inteira): não há scroll horizontal acidental em lugar nenhum.

## Itens

[MINOR] `home-1440-full.png` (coluna PESO, três últimas linhas da SÉRIE DE PESQUISAS, y≈6352–6463)
e `home-768-full.png` (mesmas linhas) — critério 4/7 (ritmo vertical, largura de coluna) —
**regressão**: a célula de peso voltou a empilhar em **três** linhas. Medido, os runs de tinta em
x=870–945 dão `0,15` em y 6352–6363, `peso` em 6368–6381 e `baixo` em 6385–6394; o mesmo em `0,01`
e `0,00`. Na iteração 2 essas mesmas três linhas imprimiam `0,15` / `peso baixo` em **duas** linhas
(recorte comparativo do `iter-2/home-1440-full.png` em x=855–950, y=6300–6350), e a iteração 2
registrou o item como corrigido ("coluna de peso e chips em uma linha a 1440"). Consequência
medida: o passo entre as linhas 11 e 12 é de **69px** contra **61px** das dez linhas acima — três
das treze linhas ficam 8px mais altas e a palavra `baixo` fica sozinha numa terceira linha —,
enquanto sobram **~130px** de espaço morto entre o fim de `BR-07845/2026` (x≈1035) e a coluna do
`×` (x≈1165) na mesma linha. Os chips (`empate técnico`, `Lula à frente`) continuam em uma linha,
então só a metade "peso" do item da iteração 1 voltou. Alargar a coluna PESO (há folga à direita)
ou tornar `peso baixo` inquebrável.

[NIT] `home-1440-replay.png` / `home-768-replay.png` / `home-390-replay.png` (cabeçalho do bloco)
contra os cartões de cenário e os textos internos do mesmo bloco — critério 11 (microcopy pt-BR
consistente) — o mesmo conceito tem dois nomes na mesma página: o bloco se chama **REPLAY 2022 —
E SE OS ERROS SE REPETISSEM EXATAMENTE?** e tudo dentro e ao redor dele chama de **réplica** —
`Réplica 2022 — erro do 2ºT se repete` (cartão), `réplica 2022` (anotação da curva),
`aplicar réplica (viés +3,1) ao painel` (botão dentro do próprio bloco),
`ESTIMATIVA DE VITÓRIA · CONDICIONAL À RÉPLICA EXATA` (cartão 3), `— réplica quase exata do placar
real de 2022`, `A réplica fiel, portanto, ainda elege Lula por pouco`. O anglicismo aparece **uma
única vez**, justamente no título que nomeia a seção; a palavra portuguesa aparece seis. Uma string
só.

[NIT] `home-390-full.png` (links `fonte` ao pé dos seis cartões de CONTEXTO SOCIAL, medido em
y=3001–3012, x=46–73) e os `×` de remover dos 13 cartões da série — critério 6 (alvos de toque) —
a caixa **visível** do link `fonte` mede **27×12px** e a do `×` cerca de 10×10px. A iteração 2
mediu e aprovou abas (46px), botões (44px), alternador de turno (44px) e thumb dos sliders (24px —
reconferido aqui: bbox y 523–546 em `home-390-parametros.png`), mas nenhum desses quatro alvos
menores. **Não estou afirmando falha**: a área clicável real não é mensurável em screenshot, e as
folgas verticais ao redor (18–21px acima e abaixo do `fonte`) são compatíveis tanto com padding de
toque quanto com padding do cartão. Registrado como pedido de medição por CDP
(`getBoundingClientRect` do `<a>`/`<button>`), não como defeito observado.

[NIT] `home-390-full.png` (cartão "Pano de fundo da disputa", y≈3690–3760) e o par em 768/1440 —
critério 2 (mono só para dados) — a linha mono do cartão carrega 30 palavras de narrativa, não
medida: "Jair Bolsonaro preso (pena de 27 anos) e inelegível até 2030 · tarifa de 25% dos EUA
sobre produtos brasileiros em vigor desde 22/07, mobilizada pelas duas campanhas" — quatro linhas
de prosa em monoespaçada a 390. A convenção do bloco (mono = o que foi medido, Archivo = o que
isso significa) é coerente e está aplicada igual nos seis cartões; só este estica a fatia mono até
virar narrativa. Os outros cinco (`48%×47% (Quaest)`, `Lula 47–53%`, `Lula 36% × Flávio 31%`,
`16/08 … 04/10 e 25/10`) são dado. NIT de propósito: sozinho não justifica reabrir o loop.

## Veredito

**BLOCKER 0 · MAJOR 0 · MINOR 1 · NIT 3** — 4 itens.

Esta **não** é a primeira iteração limpa, por um item só: a coluna PESO da série regrediu de duas
para três linhas a 1440/768 depois de ter sido verificada como corrigida na iteração 2. É a única
coisa nesta rodada que estava melhor antes. Os três NITs não reabrem o loop e podem ser resolvidos
junto ou ignorados — dois deles (alvos de toque, prosa em mono) são pedidos de verificação, não
defeitos observados.

### Estado dos 11 itens da iteração 2 — 11 corrigidos, 0 regrediram

**MAJORs (4/4).**

1. *Tick `06/08` cortado ao meio do glifo.* **Corrigido nos três viewports.** Zoom
   nearest-neighbour em `home-390-graficos.png` (x 280–390, y 730–760), `home-768-graficos.png`
   (x 650–740) e `home-1440-graficos.png` (x 600–700): o `8` final tem haste esquerda, três barras
   e **haste direita**, fechado, com folga entre o glifo e o limite do `<svg>`.
2. *Anotações `réplica 2022` e `teste-limite +6,3` sobrepostas a 390.* **Corrigido.** Em
   `home-390-sensibilidade.png` (y 500–560) as três marcações estão em **duas fileiras**: `sem
   viés` e `teste-limite +6,3` na primeira, `réplica 2022` na segunda, com folga em branco entre
   todas. Idem em `home-390-full.png` y≈7860.
3. *Institutos fatiados em 7 caracteres.* **Corrigido, com a distinção pedida.** A 1440
   (`home-1440-candidatos.png` y≈1288) e a 768 (`home-768-candidatos.png`) o cabeçalho traz
   `PODERDATA`, `NEXUS`, `ATLASINTEL`, `DATAFOLHA`, `INDEXA`, `GERP`, `GENIAL/QUAEST` **inteiros**,
   mais a coluna `MÉDIA`. A 390 são abreviações deliberadas com ponto — `PODERD.`, `ATLAS`,
   `DATAFOL.` —, dentro de um wrapper com esmaecimento de rolagem medido em x=346–356. Nenhuma
   palavra fatiada no meio.
4. *Regra mono/Archivo — o par 83%/17% do cenário-base.* **Corrigido no ponto inegociável.** No
   título `PROBABILIDADE COMBINADA: 83%` e na nota `Um cenário com 17% de probabilidade contrária`
   (a 45px de distância) os dois valores saem no **mesmo `%` estreito de duas argolas e barra**,
   distinto do `%` da prosa Archivo ao redor. As anotações dos gráficos, que a iteração 2 apontou
   em Archivo, agora são monoespaçadas: `sem viés`, `réplica 2022`, `teste-limite +6,3`,
   `virada (+4,7)`, `◆ atual`, `0 · virada`, além dos ticks.

**MINORs (4/4).**

5. *Registro TSE cortado a 768 no estado inicial.* **Corrigido sem gesto.** Em
   `home-768-tabela.png` a tabela larga as colunas `N` e `±MoE` nessa faixa e imprime
   `REGISTRO TSE` inteiro (`BR-07845/2026` … `BR-00835/2026`) nas 13 linhas, com a coluna do `×`
   visível em x≈709 dentro do cartão que termina em x≈751. Tinta mais à direita medida em toda a
   região da tabela: x=730.
6. *Conteúdo dos três cartões de cenário centrado verticalmente.* **Corrigido.** Varredura de
   pixel vermelho nas três colunas de `home-1440-sensibilidade.png`: a linha `viés +X,X ⟶ NN%×NN%`
   começa em **y=859 nos três cartões** (degrau 0px, contra 36px na iteração 2), inclusive no
   cartão 3, cujo título ocupa duas linhas. A 768 as três linhas de viés assentam em y≈948.
7. *Selo `● disputa principal` quebrando só no Flávio a 390.* **Corrigido simétrico.** Em
   `home-390-candidatos.png` (y 1090–1190) o selo está em **linha própria** tanto sob
   `1º · Lula (PT)` quanto sob `2º · Flávio Bolsonaro (PL)`; o `●` nunca fica órfão. A 768 e 1440
   cabe na linha do nome nos dois.
8. *Anotações atravessadas pelos traços.* **Corrigido com interrupção do traço.** Medido em
   `home-1440-sensibilidade.png`, coluna x=495: a linha verde `#1E7A46` é sólida de y=698 a 713,
   **some de 714 a 725** (exatamente a faixa do rótulo `◆ atual`) e volta em 726–728. Em
   `home-390-sensibilidade.png` a curva vermelha tem lacunas em x=234, 238, 258, 270 e 274 —
   todas dentro da caixa de `virada (+4,7)`.

**NITs (3/3).**

9. *Contorno das 9 barras só como tampa direita.* **Corrigido, contorno fechado.** Amostra na
   barra do Zema (`home-1440-candidatos.png`): aresta superior y=1033 e inferior y=1046 em
   `(114,114,103)` = `--color-linha-forte` `#727267` ao longo de todo o preenchimento
   `(232,121,29)`, mais a tampa direita em x=315–316 na mesma tinta.
10. *"AGORA" em caixa alta e excesso de negrito.* **Corrigido.** O título agora é "Por que o erro
    do 1º turno importa **agora**" em caixa normal, e o primeiro parágrafo passou de 11 palavras
    em negrito para um único trecho (`calibragem nenhuma`); no segundo, o negrito restante é
    numérico (`2018→2022`, `2024 (SP, 2ºT)`, `σ=3/σ=4/σ=6`).
11. *Cartões esticados pela grade.* **Corrigido.** A 1440 o cartão "DISTRIBUIÇÃO PROJETADA…"
    termina em y≈1558 enquanto o "EVOLUÇÃO" segue até y≈1660 — dimensionados por conteúdo. Os seis
    cartões de CONTEXTO SOCIAL fecham em alturas distintas a 1440 (y≈486/500/452 na primeira
    fileira) e a 768 (y≈466/482), sem faixa vazia. Os três cartões do REPLAY idem (1440: 643 / 606
    / 735).

### Varredura completa da rubrica (14 itens), 390 / 768 / 1440

1. **Primeira dobra.** ✔ A 390×844 `home-390-urna.png` entrega, sem rolar: quem lidera
   (`LULA FAVORITO — VITÓRIA PROVÁVEL, NÃO GARANTIDA`), com que chance (`83%` × `17%` projetado e
   `88%` × `12%` hoje) e quão incerto (`INCERTEZA ±5,2 P.P.` / `±4,1 P.P.`), fechando o parágrafo
   do veredito em y≈740. Idem a 768 (até y≈690 de 1024) e 1440.
2. **Hierarquia / mono só para dados.** ✔ com o NIT do "Pano de fundo" acima. Um único bloco
   dominante (a tela da urna); rótulos de seção em mono caixa alta, prosa em Archivo, dados em
   mono — reconferido no par 83%/17%, nos mini-cartões, nas bandas e nos ticks.
3. **Contraste AA.** ✔ inclusive no que o axe não vê (texto dentro de SVG). Medido sobre papel
   `#F6F6F0`: ticks dos eixos `(99,104,95)` → **5,27:1**; anotações da curva `(105,109,101)` →
   **4,87:1**; `◆ atual` `#1E7A46` → **4,93:1**; legenda `Lula vence (82%)` `#C4122F` → **5,57:1**.
   Rótulos da banda modal: branco sobre `#16418C` **8,93:1** e sobre `#C4122F` **5,57:1**; tinta
   sobre `#D96A7A` **4,84:1** e sobre `#E8A4AE` **8,23:1** — a comutação por clareza está certa nos
   quatro segmentos. Instituto de linha com peso baixo em `#63685F` → **4,94:1**.
4. **Tabelas a 390 / sem scroll acidental.** ✔ Série de pesquisas e histórico de erros viram
   cartões completos a 390; a tabela cruzada de candidatos rola dentro do wrapper com esmaecimento
   visível; nenhum full-page excede a largura do viewport.
5. **Gráficos legíveis a 390.** ✔ Evolução (ticks `07/01 · 02/05 · 06/08`, eixo Y 30–55 de 5 em
   5), distribuição (`-10 · 0 · 10 · 20` com `0 · virada` rotulado) e sensibilidade (`-2…10`,
   `0%…100%`, anotações em duas fileiras, rótulos com halo) — sem colisão nem corte nos três
   viewports.
6. **Alvos de toque.** ✔ nos alvos medidos (abas 46px, botões 44px, alternador 44px, thumb 24px);
   os quatro alvos pequenos estão no NIT acima.
7. **Ritmo vertical.** ✔ salvo o MINOR da coluna PESO. Separadores tracejados dos sliders
   alinhados entre as colunas a 768 e 1440; placares do REPLAY no mesmo y; barras e numerais da
   urna no mesmo eixo.
8. **Estados desenhados.** ✔ `/historico` com os dois cartões vazios explicando *por que* estão
   vazios e com o mesmo filete escuro nos dois; simulação com `+ Adicionar nova pesquisa
   (simulação)` e `↺ Restaurar dados oficiais`; parâmetros com `✓ Parâmetros no padrão`.
9. **Acessibilidade.** Gate (axe zero) — não re-julgado; o que é visível em print (foco, contorno,
   comutação de clareza) está consistente.
10. **Manchete/CLS/LCP.** Gate.
11. **Microcopy pt-BR.** ✔ salvo o NIT `replay`/`réplica`. Ordem das 13 pesquisas idêntica entre
    `metodologia-*-full.png` e a tabela do painel; `«empate técnico» = diferença ≤ 2× a margem de
    erro` em string única nos dois lugares; `<1%` no lugar do zero absoluto; lista de fontes a 390
    sem "·" iniciando linha e com passo regular (~34–35px entre itens, inclusive nos que quebram).
12. **Neutralidade lado a lado.** ✔ Par `Lula 46,0%  ×  Flávio 43,0%` em linha única e rotulada
    nos 13 cartões a 390; selo simétrico nas duas fileiras do topo; filete do cartão do 2ºT em
    tinta; pontuação simétrica na legenda; nome dos 9 candidatos em `--color-tinta`; a barra de
    cada candidato usa o mesmo tratamento e a mesma escala relativa.
13. **Identidade disciplinada.** ✔ Exatamente três blocos escuros (tela da urna, SÍNTESE DO
    CONTEXTO, REPLAY 2022), zero gradiente decorativo, zero sombra difusa, zero ícone ilustrativo,
    zero imagem de pessoa ou partido; o cursor em bloco do `NÃO É PREVISÃO▊` é o único adereço e é
    o do tema.
14. **Console e rede.** Gate.

O que está sólido e **não** deve ser mexido: tudo o que está listado como corrigido acima, mais o
sistema de cor (comutação de clareza sobre as bandas, degraus `-escuro` espelhados nos placares,
setas e chips em `--color-confirma-texto`/`--color-alerta-texto`), a medida da prosa da
`/metodologia` com o aviso legal alinhado a ela (232→1000 a 1440) e os quatro estados desenhados.

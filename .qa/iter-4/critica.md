# Crítica — iteração 4

Base: os 30 PNGs de `.qa/iter-4/`, lidos um a um nos três viewports (390×844, 768×1024,
1440×900) — os nove *full-page* fatiados em faixas legíveis, mais recortes em resolução plena,
zoom *nearest-neighbour* (até 8×) e amostragem de pixel com PIL. Gates automáticos (139 unit,
21 e2e com console limpo, axe zero, Lighthouse 94/100/100/100, CLS 0) não são re-julgados aqui.

Os nove *full-page* têm canvas de largura exatamente 390 / 768 / 1440: **não há scroll horizontal
acidental em lugar nenhum**. A altura da página caiu de 7318→**7294** a 1440 e de 8531→**8511** a
768, e ficou idêntica (15333) a 390 — exatamente o que a correção da coluna PESO deveria produzir
(o layout de 390 é em cartões e não era afetado).

---

## (a) A correção da coluna PESO — **verificada, correta nos três viewports**

**1440** (`home-1440-full.png`, SÉRIE DE PESQUISAS). Varredura dos *runs* de tinta na coluna
(x 855–945) nas treze linhas:

| linha | tinta do valor | tinta do rótulo | centro do bloco |
|---|---|---|---|
| 1–10 (peso normal) | uma única linha, 12px | — | 5942,5 … 6308,5 (passo **61** em todas) |
| 11 `0,15` | 6356–6367 | 6373–6385 | 6370,5 (**+62**) |
| 12 `0,01` | 6417–6428 | 6434–6446 | 6431,5 (**+61**) |
| 13 `0,00` | 6478–6489 | 6495–6507 | 6492,5 (**+61**) |

- **Exatamente duas linhas** (`0,15` / `peso baixo`), confirmado em zoom 8× — a palavra `baixo`
  não fica mais sozinha numa terceira linha.
- O rótulo é **um único run de 13px de altura** (uma linha de texto, com a descendente do `p`):
  inquebrável, como pedido.
- **O passo entre centros de linha é 61px nas treze linhas**, idêntico ao das dez linhas de peso
  normal. O degrau de 8px que a iteração 3 mediu (69 contra 61) desapareceu; as três linhas não são
  mais altas que as outras, o rótulo cabe dentro da altura de linha que já existia.
- **Não há espaço morto anômalo.** A célula fica centrada verticalmente: o valor sobe 8px e o
  rótulo ocupa a metade de baixo, sem folga extra acima nem abaixo (por isso o passo do valor
  isolado é 53 na transição, enquanto o passo do *centro* segue 61).
- Contraste: o rótulo sai na mesma tinta escura do valor (pixel mais escuro medido `(27,31,27)`
  sobre `(239,239,230)` = **14,4:1**), não numa tinta esmaecida — ele é o único elemento legível de
  uma linha deliberadamente atenuada, que é o comportamento certo.

**768** (`home-768-full.png`). Mesma leitura: `0,15` em 7497–7508 e `peso baixo` em 7514–7526 —
duas linhas. Passo entre nomes de instituto: 61px nas onze primeiras transições. As duas últimas
dão **63**, e a causa **não é o peso**: é a linha 12, cuja célula REGISTRO TSE imprime
`registrada (nº n/d na fonte)` em **três** linhas nessa largura e sozinha manda na altura da linha
(+4px). A transição linha 10→11, que é uma linha de peso baixo com registro de uma linha, mede
exatamente 61 — ou seja, a célula de peso em duas linhas **não** dimensiona mais a linha.

**390** (`home-390-full.png`). A série vira cartões; o bloco de peso aparece no cabeçalho do
cartão, alinhado à direita, em duas linhas (`peso 0,15` / `peso baixo`), com os números do cartão
esmaecidos em `#63685F` (4,94:1) — o mesmo tratamento das linhas de peso baixo a 1440. Nada
sobrepõe nem colide com `campo 05/06–08/06` à esquerda.

## (b) Amostragem dirigida — **nada regrediu**

- **Tick `06/08`** (`home-390-graficos.png`, `home-768-graficos.png`, `home-1440-graficos.png`):
  zoom 5–6× no último tick dos três — o `8` final está fechado (haste esquerda, três barras, haste
  direita) com folga entre o glifo e o limite do `<svg>`.
- **Anotações da curva a 390** (`home-390-sensibilidade.png`): `sem viés` e `teste-limite +6,3` na
  primeira fileira, `réplica 2022` na segunda, com branco entre todas. Zero sobreposição.
- **Institutos** (`home-1440-candidatos.png`, `home-768-candidatos.png`): `PODERDATA`, `NEXUS`,
  `ATLASINTEL`, `DATAFOLHA`, `INDEXA`, `GERP`, `GENIAL/QUAEST` + `MÉDIA` inteiros nos dois. A 390
  são abreviações com ponto (`PODERD.`, `ATLAS`, `DATAFOL.`) dentro do wrapper com esmaecimento —
  nenhuma palavra fatiada.
- **REGISTRO TSE a 768** (`home-768-tabela.png` e o *full*): a tabela larga `N` e `±MoE`, imprime
  `BR-07845/2026` … `BR-00835/2026` inteiros nas 13 linhas e mostra a coluna do `×`. Tinta mais à
  direita de toda a região da tabela: **x=751**, exatamente a borda do cartão; fundo de página
  `(231,231,222)` de 752 a 767. Sem corte, sem transbordo.
- **Cartões de cenário alinhados** (`home-1440-sensibilidade.png`, `home-768-sensibilidade.png`):
  as três linhas `viés +X,X ⟶ NN%×NN%` assentam no mesmo y nos três cartões (1440: y=863/864;
  768: y=1157), inclusive no cartão 3, cujo título ocupa duas linhas.
- **Halo / interrupção do traço** (`home-1440-sensibilidade.png`, coluna x=495): o verde
  `#1E7A46` = `(30,122,70)` é sólido de 690 a **713**, some de **714 a 725** (a faixa do rótulo
  `◆ atual`, onde só aparecem os tons do próprio losango) e volta em 726–727.
- **Contorno das barras** (`home-1440-candidatos.png`, barra do Zema): aresta superior em y=1033 e
  inferior em y=1046, ambas em `(114,114,103)` = `--color-linha-forte` `#727267`, ao longo de todo
  o preenchimento `(232,121,29)`, mais a tampa direita em x=316. Contorno fechado nos quatro lados.
- **mono/Archivo no cenário-base** (`home-1440-full.png`): o `%` de `PROBABILIDADE COMBINADA: 83%`
  e o de `Um cenário com 17% de probabilidade contrária` saem no mesmo glifo estreito de duas
  argolas e barra, distinto do `%` da prosa Archivo ao redor (zoom 8× nos dois).
- **Selo `● disputa principal` simétrico a 390** (`home-390-candidatos.png`): em linha própria sob
  `1º · Lula (PT)` **e** sob `2º · Flávio Bolsonaro (PL)`; a 768/1440 cabe na linha do nome nos
  dois. O `●` nunca fica órfão.
- **Cartões dimensionados por conteúdo**: CONTEXTO SOCIAL fecha em y≈487/501/452 na primeira
  fileira a 1440; REPLAY fecha em 645/605/735; nenhum cartão com faixa vazia.
- **/historico e /metodologia**: byte-idênticos aos da iteração 3 nos três viewports
  (`shasum` conferido) — não houve como regredir, e o que estava certo continua.

## Itens

Nenhum BLOCKER, MAJOR ou MINOR. Cinco NITs — três herdados da iteração 3 (reavaliados abaixo) e
dois novos, ambos pré-existentes (não são regressões: o pixel da região é idêntico ao da
iteração 3).

[NIT] `home-1440-replay.png` / `home-768-replay.png` / `home-390-replay.png` (cabeçalho do bloco) —
critério 11 (microcopy pt-BR consistente) — **mantido, não elevado**. O bloco continua se chamando
**REPLAY 2022 — E SE OS ERROS SE REPETISSEM EXATAMENTE?** e tudo dentro dele continua dizendo
**réplica** (`Réplica 2022 — erro do 2ºT se repete`, `réplica 2022` na anotação da curva,
`aplicar réplica (viés +3,1) ao painel` no botão do próprio bloco,
`ESTIMATIVA DE VITÓRIA · CONDICIONAL À RÉPLICA EXATA`, `— réplica quase exata do placar real de
2022`, `A réplica fiel, portanto, ainda elege Lula por pouco`). Reavaliei se merecia MINOR e
**não merece**: `replay` e `réplica` são cognatos evidentes, o título funciona como nome próprio
da seção e o botão está a poucos pixels dele — o leitor não perde informação nem se pergunta se
são duas coisas. É uma ruga de consistência de uma string só.

[NIT] `home-390-full.png` (links `fonte` ao pé dos seis cartões de CONTEXTO SOCIAL; `×` de remover
nos 13 cartões da série) — critério 6 (alvos de toque) — **mantido como pedido de medição, não
elevado**. Medi o glifo do `×` no cartão da PoderData: tinta em y 13061–13067 × x 315–320
(**6×7px**). Mas medi também a folga: no mesmo eixo x não há tinta alguma entre y=12983 e a borda
do cartão em y=13102, ou seja, **uma caixa de 44px centrada no glifo cabe geometricamente**
(13042–13086, tudo livre). Idem para o `fonte` (18–21px de folga acima e abaixo). Portanto o
screenshot **não sustenta** a afirmação de falha — nem a de aprovação. Continua sendo um
`getBoundingClientRect()` por CDP no `<a>`/`<button>`, não um defeito observado. Os alvos que dá
para medir passam: alternador de turno **46px**, `+ Adicionar nova pesquisa (simulação)` **46px**,
`▶ Compartilhar este cenário` **44px**.

[NIT] `home-390-full.png` / `home-768-parametros.png` / `home-1440-parametros.png` (cartão "Pano de
fundo da disputa") — critério 2 (mono só para dados) — **mantido, não elevado**. A fatia mono
continua carregando 30 palavras ("Jair Bolsonaro preso (pena de 27 anos) e inelegível até 2030 ·
tarifa de 25% dos EUA sobre produtos brasileiros em vigor desde 22/07, mobilizada pelas duas
campanhas"). Reavaliando: a convenção do bloco (mono = o que foi apurado, Archivo = o que isso
significa) está aplicada **igual** nos seis cartões — o "Calendário que ainda pesa" também tem
quatro linhas mono de fatos datados — então não é inconsistência, é o caso mais longo de uma regra
consistente. NIT de propósito.

[NIT] `home-390-full.png` (bloco de fórmula do PARÂMETROS DO MODELO, y≈4990–5060) — critério 7/11 —
**novo, não é regressão**. A terceira linha quebra e deixa a unidade órfã:
`dia da votação: √(hoje² + 3,2²) = ±5,2` na linha 3 e **`p.p.` sozinho na linha 4**. As duas linhas
acima mantêm `+4,7 p.p.` e `±4,1 p.p.` inteiras, e a 768 e 1440 as três linhas cabem inteiras — só
a 390 a terceira estoura por 1–2 caracteres. É o único ponto desta rodada visível a olho nu para um
leitor atento; um `white-space: nowrap` no par valor+unidade resolve. Não reabre o loop.

[NIT] `home-1440-full.png` / `home-768-full.png` (cabeçalho da coluna PESO da SÉRIE DE PESQUISAS) —
critério 7 — **novo, não é regressão**. É a única coluna cujo cabeçalho **não fica sobre os
próprios valores**: a 1440 `PESO` ocupa x 864–891 e os valores (`0,86`, `0,73`, …) ocupam x
902–934 — não compartilham um só pixel de coluna. Todas as outras oito colunas alinham cabeçalho e
dados pela esquerda no mesmo x (INSTITUTO 254/253, CAMPO 358/359, N 463/463, 1ºT 557/557, 2ºT
645/645, LEITURA 733/732, REGISTRO 948/948). O motivo é que os números do peso são alinhados à
direita e o cabeçalho, à esquerda, dentro da mesma caixa; o rótulo `peso baixo` (x 864–936) é o
único conteúdo que encosta no cabeçalho. Já era assim na iteração 3 (`PESO` 864–891 contra valores
897–929) — a correção só afastou 5px a mais. Alinhar `PESO` à direita fecha. Como a associação
continua inequívoca (não há nada entre o rótulo e os números), é NIT.

## Veredito

**BLOCKER 0 · MAJOR 0 · MINOR 0 · NIT 5.**

Esta é a **primeira iteração limpa** do loop.

### Declaração de critério de parada

Declaro por escrito, explicitamente: **fora do NIT do `p.p.` órfão a 390, não consigo apontar
nenhuma melhoria que um usuário real perceberia.** Sou obrigado a fazer a ressalva porque esse
único item é de fato visível a olho nu para quem ler o bloco de fórmula no celular — mas ele não
esconde nem distorce informação, não quebra ritmo, não afeta nenhum outro elemento e é NIT pela
régua do projeto. Os outros quatro NITs são, dois deles, pedidos de verificação por CDP e por
decisão editorial (alvos de toque, `replay`/`réplica`), e dois, polimento tipográfico abaixo do
limiar de percepção (mono do "Pano de fundo", alinhamento do cabeçalho PESO). Nenhum dos cinco
justifica reabrir o loop, e qualquer outra coisa que eu escrevesse aqui seria re-estilizar o que já
passa — proibido pela regra anti-desperdício.

### Estado do item da iteração 3

**1 MINOR → corrigido, 0 regressões.**

*Regressão da coluna PESO (`0,15` / `peso` / `baixo` em três linhas, com passo de 69px contra 61px
nas outras dez linhas, a 1440 e 768).* **Corrigido e verificado por medição**, conforme a seção (a):
duas linhas exatas, rótulo num único run inquebrável de 13px, passo de **61px em todas as treze
linhas** nos dois viewports, sem espaço morto. Os chips (`empate técnico`, `Lula à frente`)
continuam em uma linha. A altura da página caiu 24px a 1440 (= 3 × 8px), fechando a conta.

Os três NITs da iteração 3 seguem abertos e foram reavaliados um a um acima: **nenhum merecia
severidade maior.**

### Estado dos 11 itens da iteração 2 (amostragem dirigida) — 11 continuam corrigidos

Tick `06/08` ✔ · anotações a 390 em duas fileiras ✔ · institutos inteiros a 768/1440 e abreviados
com ponto a 390 ✔ · par 83%/17% em mono ✔ · REGISTRO TSE inteiro a 768 ✔ · cartões de cenário
alinhados no mesmo y ✔ · selo `● disputa principal` simétrico ✔ · traço interrompido sob as
anotações ✔ · contorno fechado das 9 barras ✔ · "agora" em caixa normal e negrito contido ✔ ·
cartões dimensionados por conteúdo ✔.

### Varredura completa da rubrica (14 itens), 390 / 768 / 1440

1. **Primeira dobra em 5s.** ✔ `home-390-urna.png` entrega sem rolar quem lidera
   (`LULA FAVORITO — VITÓRIA PROVÁVEL, NÃO GARANTIDA`), com que chance (`83%`×`17%` projetado,
   `88%`×`12%` hoje) e quão incerto (`±5,2 P.P.` / `±4,1 P.P.`), fechando o veredito em y≈740 de
   844. Idem a 768 (até y≈690 de 1024) e a 1440 (até y≈545 de 900).
2. **Hierarquia / mono só para dados.** ✔ com o NIT do "Pano de fundo". Um único bloco dominante
   (a tela da urna); rótulos de seção em mono caixa alta, prosa em Archivo, dados em mono —
   reconferido em zoom 8× no par 83%/17%, nos mini-cartões e no novo `peso baixo`.
3. **Contraste AA.** ✔ Gate axe zero para o DOM; no que o axe não vê (texto dentro de SVG e tinta
   sobre banda) as amostras seguem as da iteração 3, sem alteração de pixel nas regiões dos
   gráficos além de *antialiasing*. Novo: `peso baixo` a 14,4:1; números de linha de peso baixo em
   `#63685F` → 4,94:1. A comutação de clareza nos quatro segmentos da banda modal (branco sobre
   `#16418C` e `#C4122F`, tinta sobre `#D96A7A` e `#E8A4AE`) continua correta.
4. **Tabelas a 390 / sem scroll acidental.** ✔ Série de pesquisas e histórico de erros viram
   cartões completos; a tabela cruzada de candidatos rola dentro do wrapper com esmaecimento
   visível em x≈346–356; nenhum *full-page* excede a largura do viewport.
5. **Gráficos legíveis a 390.** ✔ Evolução (`07/01 · 02/05 · 06/08`, eixo Y 30–55 de 5 em 5),
   distribuição (`-10 · 0 · 10 · 20` com `0 · virada` rotulado) e sensibilidade (`-2…10`,
   `0%…100%`, anotações em duas fileiras, rótulos com halo) — sem colisão nem corte nos três.
6. **Alvos de toque.** ✔ nos que dá para medir (alternador 46px, botões 46/44px, abas 46px); os
   quatro alvos pequenos estão no NIT, agora com o limite geométrico medido.
7. **Ritmo vertical.** ✔ **inclusive na coluna PESO**, que era a única falha da rodada anterior:
   61px em todas as 13 linhas a 1440 e a 768 (a única exceção é a linha cuja célula REGISTRO TSE
   ocupa três linhas a 768, +4px, dirigida por conteúdo). Separadores tracejados dos sliders
   alinhados entre as colunas a 768 e 1440; placares do REPLAY no mesmo y.
8. **Estados desenhados.** ✔ `/historico` com os dois cartões vazios explicando *por que* estão
   vazios; simulação com `+ Adicionar nova pesquisa (simulação)` e `↺ Restaurar dados oficiais`
   (este em estado desabilitado, visivelmente atenuado); parâmetros com `✓ Parâmetros no padrão`.
9. **Acessibilidade.** Gate (axe zero) — não re-julgado; o que é visível em print (foco, contorno,
   comutação de clareza) está consistente.
10. **Manchete/CLS/LCP.** Gate.
11. **Microcopy pt-BR.** ✔ salvo os NITs `replay`/`réplica` e do `p.p.` órfão. A ordem das 13
    pesquisas é idêntica entre `metodologia-*-full.png` e a tabela do painel (PoderData, Nexus,
    AtlasIntel, Datafolha, Indexa, Gerp, Genial/Quaest, AtlasIntel, PoderData, Datafolha,
    Genial/Quaest, Datafolha, Genial/Quaest); `registrada (nº n/d na fonte)` aparece na mesma
    string nos dois lugares; `<1%` no lugar do zero absoluto.
    *Correção a uma medida da iteração 3:* a lista de fontes a 390 **não** tem passo de ~34–35px —
    ela assenta num grid de **44px por entrada**, com cada entrada centrada na sua célula (por isso
    as transições medem 35 e 53 quando uma entrada quebra em duas linhas, e 44 entre duas entradas
    de mesmo número de linhas). O ritmo é regular; o que muda é o branco interno, de 29px entre
    entradas de uma linha para 12–13px entre entradas de duas — e o nome sublinhado do instituto
    marca o início de cada entrada sem ambiguidade. **Passa**, mas pela razão certa.
12. **Neutralidade lado a lado.** ✔ Par `Lula 46,0%  ×  Flávio 43,0%` em linha única e rotulada nos
    13 cartões a 390; selo simétrico nas duas fileiras do topo; nome dos 9 candidatos em
    `--color-tinta`; as barras dos 9 usam o mesmo contorno e a mesma escala; nas linhas de peso
    baixo **os dois** candidatos são esmaecidos igualmente.
13. **Identidade disciplinada.** ✔ Exatamente três blocos escuros (tela da urna, SÍNTESE DO
    CONTEXTO, REPLAY 2022), zero gradiente decorativo, zero sombra difusa, zero ícone ilustrativo,
    zero imagem de pessoa ou partido; o cursor em bloco do `NÃO É PREVISÃO▊` é o único adereço.
14. **Console e rede.** Gate.

O que está sólido e **não** deve ser mexido: tudo listado como corrigido acima, a nova célula de
peso em duas linhas (o `nowrap` no span do rótulo com a célula livre é a solução certa — não
alargar a coluna nem truncar), o sistema de cor, a medida da prosa da `/metodologia` e os quatro
estados desenhados.

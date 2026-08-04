# Crítica — iteração 5 (rodada de confirmação do critério de parada)

Base: os 30 PNGs de `.qa/iter-5/`, lidos um a um nos três viewports (390×844, 768×1024,
1440×900) — os nove *full-page* fatiados em faixas legíveis, mais recortes em resolução plena,
zoom *nearest-neighbour* (até 6×) e amostragem de pixel com PIL/numpy. Gates automáticos
(139 unit, 21 e2e com console limpo, axe zero, Lighthouse 94/100/100/100, CLS 0) não são
re-julgados aqui.

**Método novo desta rodada.** Como a iteração 4 foi limpa e só três NITs foram tocados, a
pergunta central deixou de ser "o que está errado?" e passou a ser "o que mudou?". Então em vez
de reler tudo às cegas, comparei **pixel a pixel** os 30 PNGs contra os da iteração 4 (`shasum` +
diff numérico por região). Isso dá uma lista *exaustiva* — não amostral — de tudo que mudou:
qualquer regressão em qualquer lugar da página teria aparecido obrigatoriamente nessa lista.
Depois verifiquei cada mudança e varri a rubrica por leitura direta.

Dimensões: **idênticas às da iteração 4 nos 30 arquivos**. Altura de página 15333 (390),
8511 (768), 7294 (1440) — inalteradas. Largura de canvas exatamente 390 / 768 / 1440 nos nove
*full-page*: **não há scroll horizontal acidental em lugar nenhum** (tinta mais à direita:
x=373 de 390, x=751 de 768, x=1207 de 1440; margens simétricas).

O diff total dos 30 arquivos cabe em **seis regiões**, todas explicadas abaixo. Nenhuma outra.

---

## (a) Os três ajustes de NIT — verificados nos pixels, os três corretos

### (a.1) `p.p.` sem órfão no bloco de fórmula a 390 — **corrigido**

`home-390-full.png`, y 5041–5069 (diff isolado, maxdelta 215). Recorte comparado lado a lado:

| | iteração 4 | iteração 5 |
|---|---|---|
| linha 3 | `dia da votação: √(hoje² + 3,2²) = ±5,2` | `dia da votação: √(hoje² + 3,2²) =` |
| linha 4 | **`p.p.`** (unidade órfã) | **`±5,2 p.p.`** (valor + unidade juntos) |

O par valor+unidade ficou atômico pelo nbsp e a quebra migrou para depois do `=` — que é o ponto
certo para quebrar uma fórmula. **O bloco continua com 4 linhas**, por isso a altura da página a
390 não mudou (15333 = 15333) e nada abaixo se deslocou. As duas primeiras linhas seguem inteiras
(`+4,7 p.p.`, `±4,1 p.p.`). A 768 e a 1440 as três linhas seguem cabendo inteiras, cada uma numa
linha só (conferido em `home-768-parametros.png` e `home-1440-parametros.png`) — o ajuste não
introduziu quebra onde não havia.

### (a.2) Cabeçalho PESO sobre os próprios valores — **corrigido nos dois viewports**

Medição dos *runs* de tinta, coluna PESO isolada:

| | cabeçalho `PESO` | valores (`0,86`…`0,00`) | pixels de coluna em comum |
|---|---|---|---|
| **1440** iter-4 | x 864–890 | x 902–934 | **0** ← o NIT |
| **1440** iter-5 | x **907–933** | x 902–934 | **27** (borda direita coincidente em 933) |
| **768** iter-4 | x 523–549 | x 561–593 | **0** |
| **768** iter-5 | x **567–593** | x 561–593 | **27** (borda direita coincidente em 593) |

O cabeçalho agora é alinhado à direita, exatamente como os números, e as bordas direitas
coincidem no pixel. Era a única das nove colunas cujo cabeçalho não tocava a própria coluna de
dados; deixou de ser.

**Verifiquei o efeito colateral óbvio e ele não é defeito.** Ao andar 43px para a direita, `PESO`
aproximou-se de `REGISTRO TSE`: o vão caiu de 58px para **15px**. Considerei elevar isso a item e
**rejeitei**, por duas medidas: (1) o vão de 15px é *idêntico* ao vão entre os mesmos dois campos
na linha de dados abaixo (`0,86` termina em 933, `BR-07845/2026` começa em 948) — o cabeçalho
passou a espelhar exatamente o espaçamento do conteúdo, que é o comportamento correto; (2) 15px
já era o vão entre `±MoE` e `1ºT` desde a iteração 1, contra 9–10px dos vãos *internos* de rótulo
(`REGISTRO`↔`TSE`, `LEITURA`↔`2ºT`) — ou seja, 15px é vão-entre-colunas estabelecido nesta
tabela, não vão-entre-palavras. Apontar isso seria pedir para desfazer a correção recém-feita.

O ritmo vertical não foi afetado: os separadores das 13 linhas a 1440 medem **61px em todos os 11
passos** (5789, 5850, 5911, … 6460), inclusive nas três linhas de peso baixo — a correção da
iteração 4 continua de pé.

### (a.3) Área de toque dos links «fonte» — **corrigido, e o alvo é de fato invisível**

Duas verificações independentes:

**Nos pixels.** A região dos seis links `fonte` do CONTEXTO SOCIAL é **byte-idêntica** à da
iteração 4 nos três viewports — o diff exaustivo não acusa **um único pixel** ali. O glifo segue
em y3001–3012, x46–72 (27×12 de tinta) a 390. "Sem mover nenhum pixel do layout" confere.

**Na geometria, que é o que o screenshot pode provar.** Um alvo de 46px centrado na caixa de
texto ocuparia y≈2983–3029. Medi os vizinhos: a última linha do parágrafo acima termina em
**y2981** e a borda inferior do cartão está em **y3029**. Ou seja, o alvo encosta nos dois
limites sem cruzar nenhum — não cobre o texto do parágrafo nem vaza para o vão de 20px entre
cartões. 46px é o máximo que cabe ali, e coube.

**E o `×`, a outra metade do NIT.** O NIT das iterações 3 e 4 cobria os links `fonte` **e** os
`×` de remover dos 13 cartões, e o integrador só relatou ter mexido nos primeiros. Como
screenshot não mede área clicável, fui ao código — é a pergunta que os pixels não respondem:

- `src/components/ui/basicos.tsx:58` (`LinkExterno`) — `inline-block px-2.5 py-[15px] -mx-2.5
  -my-[15px]`. Padding 10px/15px compensado por margem negativa idêntica: 27+20 = **47** de
  largura, 16+30 = **46** de altura, com pegada de layout nula. Bate com o 47×46 relatado.
- `src/components/painel/serie-pesquisas.tsx:170` (`×` de remover) — `min-h-toque min-w-toque`,
  e `--spacing-toque: 2.75rem` (**44px**) em `src/app/tokens.css:155`, dentro de `@theme static`,
  então a classe resolve de verdade. O `×` **já era** 44×44; o glifo de 6×6 vive centrado nele.

Portanto o NIT de alvos de toque, aberto desde a iteração 3 como "pedido de medição", está
**fechado nas duas metades**, com medida — não com suposição. (A `/metodologia` usa
`flex min-h-toque` nas entradas de fonte, `metodologia/page.tsx:175` e `:196`: idem.)

---

## (b) Nada regrediu — e a única mudança de dado está explicada

O diff exaustivo contra a iteração 4 devolveu seis regiões. Três são os ajustes acima. As outras
três são a **mesma** causa, que não é regressão:

**Um peso mudou: `0,69` → `0,68` (Datafolha, campo 22/07–24/07).** Aparece na coluna PESO a 1440
e a 768 e no cartão correspondente a 390 — os mesmos dados, três renderizações. Os **outros doze
pesos são idênticos ao pixel**, e `home-*-urna.png` (a manchete inteira: 83%×17%, 88%×12%, ±5,2,
±4,1, o veredito, os contadores 62/83 dias) é **byte-idêntico** nos três viewports.

A explicação fecha: `hojeMs` vem de `Date.now()` (`src/app/_lib/relogio.ts`, o único ponto do
produto que lê o relógio) e o peso é recência com decaimento exponencial contínuo
(`idadeDias = (hojeMs − meioCampo)/864e5`, float — `nucleo.ts:199`). As duas capturas estão a
4 minutos uma da outra, atravessando a meia-noite: cada peso caiu ~0,009%. Isso só vira dígito
diferente para um valor pousado em cima da fronteira de arredondamento — este estava em ≈0,685.
Se fosse defeito de layout ou de modelo, os treze teriam mudado ou nenhum teria. Mudou o único
que estava no fio. **É o modelo respirando, não regressão.**

As demais diferenças são a mesma coisa em forma de sub-pixel: os pontos e a linha da média nos
gráficos de evolução e a curva de sensibilidade deslocaram fração de pixel (maxdelta **12–13** a
390/1440 e 38 a 768, numa escala de 255 — antialiasing, invisível). O ponto de virada
`virada (+4,7)`, o `◆ atual`, os rótulos e os eixos estão no mesmo lugar, conferido em recorte
lado a lado.

### Amostragem dirigida dos itens das iterações 1–4

Fiz a amostragem, mas registro que aqui ela é **redundante por construção**: qualquer regressão
teria aparecido no diff exaustivo, e o diff só tem as seis regiões acima. Confirmado por leitura
direta:

- **Tick `06/08`** — fechado e completo a 390 (`07/01 · 02/05 · 06/08`), 768 (cinco ticks, com
  `05/03` e `29/06`) e 1440 (quatro ticks). Sem corte de glifo.
- **Anotações da curva de sensibilidade a 390** — `sem viés` e `teste-limite +6,3` na primeira
  fileira, `réplica 2022` na segunda. Zero sobreposição, nos três viewports.
- **Traço interrompido sob os rótulos** — a vertical verde some sob `◆ atual` e volta depois, a
  1440, 768 e 390.
- **Institutos** — inteiros a 768 e 1440 (`PODERDATA`…`GENIAL/QUAEST` + `MÉDIA`); a 390
  abreviados com ponto (`PODERD.`, `ATLAS`, `DATAFOL.`) dentro do wrapper com esmaecimento.
  Nenhuma palavra fatiada.
- **REGISTRO TSE a 768** — `BR-07845/2026` … `BR-00835/2026` inteiros nas 13 linhas, coluna do
  `×` visível, tinta máxima em x=751 = borda do cartão.
- **Selo `● disputa principal` simétrico** — linha própria sob Lula **e** sob Flávio a 390;
  na linha do nome nos dois a 768/1440. O `●` nunca fica órfão.
- **Cartões de cenário alinhados** — as três linhas `viés +X,X ⟶ NN%×NN%` no mesmo y a 1440 e
  768, inclusive no cartão 3 de título em duas linhas.
- **Contorno fechado das 9 barras** e **par 83%/17% em mono** — inalterados ao pixel.
- **Cartões dimensionados por conteúdo** — CONTEXTO SOCIAL e REPLAY fecham em alturas distintas,
  sem faixa vazia forçada pela grade.
- **`/historico` e `/metodologia`** — **byte-idênticos** aos das iterações 3 e 4 nos três
  viewports. Os dois estados vazios continuam desenhados e explicando *por que* estão vazios.

## Itens

Nenhum BLOCKER, MAJOR ou MINOR. **Dois NITs**, ambos herdados e ambos já reavaliados duas vezes;
nenhum novo. Os três NITs restantes da iteração 4 foram fechados nesta rodada.

[NIT] `home-1440-replay.png` / `home-768-replay.png` / `home-390-replay.png` (título do bloco) —
critério 11 (microcopy pt-BR consistente) — **mantido, não elevado**. O bloco continua se
chamando **REPLAY 2022 — E SE OS ERROS SE REPETISSEM EXATAMENTE?** enquanto seis strings dentro e
ao redor dele dizem **réplica** (`Réplica 2022 — erro do 2ºT se repete`, `réplica 2022` na
anotação, `aplicar réplica (viés +3,1) ao painel` no botão do próprio bloco,
`CONDICIONAL À RÉPLICA EXATA`, `réplica quase exata do placar real de 2022`, `A réplica fiel`).
Sendo honesto nos dois sentidos: **é o único item do produto objetivamente em desacordo com um
critério da rubrica** — um anglicismo isolado num rótulo, num painel que traduz tudo o mais. Se a
equipe fizer mais uma edição, é esta. Mas continua NIT e não reabre o loop, porque o custo para o
leitor é zero: o subtítulo do próprio bloco explica o conceito, o botão em português está a
poucos pixels do título, e não há outro conceito de "repetir o erro de 2022" na página com que
confundir. Uma string.

[NIT] `home-390-full.png` / `home-768-parametros.png` / `home-1440-parametros.png` (cartão "Pano
de fundo da disputa") — critério 2 (mono só para dados) — **mantido, não elevado**. A fatia mono
segue carregando 30 palavras de narrativa. Reavaliado pela terceira vez: a convenção do bloco
(mono = o que foi apurado, Archivo = o que aquilo significa) está aplicada **igual** nos seis
cartões — o "Calendário que ainda pesa" também traz quatro linhas mono de fatos datados. Não é
inconsistência; é o caso mais longo de uma regra consistente. Mexer aqui seria trocar uma regra
uniforme por um caso especial.

### Encerrados nesta rodada

| NIT da iteração 4 | estado |
|---|---|
| `p.p.` órfão a 390 no bloco de fórmula | **corrigido** — valor+unidade atômicos, 4 linhas, altura inalterada |
| cabeçalho PESO fora da própria coluna | **corrigido** — alinhado à direita, bordas coincidentes a 1440 e 768 |
| alvos de toque (`fonte` **e** `×`) — pedido de medição | **fechado** — `fonte` 47×46 por padding compensado; `×` já era 44×44 (`min-h/w-toque`, token 2.75rem) |

### Não-itens registrados, para não serem re-litigados

- Vão de 15px entre `PESO` e `REGISTRO TSE` no cabeçalho: espelha o vão da linha de dados e o vão
  `±MoE`↔`1ºT` pré-existente. Correto por construção.
- `0,69`→`0,68` da Datafolha: decaimento contínuo de recência sobre fronteira de arredondamento.
- Deslocamentos sub-pixel nos gráficos (maxdelta 12–38 em 255): mesma causa, invisíveis.
- Não existe teste travando os tamanhos de alvo de toque (nenhuma asserção de 44px em `tests/`).
  Registro como observação de cobertura, **não como item**: o comportamento atual está correto e
  medido, e um teste ausente não é melhoria que um usuário perceba.

## Varredura completa da rubrica (14 itens), 390 / 768 / 1440

1. **Primeira dobra em 5s.** ✔ `home-390-urna.png` entrega sem rolar quem lidera
   (`LULA FAVORITO — VITÓRIA PROVÁVEL, NÃO GARANTIDA`), com que chance (`83%`×`17%` projetado,
   `88%`×`12%` hoje) e quão incerto (`±5,2 P.P.` / `±4,1 P.P.`), fechando o veredito em y≈740 de
   844. Idem a 768 (até y≈690 de 1024) e 1440 (até y≈545 de 900).
2. **Hierarquia / mono só para dados.** ✔ com o NIT do "Pano de fundo". Um único elemento
   dominante (a tela da urna); rótulos de seção em mono caixa alta, prosa em Archivo, dados em
   mono. O novo `PESO` alinhado à direita continua no mesmo estilo de cabeçalho das outras oito
   colunas — mudou a âncora, não o tratamento.
3. **Contraste AA.** ✔ Gate axe zero para o DOM; nas amostras fora do alcance do axe (texto em
   SVG, tinta sobre banda) o pixel é idêntico ao da iteração 4, que já media acima do piso. Os
   três ajustes não alteraram nenhuma cor — o `PESO` moveu-se sem mudar de tinta.
4. **Tabelas a 390 / sem scroll acidental.** ✔ Série de pesquisas e histórico viram cartões
   completos; a tabela cruzada de candidatos rola dentro do wrapper com esmaecimento; nenhum
   *full-page* excede a largura do viewport (medido em todos os nove).
5. **Gráficos legíveis a 390.** ✔ Evolução, distribuição (`-10 · 0 · 10 · 20`, `0 · virada`) e
   sensibilidade (`-2…10`, `0%…100%`, anotações em duas fileiras, rótulos com halo) — sem colisão
   nem corte nos três viewports.
6. **Alvos de toque ≥44px.** ✔ **Agora sem ressalva** — era o último item com medição pendente.
   `fonte` 47×46, `×` 44×44, alternador de turno 46px, `+ Adicionar nova pesquisa (simulação)`
   46px, `▶ Compartilhar este cenário` 44px, abas 46px, thumb dos sliders 24px visíveis dentro de
   trilho de 44px (`globals.css:28`), entradas de fonte da `/metodologia` 44px.
7. **Espaçamento por token / ritmo vertical.** ✔ 61px em todos os 11 passos das 13 linhas da
   série a 1440, incluindo as três de peso baixo. Separadores tracejados dos sliders alinhados
   entre colunas a 768 e 1440. O bloco de fórmula a 390 manteve as 4 linhas.
8. **Estados loading/vazio/erro/simulação desenhados.** ✔ `/historico` com os dois cartões vazios
   explicando *por que* estão vazios (borda tracejada); simulação com `+ Adicionar nova pesquisa
   (simulação)` e `↺ Restaurar dados oficiais` visivelmente desabilitado; parâmetros com
   `✓ Parâmetros no padrão`.
9. **Acessibilidade (axe, teclado, foco, reduced-motion).** Gate (axe zero) — não re-julgado. O
   que é visível em print segue consistente; o item 6, que é a parte da acessibilidade que um
   screenshot *pode* endereçar, fechou nesta rodada.
10. **Manchete sem JS, CLS<0,1, LCP<2,5s.** Gate (CLS 0, Lighthouse 94/100/100/100).
11. **Microcopy pt-BR.** ✔ salvo o NIT `replay`/`réplica`. A ordem das 13 pesquisas é idêntica
    entre `metodologia-*-full.png` e a tabela do painel; `registrada (nº n/d na fonte)` aparece na
    mesma string nos dois lugares; `<1%` no lugar do zero absoluto; `±5,2 p.p.` agora inquebrável.
12. **Neutralidade lado a lado.** ✔ Par `Lula … × Flávio …` em linha única e rotulada nos 13
    cartões a 390; selo simétrico nas duas fileiras; os 9 candidatos com o mesmo contorno e a
    mesma escala; nas linhas de peso baixo **os dois** candidatos perdem a cor partidária
    igualmente (conferido nos três cartões `peso baixo` a 390).
13. **Identidade "apuração/urna" disciplinada.** ✔ Exatamente três blocos escuros (tela da urna,
    SÍNTESE DO CONTEXTO, REPLAY 2022), zero gradiente decorativo, zero sombra difusa, zero ícone
    ilustrativo, zero imagem de pessoa ou partido; o cursor em bloco do `NÃO É PREVISÃO▊` segue
    sendo o único adereço.
14. **Console e rede.** Gate (21 e2e com console limpo).

## Veredito

**BLOCKER 0 · MAJOR 0 · MINOR 0 · NIT 2.**

Esta é a **segunda iteração limpa consecutiva**. Os critérios (a) e (b) da parada estão
cumpridos. A contagem de NITs caiu de 5 para 2, e os dois que restam são os mesmos dois que já
sobreviveram a três reavaliações — não porque foram ignorados, mas porque cada um foi examinado e
julgado, com argumento escrito, abaixo do limiar.

---

## Declaração formal sobre o critério (c)

Declaro por escrito, sem ressalva: **não consigo apontar nenhuma melhoria que um usuário real
perceberia.**

Na iteração 4 eu não pude dizer isso — precisei abrir uma exceção para o `p.p.` órfão a 390, que
era visível a olho nu para quem lesse o bloco de fórmula no celular. **Esse item foi corrigido e
verificado nesta rodada, e a exceção caiu.** É a diferença material entre a declaração de agora e
a de então: não é a mesma frase repetida, é uma frase que passou a ser verdadeira.

Sustento a declaração sobre o que medi, não sobre impressão geral:

- O diff pixel a pixel contra a iteração 4 é **exaustivo**, não amostral. Tudo que mudou nos 30
  arquivos cabe em seis regiões, e as seis estão explicadas: três são os ajustes pedidos, três
  são o mesmo decaimento de recência de quatro minutos. **Não existe mudança não explicada.**
- Os três ajustes fazem o que prometiam e nada além: unidade atômica sem alterar a contagem de
  linhas, cabeçalho ancorado na própria coluna sem alterar o ritmo de 61px, alvo de toque
  ampliado com pegada de layout nula comprovada por identidade de bytes.
- O último item da rubrica que dependia de medição fora do screenshot (alvos de toque, critério
  6, aberto desde a iteração 3) foi fechado nas duas metades, com a fonte citada.

Os dois NITs remanescentes não sustentam o loop, e digo por quê em vez de só classificá-los. O
`replay`/`réplica` é a inconsistência mais defensável de se apontar que sobrou no produto — e eu
a aponto —, mas um leitor não perde informação nem hesita: o subtítulo do bloco define o conceito
e o botão em português está encostado no título. A prosa em mono do "Pano de fundo" é a aplicação
uniforme de uma convenção ao seu caso mais longo; trocar isso introduziria um caso especial onde
hoje há regra.

Também registro o que **deliberadamente não escrevi** para não inflar a lista: o vão de 15px
entre `PESO` e `REGISTRO TSE`, que é consequência correta do ajuste (a.2) e espelha o vão dos
dados; a mudança `0,69`→`0,68`; e os deslocamentos sub-pixel dos gráficos. Os três passariam por
"achado" numa leitura desatenta e nenhum é defeito — apontá-los seria pedir para desfazer uma
correção certa ou para congelar o relógio. Qualquer outra coisa que eu acrescentasse aqui seria
re-estilizar o que já passa, proibido pela regra anti-desperdício.

**Recomendação: encerrar o loop da Fase 6.**

O que está sólido e **não** deve ser mexido: os três ajustes desta rodada, a célula de peso em
duas linhas com passo de 61px, o sistema de cor e a comutação de clareza sobre as bandas, os
quatro estados desenhados, a medida da prosa da `/metodologia`, e o par `padding + margem
negativa` do `LinkExterno` — é a solução certa para alvo de toque em link inline e não deve ser
trocada por aumento de fonte ou de padding visível.

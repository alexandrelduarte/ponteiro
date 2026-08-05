# Crítica — iteração v2-7 (7ª de 8)

**Contagem: 1 MAJOR · 2 MINOR · 3 NIT.**
O contador de iterações limpas **continua em zero e nunca começou.**

---

## 0. O que eu de fato li, e o que tive de capturar eu mesmo

Li os 49 PNGs de `.qa/iter-v2-7/` e a `critica.md` da iteração 6.

Antes de julgar, medi a evidência. Duas coisas apareceram:

1. **Dos três prints de popover prometidos, só um existe.** `.qa/iter-v2-7/` tem
   `home-1440-popover.png` e mais nada — não há `home-390-popover.png` nem
   `home-768-popover.png`. O 768 é exatamente o viewport onde morava o MAJOR da
   iteração 6. Em `scripts/qa/screenshots.mjs:146-155` a captura do popover está
   dentro de um `try { … } catch { console.warn(…) }`: quando falha, o arquivo
   simplesmente não nasce e a pasta fica indistinguível de uma pasta correta.
2. **`metodologia-*-full-aberto` e `historico-*-full-aberto` são byte-idênticos aos
   `-full`** (md5 conferido, 6 pares). Isso eu **verifiquei e absolvi**: as duas
   páginas têm `details: 0` e `[aria-expanded="false"]: 0` — `abrirTudo` é um no-op
   legítimo, não há conteúdo escondido nelas. As alturas batem com o DOM
   (metodologia 5698, histórico 2305). Evidência honesta.

Para não julgar o produto pela ausência do print, subi o build de produção
(`next start -p 3100`, o mesmo BUILD_ID `L7BBaC7oOnkovUG4vd_O_` de 19:12 que gerou
esta pasta) e capturei eu mesmo os estados que faltavam, por gesto real. Foi aí
que o MAJOR desta iteração apareceu.

---

## 1. Verificação do conserto MAJOR (popover contido) — **PASSA, e passa bem**

**(a) Larguras dos PNGs = viewport, em todos os 49 arquivos.** Conferido um a um
com `sips`. O único que estourava:

| print | iter-6 | iter-7 |
|---|---|---|
| `home-768-full-aberto.png` | **869**×21320 | **768**×21320 |

Os 31 chips abertos juntos cabem em 768. Nenhum outro arquivo desvia (390→390,
768→768, 1440→1440), incluindo os `historico-*` e `metodologia-*-full-aberto`
novos.

**(b) Um a um, por gesto, que é o estado humano — também passa.** Medi os 30
painéis da home abrindo **um de cada vez**, com `<details>` abertos e esperando o
painel anterior desmontar antes do próximo:

- 390: 30 painéis, `scrollWidth` máx **390**, zero fora do viewport
- 768: 30 painéis, `scrollWidth` máx **768**, borda direita máxima **752** = 768−16 (a goteira pretendida)
- 1440: 30 painéis, `scrollWidth` máx **1440**, zero fora do viewport

O clamp dispara em **11 chips** a 768. Pior caso medido:
`o que é votos válidos`, gatilho em `left=517`, deslocamento **−117,3px**, painel
pousando em 400..752. O sinal e a magnitude são exatamente o trabalho que faltava
(o estouro de +101px da iteração 6). O `md:max-w` morto virou
`calc(100vw-2rem)` vivo e o painel nunca passa de 352px.

Este conserto está **fechado**. Não volto a ele.

## 2. Verificação do conserto MINOR (grid do formulário) — **PASSA**

`items-end` está em `src/components/painel/formulario-pesquisa.tsx:176`. Medido no
DOM com o formulário aberto:

- **768** (`grid-cols-4`, colunas de 145px): fileira 1 com os dois filhos em
  `bottom = −11693`; fileira 2 com os quatro em `−11595`; fileira 3 com os quatro
  em `−11497`. Os rótulos de duas linhas (h=86) e de uma linha (h=67) agora
  **descem do topo** em vez de desalinhar a base.
- **1440** (colunas de 215px): idem, `bottom` = −10456 / −10357 por fileira.
- Os `<input>` compartilham topo e base por fileira (8559–8603, 8657–8701,
  8755–8799). O desnível de 18px acabou.

## 3. Diff dirigido vs iteração 6, fora dos consertos — **limpo**

Diff pixel a pixel (limiar 18) dos 42 arquivos comuns:

- **19 idênticos** (todas as âncoras de hero/frente/virar/simulação/cenário-base
  nos três viewports, `historico-*`, `metodologia-*`).
- **1 mudou de tamanho**: `home-768-full-aberto` 869→768. É o conserto.
- **`home-*-full-aberto`**: 58.025 px a 1440 (0,21%) e 11.284 px a 390 (0,10%),
  concentrados na faixa do formulário e da lista de pesquisas. É o `items-end` e o
  reposicionamento dos painéis. Esperado.
- **Resíduo**: 30 a 531 px (0,001%–0,02%) em `evolucao`, `pesquisas`, `candidatos`
  e `full`. Ampliei 3× o maior deles (`home-1440-evolucao`, y=689–759): é a **fase
  do tracejado da faixa de projeção** caindo meio pixel diferente entre renders.
  Não é mudança de desenho.

**Nada regrediu fora do que foi consertado.** Gates conferidos no
`lighthouse.json` desta pasta: 93/100/100/100, CLS **0**, `errors-in-console` e
`color-contrast` com score 1. LCP 3,3 s é o que segura a performance em 93; com
FCP 0,9 s e CLS 0 eu não abro item por isso.

---

## 4. Achados novos

### `[MAJOR]` home-1440-popover.png, home-{768,1440}-full-aberto.png, + estados 390/768 que capturei — rubrica 3, 4, 6 — `.entra` deixa um `transform` residual que quebra o Revelador dos dois chips mais visíveis do site

**O que se vê nos pixels.**

Em `.qa/iter-v2-7/home-1440-popover.png` (y≈390, x≈510–570), com o popover do chip
`chance` aberto, a palavra **"empate"** — o rótulo da régua do enxame, que está
*atrás* do painel — aparece **impressa por cima do texto da definição**, entre a
1ª e a 2ª linha ("Chance é quantas vezes uma coisa" / "acontece em 100 situações").
As bolinhas do enxame ficam corretamente por baixo; só o rótulo sobe. O mesmo
acontece a 768. E o mesmo já estava, intacto, em
`.qa/iter-v2-6/home-1440-full-aberto.png` — **eu não vi na iteração 6. É falha
minha de leitura, e é a razão pela qual eu não posso tratar "coberto" como
sinônimo de "lido".**

A 390 é pior, e é o que só apareceu quando capturei o gesto real. O painel do
`Revelador` deveria ser, por `docs/DESIGN-V2.md §6.4` e pelo próprio cabeçalho de
`src/components/ui/revelador.tsx:5-9`, "uma FOLHA que sobe do rodapé da tela, com
alça, véu atrás e altura máxima de 85svh". Medido:

| chip | painel medido | esperado | véu medido | véu esperado |
|---|---|---|---|---|
| `o que é chance` | L=16 R=374 **B=413** W=358 | L=0 R=390 **B=844** W=390 | **358×58** | 390×844 |
| `o que é registro no TSE` | L=16 R=374 **B=566** W=358 | L=0 R=390 **B=844** W=390 | **358×186** | 390×844 |

Não é uma folha: é um cartão solto no meio da página, **com a alça de folha
desenhada no topo** (o traço cinza de `revelador.tsx:150`), e **sem véu** — 58px de
faixa cinza no lugar de uma tela inteira escurecida. E ele **cobre a manchete**:
no chip `chance`, o cartão tapa "Em 100 eleições parecidas com esta, Lula é eleito
em 83 e Flávio em 17" — o LCP, a frase que responde "quem está na frente". O leigo
toca uma palavra e a resposta que ele tinha some atrás de um cartão com uma alça
que não puxa nada.

**Causa, medida no DOM, não deduzida.** `src/app/globals.css:77-80`:

```css
.entra { animation: assenta var(--dur-base) var(--ease-padrao) both; }
```

`animation-fill-mode: both` faz persistir o quadro final de `@keyframes assenta`
(`src/app/tokens.css:353-356`), que é `transform: translateY(0)`. Um `transform`
diferente de `none` **cria contexto de empilhamento e vira bloco contentor de
`position: fixed`**. Confirmado por `getComputedStyle` nos dois casos:

```
preso em: P.entra   [matrix(1, 0, 0, 1, 0, 0)]   ← chip "chance", no hero
preso em: DIV.entra [matrix(1, 0, 0, 1, 0, 0)]   ← chip "registro no TSE"
```

Daí as duas manifestações, que são o mesmo defeito: (i) o `z-50` do painel fica
**preso dentro** do parágrafo, e o rótulo "empate" (`enxame.tsx:104-110`, um
`absolute` com `z-index: auto` mais adiante no DOM) passa a pintar por cima;
(ii) o `fixed inset-x-0 bottom-0` e o véu `fixed inset-0` passam a se medir pelo
parágrafo, não pela tela.

**Alcance: 2 de 29 folhas.** As outras 27 estão perfeitas (L=0, R=390, B=844, véu
390×844 — conferido uma a uma). Isso não atenua: são justamente **o primeiro chip
da página**, no parágrafo colado na manchete, e o chip da linha "13 pesquisas de 7
institutos". E a inconsistência é o próprio dano — `§6.4` promete que "o leitor
aprende o gesto uma vez", e aqui o mesmo gesto dá dois resultados diferentes.

**Conserto acionável (uma palavra).** Em `@keyframes assenta`, trocar o quadro
final para `transform: none`:

```css
to { opacity: 1; transform: none; }
```

`none` interpola normalmente a partir de `translateY(-X)` e, com `fill-mode: both`,
o valor computado que sobra é `none` — sem contexto de empilhamento, sem bloco
contentor. Vale igual para `.bolinha`, que usa o mesmo keyframe.

**Aviso — este é o caso em que eu insisto que a verificação seja no estado
humano:** um `full-aberto` com 31 popovers abertos **não** teria pego o item (ii),
e o item (i) esteve dentro dele por duas iterações sem ser visto. A prova tem de
ser o print de cada um dos dois chips, aberto sozinho, nos três viewports.

---

### `[MINOR]` home-768-frente.png — rubrica 6, 11 — o "×" que liga os dois candidatos fica órfão no fim da linha, a 768

Nos dois cartões de "Quem está na frente?", a 768:

```
Lula 46,9%   ×
Flávio 42,2%
```

O "×" termina a primeira linha sozinho, a uns 30px de "46,9%" e separado de
"Flávio" por uma quebra. Deixa de ler como operador entre dois nomes e passa a ler
como glifo perdido — e, para a rubrica 11, o sinal que deveria ser simétrico entre
os dois candidatos passa a pertencer visualmente só ao de cima. Acontece **nos
dois cartões** (2º turno e 1º turno).

É defeito de um breakpoint só: a 390 (`home-390-frente.png`) e a 1440
(`home-1440-frente.png`) a expressão cabe inteira numa linha. É o mesmo padrão que
o próprio código já trata como defeito em `enxame.tsx:93-97` ("deixava o '18' órfão
numa linha sozinha, sem o lado que ele descreve"). O critério da casa já existe;
falta aplicá-lo aqui.

---

### `[MINOR]` `scripts/qa/screenshots.mjs:146-155,126,159` — rubrica 14 (integridade da evidência) — a captura engole a própria falha

Três `try { … } catch { console.warn(…) }` — âncoras, aba candidatos, popover,
estado técnica. Quando o clique falha, **o arquivo não existe e a pasta parece
íntegra**. Foi o que aconteceu aqui: 2 dos 3 prints de popover prometidos não
nasceram, e nada na pasta denuncia isso.

Reproduzi o clique nos três viewports e ele funcionou nas três — ou seja, era
*flake*, não defeito de produto. **É justamente por isso que o `catch` é perigoso:
ele converte instabilidade em "limpo".** Numa iteração cuja única pergunta era "o
popover está contido?", a pasta entregou a resposta em 1 de 3 viewports e não
avisou.

Conserto: a lista de prints esperados vira contrato — ao final, o script confere
que todos os arquivos existem e **sai com código diferente de zero** se faltar um.
Sem isso, eu não consigo distinguir "iteração limpa" de "evidência que não foi
tirada", e essa distinção é o meu critério de parada inteiro.

---

### NITs (não reabrem o loop, por disciplina anti-desperdício)

- `[NIT]` `home-1440-popover.png` — o único print versionado do popover é o do chip
  do hero, que fica **longe da borda direita** e no qual o clamp nem dispara
  (`desloc` = 0). O print que prova o conserto deveria ser o **pior** chip: a 768,
  `o que é votos válidos`, gatilho em `left=517`. O capturador usa
  `[aria-expanded="false"].first()`, que sempre pega o mais fácil.
- `[NIT]` `revelador.tsx:52-64` — o `useLayoutEffect` roda só em `[aberto]`. Se a
  janela for redimensionada com o popover aberto acima de `md`, o deslocamento não
  recalcula. Cenário estreito; anoto e não cobro.
- `[NIT]` `metodologia-1440-tecnica.png` — a coluna de leitura ocupa ~510 dos 1440px
  e o cabeçalho atravessa a largura toda. É medida tipográfica defensável e está
  centrada; registro como observação, não como item.

---

## 5. O contador e a parada — a decisão, com o raciocínio

**Esta iteração não é limpa. O contador segue em 0.**

Eu disse na iteração 6 que o meu critério é **cobertura + estabilidade**, não
releitura. Esta iteração testou essa frase e ela se sustentou — de um jeito
desconfortável para mim:

1. **A fronteira que nomeei era a fronteira certa.** O estado "um popover aberto por
   gesto humano" não era preciosismo: era exatamente onde estava um MAJOR.
2. **Mas ela não foi fechada.** Foi fechada em 1 de 3 viewports, e o capturador não
   avisou. "Fronteira fechada" e "fronteira que parece fechada" são a mesma pasta
   no disco — e é isso que o MINOR do capturador conserta.
3. **E eu errei junto.** A colisão do "empate" estava, legível, em
   `.qa/iter-v2-6/home-1440-full-aberto.png`. Cobertura teve; leitura faltou. Uma
   iteração limpa que dependa de eu ter lido bem 49 prints, sendo que um deles tem
   29.567px de altura, é uma iteração limpa frágil. É por isso que a evidência
   precisa ser **dirigida ao estado suspeito**, não volumosa.

**O que esta iteração significa:** os dois consertos da iteração 6 estão certos e
medidos — o popover está contido nos 30 painéis dos 3 viewports, um a um, e o
formulário está alinhado. O produto não regrediu em lugar nenhum. O que sobra é um
defeito **anterior** a tudo isso, que só a evidência nova conseguiu revelar, mais o
mecanismo que quase o deixou passar de novo.

**O que falta para a parada, dentro do limite de 8 — e o preço que eu aceito pagar.**

Iteração 8 é a última. Meu critério ideal exigiria duas leituras limpas seguidas
sobre cobertura completa; **o orçamento comporta uma.** Então eu declaro o trade
por escrito, em vez de fingir que não existe:

**Aceito UMA leitura limpa na iteração 8 como parada, sob três condições
inegociáveis:**

1. O MAJOR e os dois MINOR acima corrigidos.
2. `scripts/qa/screenshots.mjs` falhando com código ≠ 0 quando um print esperado não
   nasce — para que "limpo" pare de ser ambíguo.
3. Evidência **dirigida**, versionada, e nomeada aqui para eu não ter de garimpar:
   - `home-{390,768,1440}-chip-chance` — o chip do hero, aberto sozinho por clique.
   - `home-{390,768,1440}-chip-tse` — o chip "registro no TSE", idem.
   - `home-768-chip-pior` — o chip `votos válidos` com gatilho em `left≈517`, o de
     maior deslocamento.
   - `home-768-frente` recapturado, com o "×" resolvido.
   - O restante do conjunto atual, sem cortes.

Se a iteração 8 chegar com isso e eu não achar nada, **paro e assino**. Se chegar
sem a condição 2, eu não consigo assinar de forma honesta: a resposta no limite
passa a ser "não verificado", que não é a mesma coisa que "reprovado" — mas
também não é aprovação.

---

## 6. Por que eu não escrevo a minha metade do veredito agora

O veredito a quatro mãos é parte do critério de parada, junto com "quando não
conseguir apontar melhoria que um usuário real perceberia". Eu acabei de apontar
três, e uma delas esconde a manchete do site atrás de um cartão no celular.

Não vou escrever "é bonito" na mesma página em que documento que o gesto-assinatura
do sistema de design não acontece no primeiro chip da home. A minha metade fica
guardada para a iteração 8 — e ela está pronta: as evidências de "é outro produto"
(o terminal preto de `.qa/antes/home-1440-full.png`, com `PRESIDENTE 2026` em
grotesca condensada, rótulos monoespaçados em caixa alta e verde-fósforo, contra a
serifada editorial e o campo bruma de agora), de "é bonito" e de "um leigo entende"
já estão levantadas nos pixels desta pasta. Elas só não são minhas para assinar
enquanto houver um MAJOR aberto.

Uma coisa eu registro desde já, porque é fato de pixel e não muda com o conserto:
**a rubrica 1 está fora de risco por larga margem.** Não sobrou nada da v1 — nem
paleta, nem tipografia, nem motivo visual. Isso nunca mais é o assunto.

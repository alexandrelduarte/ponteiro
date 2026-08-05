# Crítica — ITERAÇÃO 5 do loop v2 (rodada de confirmação)

**Autor:** qa-critic · **Base:** os **39** PNGs de `.qa/iter-v2-5/` — os 36 do conjunto padrão
**mais** as três evidências que eu pedi no fim da iteração 4 (`home-390-full-aberto.png`,
`home-1440-full-aberto.png`, `metodologia-390-tecnica.png`). Lidos contra os 36 de
`.qa/iter-v2-4/`, contra os dois "aberto" de `.qa/iter-v2-3/`, contra `.qa/antes/` (a v1) e contra
a minha própria `.qa/iter-v2-4/critica.md`.

**Gates automáticos** (142 unit + golden · 60 e2e com console limpo · axe zero · Lighthouse
**91/100/100/100** · CLS 0): verdes, **não re-julgados aqui**. A queda 97 → 91 eu confirmei que é
ruído de máquina e não regressão de produto — a prova está abaixo, e é mais forte do que
"a variância já foi demonstrada".

Formato: `[SEVERIDADE] print — critério(nº) — descrição acionável com posição`.
Coordenadas em pixels do PNG citado (origem no topo esquerdo).

---

## Veredito curto, antes de qualquer coisa

**Esta iteração NÃO é limpa. Encontrei 1 MINOR.** O contador de iterações limpas consecutivas
volta a **0 de 2**, e **eu não assino a minha metade do veredito a quatro mãos nesta rodada.**

O MINOR não é regressão: é um defeito que esteve em todas as iterações do v2 e que **eu
diagnostiquei errado duas vezes** — na iteração 3 e na iteração 4 eu olhei exatamente para esse
pixel, atribuí tudo a um artefato de captura e fechei o assunto. Foi a evidência nova que eu mesmo
pedi (o `locale: "pt-BR"` aplicado, e o print mostrando que **nada mudou**) que separou as duas
coisas e expôs a que é de produto. Está detalhado na seção "O MINOR".

Digo isto de saída porque a rodada foi montada para confirmar um fim, e o resultado é o oposto.
Vale registrar o que eu escrevi na iteração 4: *"é exatamente aqui que a tentação de mover a trave
aparece"*. A trave move nos dois sentidos, e classificar isto como NIT para preservar uma sequência
limpa seria exatamente a corrupção que eu nomeei.

---

## Diff dirigido contra a iteração 4 — o que mudou além do relógio?

**Resposta curta: nada. Nem sequer a única coisa que era para ter mudado.**

### 1. Comparação byte a byte dos 36 prints do conjunto padrão

| resultado | quantidade |
| --- | --- |
| PNGs **byte-idênticos** ao da iteração 4 | **25 de 36** |
| PNGs diferentes | 11 |
| prints **novos** (as evidências pedidas) | 3 |

Os 11 diferentes são sempre os mesmos onze: `home-{390,768,1440}-{full,candidatos,pesquisas}` e
`home-{768,1440}-evolucao`. Fui atrás de cada faixa:

| print | pixels alterados | % da imagem | delta máximo | faixas |
| --- | --- | --- | --- | --- |
| `home-390-full` | 567 | 0,0062 % | 15 | y 5 638–5 841 · 17 345–17 374 · 17 423 |
| `home-390-candidatos` | 567 | 0,0058 % | 15 | as mesmas, deslocadas de 1 540 px |
| `home-390-pesquisas` | 226 | 0,0687 % | **4** | y 0–86, x 251–323 |
| `home-768-full` / `-candidatos` | 1 117 | 0,008 % | 42 | y 4 539–4 794 · 12 912–13 043 |
| `home-768-evolucao` / `-pesquisas` | 536 / 908 | 0,07 / 0,12 % | 23 / 42 | recortes das mesmas |
| `home-1440-full` / `-candidatos` | 1 732 | 0,0075 % | 48 | y 4 279–4 562 · 11 824–11 989 |
| `home-1440-evolucao` / `-pesquisas` | 757 / 524 | 0,06 / 0,04 % | 46 / 18 | recortes das mesmas |

Ampliei as faixas e sobrepus os dois estados: são **a vertical do "hoje", as duas bordas do cone
tracejado de projeção e o ponto de cruzamento das duas curvas de sensibilidade**, deslocados por
menos de um pixel. Funções do relógio — as capturas distam ~26 min. Nenhuma faixa toca texto,
número, cor ou caixa.

**Nenhuma mudança de altura em nenhuma das nove páginas:**

| página | iteração 4 | **iteração 5** |
| --- | --- | --- |
| home 390 / 768 / 1440 | 23 338 / 17 423 / 16 065 | **iguais** |
| metodologia 390 / 768 / 1440 | 6 843 / 5 698 / 6 129 | **iguais** |
| historico 390 / 768 / 1440 | 2 977 / 2 305 / 2 276 | **iguais** |

### 2. O commit

`26dad8e` toca **dois arquivos e soma seis linhas**: cinco de comentário em
`seletor-metodologia.tsx:67` (comentário não pinta pixel) e uma de `locale: "pt-BR"` em
`scripts/qa/screenshots.mjs:62`. Bate exatamente com o que foi declarado. Zero mudança de produto.

### 3. Os dois prints "aberto" contra os da iteração 3 — a prova que faltava

A lacuna de evidência nº 1 da iteração 4 era a **segunda camada** (o que os disclosures revelam),
não refotografada desde a iteração 3. Agora ela foi, e a prova é binária:

| print | altura it3 → it5 | pixels alterados | faixas |
| --- | --- | --- | --- |
| `home-1440-full-aberto` | 18 759 → **18 759** | 2 576 (**0,0095 %**) | y 4 752–5 048 · 5 827–5 839 · 13 806–13 971 |
| `home-390-full-aberto` | 29 567 → **29 567** | 772 (**0,0067 %**) | y 6 252–6 466 · 7 557–7 566 · 22 684–22 767 |

Mesma assinatura: cone de projeção e cruzamento das curvas. **A camada revelada não mudou um pixel
que não dependa do relógio, em duas iterações.** Isso é mais forte do que "o código dessas rotas não
foi tocado", que era tudo o que eu tinha na rodada passada. **Lacuna de evidência nº 1: fechada.**

### 4. O Lighthouse 97 → 91 não é regressão, e a prova não é "é ruído"

Comparei o inventário de rede das duas colheitas:

| | iteração 4 | **iteração 5** |
| --- | --- | --- |
| requisições | 30 | **30** |
| script | 12 req · **321 841 B** | 12 req · **321 841 B** (idêntico ao byte) |
| fonte | 2 req · 56 438 B | **56 438 B** (idêntico) |
| CSS | 1 req · 10 849 B | **10 849 B** (idêntico) |
| imagem | 2 req · 2 963 B | **2 963 B** (idêntico) |
| total | 460 483 B | **460 459 B** (−24 B: build id) |
| `benchmarkIndex` da máquina | 2 074 | **2 098** |

Mesma carga, ao byte, nos quatro tipos que importam. O que se mexeu foi LCP 2,6 → 3,4 s e TBT
40 → 100 ms, **com a máquina medindo-se como ligeiramente mais rápida** (`benchmarkIndex` subiu).
Payload constante + score oscilando + índice de máquina descorrelacionado = ruído de laboratório
local, não regressão. **CLS segue 0.** Não abro item.

---

## O MINOR

**[MINOR] `home-390-full-aberto.png`, y 12 276–12 322, x 56–189 — critérios 3, 9 — o campo
`<input type="date">` de "Adicionar uma pesquisa à minha simulação" trunca a própria máscara a
390 px: renderiza `mm/dd/yy` em vez de `mm/dd/yyyy`.**

**A medição.** Ampliei 5× o mesmo campo nos dois viewports fotografados:

| viewport | largura útil do campo | o que o campo mostra |
| --- | --- | --- |
| 1440 | ~220 px (x 726–946) | `mm/dd/yyyy` + ícone de calendário, **com folga** |
| **390** | **133 px** (x 56–189) | **`mm/dd/yy`** + ícone — **os dois últimos glifos somem** |

O campo vive num `grid-cols-2` (`formulario-pesquisa.tsx:172`) e `fim` é o único campo de data,
declarado `largo: false` (`formulario-pesquisa.tsx:26`). A 390 isso dá 133 px, e 133 px não
comportam 10 glifos em `text-corpo` + `px-3` + o botão de calendário do UA. O Chromium descarta os
sub-campos que não cabem.

**Por que isto não é o NIT de ferramenta que eu fechei duas vezes.** Nas iterações 3 e 4 eu vi
`mm/dd/yyyy` no print, fui ao código, achei `lang="pt-BR"` no `<html>` e `locale` faltando no
script de captura, escrevi *"artefato de captura"* e encerrei. Estava certo sobre a **ordem dos
campos** e errado sobre a **largura**. As duas coisas são independentes:

- `mm/dd` vs `dd/mm` → locale. Artefato de captura. Continua sendo NIT (e continua aberto — ver
  abaixo).
- **10 glifos não caberem em 133 px → produto.** `dd/mm/aaaa` tem **exatamente os mesmos 10
  glifos** que `mm/dd/yyyy`. Corrigir o locale **não conserta isto**: o usuário brasileiro vê
  `dd/mm/aa`.

Foi preciso o `locale` ser aplicado e **o pixel não mudar** para eu enxergar que havia duas coisas
ali. É o valor exato da evidência que eu pedi.

**Por que MINOR e não NIT.** Precedente meu: o único MINOR da iteração 3 foi *"~44 px do anel
superior-esquerdo somem atrás da pílula"* — sobreposição cosmética num controle, um viewport, zero
consequência funcional. Isto é **pelo menos tão severo**: é um controle no viewport primário que
some com parte do próprio conteúdo **e** instrui errado — a persona da rubrica ("Android de
entrada") lê um campo que pede ano de dois dígitos. Não consigo ranquear abaixo do MINOR anterior
sem mover a trave.

**Por que MINOR e não MAJOR.** Nada fica impossível: as quatro perguntas do teste do leigo não
passam por aqui; o formulário está atrás de um botão explícito ("Adicionar uma pesquisa (só na
minha simulação)"); o controle continua operável pelo seletor nativo de data; e o **valor** que o
Zod recebe é o valor inteiro — o truncamento é de exibição. Nada oficial é afetado: o que entra
nesse formulário vale só naquela aba.

**Derivação declarada, não medida.** Não tenho print do campo **preenchido**. Como `04/08/2026`
tem os mesmos 10 glifos da máscara, a mesma largura deve truncar o valor para `04/08/20`. É
derivação geométrica pelo número de glifos — digo isso porque é o tipo de coisa que eu cobro dos
outros.

**Conserto no sistema, sem valor mágico:** `largo: true` para `fim` em `formulario-pesquisa.tsx:26`
— o mesmo booleano que `instituto` já usa. O campo passa a ocupar a linha a 390 e vira meia linha
no `md:grid-cols-4`. Uma palavra.

**Onde eu não sei:** o print "aberto" a **768** não existe (só 390 e 1440). A 768 a grade é
`md:grid-cols-4` (~170 px por campo) — não sei se trunca. Fica como lacuna declarada, não julgada.

---

## Itens

### BLOCKER
**Nenhum.**

### MAJOR
**Nenhum.**

### MINOR
**Um** — o campo de data a 390, acima.

### NIT (seis; nenhum deles muda a contagem de severidade)

**[NIT] `scripts/qa/screenshots.mjs:62` — ferramenta — corrigido e INERTE. Provado.** O
`locale: "pt-BR"` entrou, o build rodou, e `home-1440-full-aberto.png` (y 7 350–7 400) mostra o
campo ainda em `mm/dd/yyyy`. Melhor: a região do formulário no `home-390-full-aberto.png` é
**byte-idêntica** à da iteração 3, colhida **antes** do conserto — diferença zero. Causa: a máscara
do `<input type="date">` no Chromium segue a **locale da interface do navegador**, não a do
contexto; `locale` de `newPage()` mexe em `Accept-Language` e `navigator.language` e não naquilo. O
que fecha é `chromium.launch({ args: ["--lang=pt-BR"] })`. Registro para que ninguém marque como
resolvido: **não foi.**

**[NIT] `scripts/qa/screenshots.mjs` — os três prints novos não estão no script.** As três
evidências desta rodada foram colhidas fora do capturador versionado (o script produz 36, e não tem
passo para abrir disclosures nem para o modo "técnica"). A evidência existe e vale; a
**reprodutibilidade** não. Sem isso, a próxima rodada volta a ter as mesmas lacunas.

**[NIT] `src/data/constantes.ts:13-25,60-66` e `src/lib/modelo/derivados.ts:212-213` — critérios
13, 1 — quinta rodada, não corrigido (deliberado).** A paleta v1 continua inteira no dado morto.
**Zero px chegam à tela** — medido de novo abaixo, agora em 39 prints. Fica registrado pelo mesmo
motivo de sempre: o campo morto é o caminho por onde a v1 volta.

**[NIT] tutorial "Como ler esta página", passo 3 — critério 10 — inalterado, e continua
deliberado.** Agora **fotografado** (`home-390-full-aberto.png`, chip em y 2 572–2 603): o passo 3 imprime
`margem de erro ?` enquanto a superfície usa `folga da medida ?`. Continuo contra mudar — o cartão
que esse chip abre começa por *"'Folga da medida' e 'margem de erro' são a mesma coisa"*, e é a
terceira ponte de vocabulário. Deixa de ser derivação de código e passa a ser pixel.

**[NIT] `home-1440-full.png` y 9 958–10 064 e y 14 961–15 083 — critério 6 — os vãos de coluna,
finalmente medidos, e a minha iteração 3 estava errada sobre eles.** Em "As contas, em uma linha
cada" a coluna esquerda fica vazia de y 9 958 (fim do 1º parágrafo) a y 10 064 (início do 3º) —
**106 px**; em "De onde vêm esses números?", de y 14 961 a y 15 083 — **122 px**. Nos dois casos a
altura da linha da grade é ditada pelo item da direita, que é mais alto (a coluna direita corre até
10 044 e 15 052, respectivamente). É artefato de `grid-cols-2`. **Correção do que escrevi na
iteração 3:** eu disse que só apareciam com os disclosures
abertos — **não é verdade, estão nos prints fechados desde sempre**, e eu podia ter medido três
rodadas atrás. Continua NIT: lê como respiro num cartão que já tem folga, e a ordem dos três
parágrafos é auto-evidente pelos rótulos ("Diferença nas pesquisas:", "Dúvida de hoje:", "Dúvida no
dia da votação:"). **Não promovo**, e registro o erro anterior porque a métrica que eu publiquei
estava errada.

**[NIT] `metodologia-390-tecnica.png` — critério 9 — a micro-linha do modo técnico repete 7 vezes.**
`metodologia/page.tsx:68` imprime *"Abaixo, o texto técnico completo — é ele que vale para quem
quiser conferir a conta."* sob **cada** `BlocoMetodo` — sete ocorrências numa página de 8 581 px.
Vista pela primeira vez nesta rodada. **Não peço mudança:** o seletor fica em y 480 de 8 581 (94 %
da página está abaixo dele) e existem links profundos que caem no meio do documento
(`#explicacao-tecnica`, "Ver a fórmula exata na explicação técnica"); sem a linha por bloco, quem
cai no meio não sabe em que camada está. Registro porque é repetição real e visível, e porque a
frase *"é ele que vale"* soa mais dura com a camada simples do que a legenda do seletor
("A simples não tira nada: só troca as palavras difíceis").

---

## Item 1 — ANTI-REGRESSÃO: **PASSA** (quinta vez), e desta vez sem confiar na minha própria lista

Nas rodadas anteriores eu varri "as 18 cores da v1" — uma lista que **eu** tinha escrito. Nesta
rodada derivei a paleta **dos próprios prints do `.qa/antes/`**, por contagem de frequência em
8 páginas da v1, e varri as **24 cores mais frequentes** contra os **39 prints** da iteração 5:

**177 924 534 pixels varridos · 24 cores da v1 · ZERO ocorrências exatas.**

| cor da v1 | exatas | ≤6 na soma dos canais |
| --- | --- | --- |
| `#0E241A` verde-urna · `#0A1A12` · `#0D2319` · `#181C18`* | **0** | 0 / 0 / 0 / 24 |
| `#E6E6DD` · `#E7E7DE` · `#C6C6B8` greige | **0** | 0 |
| `#DFF0E5` · `#D8FBE2` · `#A7EFBB` menta | **0** | 0 |
| `#F7E4D2` areia · `#E4A6AC` rosa · `#63685F` | **0** | 0 |
| `#C4122F` lula-v1 · `#16418C` flavio-v1 · `#1E7A46` · `#1E3A2C` | **0** | 0 |
| `#D96A1B` · `#7C3AED` · `#D96A7A` · `#E8A4AE` | **0** | 0 |
| `#F6F6F0` fundo-v1 | **0** | 26 918 |
| `#F3E7D9` areia-v1 | **0** | 6 404 |
| `#EFEFE6` | **0** | 80 |

Os dois com contagem alta em tolerância eu abri, e são falsos positivos de vizinhança:

- `#F6F6F0`: a cor real dominante nesses pixels é **`(246,246,246)`** — cinza neutro, não o greige
  da v1 (`246,246,240`).
- `#F3E7D9`: as cores reais são `(245,233,215)`, `(244,232,214)`, `(243,231,213)` — degraus de
  antialiasing do cartão âmbar da v2, **`#F8ECDA`**, que dista 11 do tom da v1.

**A paleta que está na tela é outra, e a lista é curta e fechada:** `#FFFFFF` placa · `#EFECF1`
bruma · `#F6F3F7` nicho · `#E2D8E8` lilás · `#F8ECDA` âmbar · `#211C26` tinta · `#5C5566`
tinta-média · `#BE1745` carmim · `#26418B` naval · `#5A3A66` ameixa · `#8F5407` âmbar-texto ·
`#8E8598` contorno.

---

## Amostragem dirigida — o que eu fui conferir, e com que número

### Contraste (critério 7) — calculado, não herdado do axe

| par | razão | veredito |
| --- | --- | --- |
| tinta `#211C26` sobre placa | **16,68:1** | AAA |
| tinta sobre bruma | **14,25:1** | AAA |
| naval `#26418B` sobre placa | **9,50:1** | AAA |
| ameixa `#5A3A66` sobre placa · branco sobre ameixa | **9,41:1** | AAA |
| tinta-média `#5C5566` sobre placa | **7,13:1** | AAA |
| tinta-média sobre nicho `#F6F3F7` | **6,48:1** | AA |
| carmim `#BE1745` sobre placa | **6,18:1** | AA |
| âmbar `#8F5407` sobre placa · sobre bruma | **6,11 / 5,22:1** | AA |
| contorno `#8E8598` sobre bruma (**não-texto**, mín. 3:1) | **3,01:1** | passa, e é o valor que `tokens.css:130` declara |

Alvos de toque: `min-h-toque`/`min-w-toque` aparecem **27 vezes** no `src`, inclusive no `×` de
remover pesquisa (`serie-pesquisas.tsx:112`, com comentário de um alinhamento já consertado). A
pílula do seletor mede **44 px** de altura nos **dois** estados (medido abaixo).

### Honestidade estatística (critério 12) — contagem independente do enxame

Componentes conexos com filtro de área, na região do herói:

| viewport | carmim | naval | soma | diâmetro típico |
| --- | --- | --- | --- | --- |
| 390 | **82** | **18** | **100** | 9 px |
| 768 | **82** | **18** | **100** | 18 px |
| 1440 | **82** | **18** | **100** | 26 px |

O enxame é literalmente 100 bolinhas, e os rótulos dizem 82 e 18. O diâmetro cresce com o viewport
— não é asset esticado. Nada a assinar.

### Contenção (critério 8) — tinta medida em 15 páginas inteiras

| viewport | tinta de x .. x | margem esq / dir |
| --- | --- | --- |
| 390 (5 páginas) | **16 .. 373** | 16 / 16 |
| 768 (4 páginas) | **24 .. 743** | 24 / 24 |
| 1440 (4 páginas) | **220 .. 1219** | 220 / 220 |

Simétrico ao pixel, em todas. **Zero scroll horizontal acidental.** Os dois prints "aberto" saem
dessa caixa por desenho: a 390 o véu da folha é sangria total (x 0..389) e a 1440 o popover
"2º turno" chega a x 1 429 — 11 px da borda da janela, sem clipar e sem estourar (1 429 < 1 440).

Aproveitei para matar de vez uma suspeita antiga: a tabela de pesquisas a 1440 **não está clipada**.
O pixel escuro mais à direita do cabeçalho está em **x 1 183** e a placa termina em **x 1 220** —
37 px de folga. O que parecia régua de contêiner é o antialiasing do `×`.

### O seletor da /metodologia — a derivação da iteração 4, agora medida

Esta era a lacuna de evidência nº 2. `metodologia-390-tecnica.png` fecha.

**Primeiro achado: o trilho é byte a byte o mesmo nos dois estados.** Perfil de aresta lido linha a
linha, idêntico em `metodologia-390-full.png` (simples) e `metodologia-390-tecnica.png` (técnica):

| y | 480 | 484 | 486 | 488 | **490 → 566** | 570 | 573 | 579 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| x esquerdo | 30 | 22 | 20 | 18 | **16 (77 linhas retas)** | 18 | 20 | 30 |
| x direito | 359 | 367 | 369 | 371 | **373** | 371 | 369 | 359 |

Raio 16 = `--radius-nicho`. O pixel de borda em (530, 16) é **exatamente `#8E8598`**, com um único
pixel de meia cobertura ao lado.

**Segundo: o anel é contínuo.** Varri as **100 linhas** do trilho (y 480–579) procurando alguma sem
traço de anel à esquerda, nos dois estados: **zero**. O perímetro fecha inteiro.

**Terceiro — o que era derivação e agora é medição.** A pílula da **segunda** linha (estado
"técnica") ocupa y 532–575, altura **44 px**, x 20..210. Folga pílula ↔ anel, linha a linha:

| trecho | y | folga |
| --- | --- | --- |
| topo da pílula | 532–545 | 25 → 6 px |
| **trecho reto do trilho** | **552–555** | **4 px (mínimo)** |
| início do arco inferior | 566–570 | 8 → 10 px |
| base da pílula | 573–575 | 13 → 20 px |

A folga mínima é **4 px**, **igual à da primeira linha** (4 px em y 504), e no canto inferior
esquerdo — o canto que eu não tinha — ela **cresce** de 8 para 20 px, porque a pílula recua mais
rápido do que o trilho arqueia. **A derivação geométrica da iteração 4 estava certa, e agora é
pixel. Lacuna de evidência nº 2: fechada.**

### Releitura das regiões de sempre

| região | print | estado |
| --- | --- | --- |
| dobra 390 | `home-390-hero.png` | intacta. **Byte-idêntico nas iterações 3, 4 e 5** (md5 `22b4ae10…`), nos três viewports |
| tabela → cartão a 390 | `home-390-full.png` y 12 000–14 400 | as 13 pesquisas viram cartões com nome, período, peso, dois números, barra e registro TSE |
| cruzada de candidatos → cartão a 390 | `home-390-candidatos.png` y 9 950–10 800 | os 9 nomes viram cartões "média X% · ver por instituto"; a 768 vira linha; a 1440 vira tabela de 8 colunas |
| régua dos 9 candidatos | `home-{390,768,1440}-candidatos` | régua fixa 0–50 %, tique de 25 % no mesmo x, líder **sem** barra cheia (41,4 % numa régua até 50 %), 1º e 2º nas cores de partido e os outros sete em neutros |
| /metodologia sem cartão | `metodologia-{390,768,1440}-full` + `-tecnica` | prosa direto sobre a bruma, zero cartão na coluna, nos quatro |
| /historico honesto | `historico-{390,768,1440}-full` | os dois estados vazios são nomeados: "Ainda não há pesquisas suficientes…" e "Nenhuma mudança registrada até agora." Nada de gráfico falso |
| rodapé único | as três páginas | um bloco "Antes de sair", três parágrafos, idêntico nas três |
| segunda camada (aberto) | `home-{390,1440}-full-aberto` | a 390 os verbetes sobem como **folha com alça e véu**; a 1440 como **popover ancorado** com "Fechar". Mesmo componente, mesmo gesto |

---

## Teste do leigo — 4 de 4, terceira vez

**Persona:** homem de 47 anos, ensino fundamental incompleto, Android de entrada, dados contados.
`home-390-hero.png` é **byte-idêntico nas iterações 3, 4 e 5**: são literalmente os mesmos pixels
julgados três vezes. Reli assim mesmo.

1. **"Quem está na frente?"** — "O Lula. *Lula é eleito em **83** e Flávio em **17***, e o montão
   de bolinha vermelha tá do lado que diz **82 · Lula na frente →**." **PASSA.**
2. **"É certeza?"** — "Não: em 17 de cada 100 ganha o outro, e tá escrito *'Isto não é
   previsão'*." **PASSA.**
3. **"Isso pode mudar até a eleição?"** — "Pode: ***até outubro isso ainda pode mudar***, com letra
   grossa, antes da dobra." **PASSA.**
4. **"O que é margem de erro?"** — "***folga da medida — a margem de erro***, em negrito na
   primeira vez que aparece; e em **Metodologia** é o primeiro verbete, com exemplo de 45 a 49."
   **PASSA.**

**Critério 2: PASSA inteiro, terceira rodada seguida.** O MINOR desta rodada não toca nenhuma das
quatro respostas.

---

## Varredura final da rubrica de 14 itens

| # | critério | veredito | como sei |
| --- | --- | --- | --- |
| 1 | anti-regressão vs v1 | **PASSA** (5ª) | 24 cores da v1, derivadas do `.qa/antes/`, **0 exatas** em 177,9 M px |
| 2 | teste do leigo | **PASSA** (4/4, 3ª) | acima; herói byte-idêntico em três rodadas |
| 3 | craft dos gráficos | **PASSA com 1 MINOR fora do gráfico** | enxame ×3, evolução ×3, sensibilidade ×3, cápsulas-exemplo, barras dos 9, faixa de desfecho. O MINOR é de formulário |
| 4 | microinterações / 60 fps | **fechado** (auditado na it. 3) | nada de movimento mudou desde então |
| 5 | dobra responde em 5 s | **PASSA** | herói 390, banda a banda |
| 6 | hierarquia tipográfica | **PASSA** | manchete serifada domina; escala consistente nos três viewports; os dois vãos de coluna seguem NIT |
| 7 | contraste / alvo / foco / axe | **PASSA** | tabela de razões acima, calculada por mim; 27 usos de `min-h-toque`; pílula 44 px nos dois estados; axe zero é gate |
| 8 | cartões a 390 / sem scroll | **PASSA** | tinta 16..373 · 24..743 · 220..1219 em 15 páginas; tabela de pesquisas e cruzada de candidatos viram cartões |
| 9 | linguagem simples | **PASSA com 1 MINOR** | dez títulos-pergunta, 13 verbetes, 17 chips em 10 termos, glossário idêntico nos dois modos. O MINOR: a máscara truncada instrui errado |
| 10 | marca consistente | **PASSA** com a ressalva de sempre | wordmark PONTEIRO + "Para onde apontam as pesquisas" nas três páginas; favicon e OG existem no código e **não aparecem em print** — quarta rodada declarados, não julgados |
| 11 | neutralidade | **PASSA** | 83/17 no mesmo peso; um carmim e um naval; identidade em ameixa (terceira cor); os dois primeiros marcados "disputa principal" com o mesmo chip |
| 12 | honestidade estatística | **PASSA — nada a assinar** | 82+18=100 contados por componentes conexos nos três viewports; régua fixa 0–50 %; nenhum eixo truncado; os dois estados vazios do /historico são nomeados |
| 13 | tokens | **PASSA** | raio 16 = `--radius-nicho`; anel `#8E8598` = `--color-contorno`; nenhum valor mágico novo |
| 14 | console e rede | **gate** | 60 e2e com console limpo; carga idêntica ao byte à da iteração 4 |

---

## Suspeitas que morreram na verificação, e que eu NÃO filei

Cinco. A regra anti-desperdício vale nos dois sentidos — e numa rodada em que eu já filei um MINOR,
a tentação inverte: fica barato empilhar mais um.

1. **"A tabela de pesquisas está clipada a 1440."** Terceira vez que essa impressão volta. Medida:
   texto até x 1 183, placa até x 1 220 — **37 px de folga**. O que parece régua é antialiasing do
   `×`. Não é defeito.
2. **"Cinco popovers abertos ao mesmo tempo, sobrepondo conteúdo e uns aos outros"** (visível nos
   dois prints "aberto"). Fui ao `revelador.tsx`: o estado é local e há `pointerdown` fora que
   fecha. Um toque real no segundo chip fecha o primeiro. A captura abriu por `click()`
   programático, que não dispara `pointerdown` — **estado inalcançável por gesto humano**. Artefato
   de captura. Não é defeito, e digo para que ninguém "conserte" o que não existe.
3. **"O cartão do Lula na lista de candidatos a 390 é mais baixo que os outros oito."** É: "Lula" é
   curto e cabe numa linha; os outros oito quebram em duas. Fluxo de texto correto. Forçar quebra
   seria valor mágico. Passei por isso em três rodadas e não vou filar agora.
4. **"O popover a 1440 chega a 11 px da borda da janela."** Chega — e não clipa, não rola e não
   estoura (tinta máxima 1 429 < 1 440). Popover é camada de sobreposição, não conteúdo de página:
   precisa caber na tela, e cabe. Sem evidência de falha, especular sobre um gatilho mais à direita
   é exatamente o desperdício que a regra proíbe.
5. **"O rodapé é um cartão numa página que baniu cartão."** Mesma resposta da iteração 3: §5.7 fala
   da coluna de leitura, não do chrome do site. Não é defeito.

---

## Lacunas de evidência (declaradas, não julgadas)

1. **Não existe `home-768-full-aberto.png`.** Não sei se o campo de data trunca também a 768
   (`md:grid-cols-4`, ~170 px por campo). O MINOR está filado com a medição que eu tenho: 390.
2. **Nenhum print mostra o campo de data preenchido.** O truncamento do valor é derivação por
   contagem de glifos, não medição.
3. **Favicon e OG continuam sem aparecer em print.** Quarta rodada declarados, não julgados.

---

## Veredito

| severidade | it. 1 | it. 2 | it. 3 | it. 4 | **it. 5** |
| --- | --- | --- | --- | --- | --- |
| **BLOCKER** | 2 | 0 | 0 | 0 | **0** |
| **MAJOR** | 12 | 4 | 0 | 0 | **0** |
| **MINOR** | 13 | 8 | 1 | 0 | **1** |
| **NIT** | 6 | 5 | 4 | 5 | **6** |
| **total** | 33 | 17 | 5 | 5 | **7** |

- **Item 1 (anti-regressão): PASSA**, quinta vez, agora com a paleta derivada do próprio `.qa/antes/`.
- **Critério 2 (teste do leigo): 4 de 4**, terceira vez.
- **Critério 12: nada a assinar.**
- **Regressões: zero.** 25 de 36 prints byte-idênticos; os 11 restantes diferem só em pixels do
  relógio; as nove alturas de página inalteradas; os dois "aberto" inalterados desde a iteração 3;
  carga de rede idêntica ao byte.
- **As duas lacunas de evidência da iteração 4: fechadas**, as duas com medição.
- **1 MINOR novo**, que não é regressão e sim um defeito antigo que eu classifiquei errado duas
  vezes.

### Contador de iterações limpas: **0 de 2**

O critério (b) — duas limpas consecutivas — **não está cumprido**, e portanto **o critério (c) não
se abre**. **Não escrevo a minha metade do veredito a quatro mãos nesta rodada.** Não é preciosismo
de contador: eu me recuso a assinar "é bonito" na mesma página em que acabei de medir um controle
que come dois glifos do próprio conteúdo no viewport primário. Assino quando não estiver medindo
isso.

### Declaração anti-desperdício (obrigatória)

Na iteração 4 eu declarei, por escrito, que não conseguia apontar melhoria que um usuário real
perceberia. **Essa declaração estava errada, e a evidência que a derrubou foi a que eu mesmo
pedi.** Registro o erro em vez de reescrever a história: eu olhei três vezes para o campo de data,
parei na primeira explicação que servia e não medi a largura.

Feita essa correção, mantenho o resto da declaração e a torno condicional de novo, com o mesmo
compromisso da rodada passada:

> Fora o campo de data a 390, **não consigo apontar nenhuma melhoria que um usuário real
> perceberia.** Se a iteração 6 corrigir esse campo — e **só** esse campo — e os prints voltarem
> byte-idênticos fora dele, eu declaro a rodada limpa e **assino a minha metade do veredito a
> quatro mãos**, sem nenhuma derivação pendente.

Procurei nos lugares onde eu tinha mais chance de achar, e não achei mais nada: o controle
consertado na iteração 4 (quatro cantos, dois estados, medidos em vez de derivados), a camada
revelada inteira nos dois viewports "aberto", o modo técnico da /metodologia visto pela primeira
vez, as onze faixas de pixel que mudaram na home, e as cinco suspeitas acima — das quais **quatro**
eu poderia ter filado se quisesse engrossar a lista, e nenhuma sobreviveu à medição.

### Próxima iteração — ordem de ataque

1. **Obrigatório, e é uma palavra:** `largo: true` no campo `fim`
   (`src/components/painel/formulario-pesquisa.tsx:26`). Fecha o MINOR.
2. **Recomendado, ferramenta:** `chromium.launch({ args: ["--lang=pt-BR"] })` em
   `scripts/qa/screenshots.mjs` — é isso, e não o `locale` do contexto, que muda a máscara. E
   colocar no script os **três prints** que hoje são colhidos à mão (os dois "aberto" e o
   "técnica"), **mais** um `home-768-full-aberto.png`, que é a lacuna que sobrou.
3. **Opcional, não conta para o veredito:** `constantes.ts` / `derivados.ts:212-213` — tirar a
   paleta v1 do dado morto.

E nada mais. Qualquer mudança além destas três é risco sem contrapartida — e eu seria o primeiro a
filar a regressão que ela causasse.

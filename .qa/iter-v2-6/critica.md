# Crítica — ITERAÇÃO 6 do loop v2 (a rodada que eu mesmo especifiquei)

**Autor:** qa-critic · **Base:** os **40** PNGs de `.qa/iter-v2-6/` — os 36 do conjunto padrão,
os **três** `home-{390,768,1440}-full-aberto` e `metodologia-390-tecnica`. Lidos contra os **39** de
`.qa/iter-v2-5/`, contra `.qa/antes/` (a v1), contra o commit `11b0cfb` e contra a minha própria
`.qa/iter-v2-5/critica.md`.

**Gates automáticos** (142 unit + golden · 60 e2e com console limpo · axe zero · Lighthouse
**92/100/100/100** · CLS 0): verdes, **não re-julgados aqui**.

Formato: `[SEVERIDADE] print — critério(nº) — descrição acionável com posição`.
Coordenadas em pixels do PNG citado (origem no topo esquerdo).

---

## Veredito curto, antes de qualquer coisa

**O conserto que eu pedi está feito, correto e completo nos três viewports.**

**E a rodada NÃO é limpa: encontrei 1 MAJOR e 1 MINOR.**

O MAJOR está no **40º print** — `home-768-full-aberto.png`, que não existia até esta rodada porque
**eu o pedi no fim da iteração 5** ("mais um `home-768-full-aberto.png`, que é a lacuna que
sobrou"). Ele é 869 px de largura num viewport de 768: **101 px de estouro horizontal**, causado por
um toque só, num popover do glossário. É o pior achado desde a iteração 2.

**Contador de iterações limpas: 0 de 2. Não declaro a parada. Não assino a minha metade do veredito
a quatro mãos.** O raciocínio sobre o contador — que é o núcleo do que me foi perguntado — está na
seção "O contador, e por que a segunda leitura dos mesmos pixels não vale a primeira leitura de
pixels novos".

Registro de saída, porque é o padrão que importa: **é a segunda rodada seguida em que a evidência
que eu mesmo exigi derruba um fim que eu mesmo tinha pré-declarado.** Na iteração 5 foi o `locale`
aplicado; nesta foi o print a 768. Duas vezes não é coincidência — é um sinal sobre onde os defeitos
moram.

---

## 1. Contagem e diff dirigido

### 1.1 O inventário

| | iteração 5 | **iteração 6** |
| --- | --- | --- |
| conjunto padrão | 36 | **36** |
| prints "aberto" | 2 (390, 1440) | **3 (390, 768, 1440)** |
| estado "técnica" | 1 | **1** |
| **total** | **39** | **40** |

Nenhum print desapareceu. O que entrou foi exatamente o que faltava.

### 1.2 Byte a byte, os 39 prints em comum

| resultado | quantidade |
| --- | --- |
| **byte-idênticos** à iteração 5 | **26 de 39** |
| diferentes | 13 |
| novos | 1 |

Os 13 diferentes se separam em dois grupos limpos:

**(a) Os mesmos 11 de sempre — só relógio.** `home-{390,768,1440}-{full,candidatos,pesquisas}` e
`home-{768,1440}-evolucao`. É a **mesma lista** que a iteração 5 isolou, e as faixas são as mesmas
três assinaturas:

| assinatura | onde (1440) | o que é |
| --- | --- | --- |
| y 4279–4574 · x 910–1158 | gráfico de evolução | a vertical do "hoje" e as duas bordas do cone tracejado |
| y 11824–11989 · x 307–882 | sensibilidade | o cruzamento das duas curvas e o ponto preto |
| y 14029–14038 · x 403–439 | faixa de desfecho | o tique de "empate" |

Ampliei e sobrepus as três. Verificado a olho e por recorte: geometria de gráfico deslocada por
menos de um pixel, **nenhuma toca texto, número, cor ou caixa**. Total: 1 701 px em 23,1 M no print
de 1440 — **0,0074 %**.

**(b) Os 2 prints "aberto" que contêm o formulário** — `home-{390,1440}-full-aberto`. Além das
faixas do relógio acima, mudam **só a região do formulário**: a 390, y 12 247–12 678; a 1440,
y 7 339–7 601. Fora dessas duas janelas, os dois prints são **byte-idênticos** à iteração 5 em
toda a sua extensão (29 567 e 18 759 px de altura).

### 1.3 Nenhuma altura de página mudou

| página | it. 5 | **it. 6** |
| --- | --- | --- |
| home 390 / 768 / 1440 | 23 338 / 17 423 / 16 065 | **iguais** |
| home aberto 390 / 1440 | 29 567 / 18 759 | **iguais** |
| metodologia 390 / 768 / 1440 / técnica | 6 843 / 5 698 / 6 129 / 8 581 | **iguais** |
| historico 390 / 768 / 1440 | 2 977 / 2 305 / 2 276 | **iguais** |

O reflow do formulário **não empurrou um pixel** do que vem depois dele. Isso é forte: o conserto
custou zero deslocamento de layout.

### 1.4 O commit

`11b0cfb` toca **dois arquivos**: `formulario-pesquisa.tsx` (`largo: false → true` no campo `fim`,
mais 2 linhas de comentário) e `scripts/qa/screenshots.mjs` (`--lang=pt-BR` no `launch`, o helper
`abrirTudo`, os 3 prints "aberto" e o "técnica" versionados). **Zero mudança de produto além da
palavra `true`.** Bate exatamente com o declarado.

### 1.5 O `--lang=pt-BR` não teve efeito colateral

A preocupação legítima era uma locale de UI mexer em texto renderizado pelo app. Fui conferir o
lugar mais exposto — os rótulos de data do eixo do gráfico de evolução (`home-1440-full.png`,
y 4 550–4 590): **`04/08` e `25/10`, byte-idênticos** à iteração 5. O app já formatava em pt-BR por
conta própria; a bandeira só alcançou o controle nativo, que era o alvo. Nada mais mudou.

### 1.6 Resposta direta ao item (b) do que me foi pedido

> *"diff dirigido de TODO o resto (fora do formulário e do relógio, byte-idêntico?)"*

**Sim — para os 39 prints que já existiam.** Fora do formulário e do relógio, os 39 são
byte-idênticos. A condição que eu escrevi está cumprida **na letra**.

**E é insuficiente**, porque o conjunto cresceu para 40 e o 40º print reprova. A seção seguinte é
sobre ele.

---

## 2. O conserto — verificado, e correto nos três viewports

### 2.1 A máscara

| viewport | it. 5 | **it. 6** |
| --- | --- | --- |
| 390 | **`mm/dd/yy`** (truncada) | **`dd/mm/yyyy`** |
| 768 | *(não fotografado)* | **`dd/mm/yyyy`** |
| 1440 | `mm/dd/yyyy` | **`dd/mm/yyyy`** |

As **duas** coisas que eu tinha separado na iteração 5 fecharam de uma vez: a **largura** (o MINOR,
com `largo: true`) e a **ordem** (o NIT de ferramenta, com `--lang=pt-BR` no `launch` — e era
mesmo o `launch`, não o `locale` do contexto, exatamente como eu tinha diagnosticado). O usuário
brasileiro agora lê `dd/mm/aaaa`.

### 2.2 A geometria — a minha derivação, medida

Eu tinha escrito: *"o campo passa a ocupar a linha a 390 e vira meia linha no `md:grid-cols-4`"*.
Medido nas bordas `#8E8598`:

| viewport | it. 5 | **it. 6** | confere? |
| --- | --- | --- | --- |
| 390 (`grid-cols-2`) | 113 px (x 66..178) | **258 px (x 66..323) — linha inteira** | ✔ |
| 768 (`md:grid-cols-4`) | — | **265 px (x 417..681) — 2 de 4 colunas** | ✔ |
| 1440 (`md:grid-cols-4`) | 195 px (x 282..476) | **422 px (x 736..1157) — 2 de 4 colunas** | ✔ |

O rótulo "Último dia da pesquisa \*", que a 390 quebrava em duas linhas, agora cabe em **uma**. Os
10 glifos têm folga em todos os viewports. **MINOR da iteração 5: fechado, com medição.**

### 2.3 A derivação que ficou pendente na iteração 5

Eu tinha declarado, sem print: *"como `04/08/2026` tem os mesmos 10 glifos da máscara, a mesma
largura deve truncar o valor"*. Continua sem print de campo **preenchido** — mas a pergunta perdeu o
objeto: em 258 px a máscara de 10 glifos ocupa x 66..200 e sobra folga até x 323. Um valor de 10
glifos cabe pela mesma aritmética que a máscara. **Derivação encerrada por construção**, não por
medição direta.

---

## 3. O MAJOR

> **[MAJOR] `home-768-full-aberto.png` — critérios 8, 9, 3 — o popover do glossário não conhece a
> borda da tela: a 768 px ele estoura o viewport em até 101 px, um toque só, e a página inteira
> ganha rolagem horizontal.**

### 3.1 A prova, em uma linha

**O PNG tem 869 px de largura num viewport de 768.** `fullPage` do Playwright captura
`document.scrollWidth`. Um print de 869 px a 768 **é** a medida do estouro: **101 px**.

Os outros dois "aberto" fecham a comparação e mostram que não é a captura:

| print | largura da imagem | viewport | tinta | veredito |
| --- | --- | --- | --- | --- |
| `home-390-full-aberto` | **390** | 390 | x 0..389 | folha de rodapé, sangria total **por desenho** — OK |
| `home-1440-full-aberto` | **1440** | 1440 | x 220..1429 | cabe, com 11 px de sobra |
| **`home-768-full-aberto`** | **869** | **768** | **x 24..868** | **estoura 101 px** |

### 3.2 O mecanismo, lido no código e confirmado no pixel

`src/components/ui/revelador.tsx:121-126`:

```
"md:absolute md:inset-x-auto md:top-full md:bottom-auto md:left-0 md:mt-2",
"md:w-[22rem] md:max-w-[80vw] md:rounded-bloco",
```

De `md` para cima o painel é `position: absolute; left: 0` **em relação ao próprio gatilho**, com
largura fixa de `22rem`. **Não há flip, não há colisão, não há clamp.** Logo:

> `direita_do_popover = esquerda_do_chip + 352`, e ele estoura sempre que
> `esquerda_do_chip > largura_do_viewport − 352`.

Medi a largura do painel em dois popovers independentes do print a 768: **x 408..759 = 352 px** e
**x 517..868 = 352 px**. `22rem` = 352 px. A fórmula é exata.

**E o guarda que existe é código morto.** `md:max-w-[80vw]` só morderia se `80vw < 352`, ou seja
abaixo de **440 px** de viewport — e abaixo de 768 o componente nem é popover, é folha
(`md:hidden` / `fixed inset-x-0 bottom-0`). **`md:max-w-[80vw]` não tem efeito em nenhum viewport
onde o popover existe.** A intenção de conter estava escrita e nunca rodou.

### 3.3 Por que isto **não** é o artefato de captura que eu absolvi na iteração 5

Na iteração 5 eu absolvi, por escrito, o estado de "cinco popovers abertos ao mesmo tempo": o
capturador abre por `click()` programático, que não dispara `pointerdown`, e portanto **a
sobreposição entre popovers é inalcançável por gesto humano**. Isso continua verdadeiro — e **não
absolve isto**, porque cada popover é `absolute; left: 0` **no seu próprio gatilho**: a borda
direita dele depende **só** da posição do chip dele. Abrir aquele chip sozinho põe o painel no mesmo
lugar.

E eu não preciso do print "aberto" para provar: **medi os chips no print fechado padrão**
(`home-768-full.png` — zero artefato de captura, o mesmo print que existe desde a iteração 1),
detectando o contorno âmbar `#8F5407`:

| chip | posição no print **fechado** | popover resultante | estouro |
| --- | --- | --- | --- |
| `2º turno ?` | x 500..594 · y 1 207 | x 500..851 | **+84 px** |
| `votos válidos ?` | x 433..546 · y 2 439 | x 433..784 | **+17 px** |
| `viés ?` | x 466..521 · y 9 826 | x 466..817 | **+50 px** |
| `votos válidos ?` | x 517..654 · y 15 037 | x 517..**868** | **+101 px** |

**4 dos 18 chips do glossário da home estouram a 768 — 22 %.** E o fecho do argumento: o pior deles
termina em **x 868**, e o print "aberto" tem **869 px** de largura. O `scrollWidth` do documento é
determinado, ao pixel, por **um** chip. Não sobra espaço para "é a captura".

### 3.4 O que o usuário vê

A 768, tocando `votos válidos ?` (y 15 037): o painel de 352 px abre com **251 px dentro da tela e
101 px fora** — some **29 % da largura de cada linha** da definição, e a página inteira ganha barra
de rolagem horizontal. O verbete `votos válidos` é uma das definições mais longas do glossário
(11 linhas a 768). O botão `Fechar` fica na borda esquerda do painel, então dá para fechar — a
pessoa não fica presa, mas **lê pela metade ou rola de lado**.

O critério 8 não é ambíguo: *"nenhum scroll horizontal acidental"*. Isto é scroll horizontal
acidental, na página inteira, disparado por um toque numa peça de UI normal, num viewport real.

### 3.5 Severidade — por que MAJOR e não MINOR

Comparo com o meu próprio livro-caixa. Os dois MINORs que eu emiti no v2 foram: *"~44 px do anel
somem atrás da pílula"* (it. 3) e *"a máscara do campo de data perde 2 glifos"* (it. 5). Nos dois,
**nada de conteúdo saiu da tela** — era sobreposição cosmética e placeholder truncado, dentro da
caixa.

Aqui **prosa pública sai do viewport**, a caixa arrebenta e a página passa a rolar de lado. É uma
falha de **contenção**, não de acabamento — categoria acima. Não consigo ranquear isto como MINOR
sem esvaziar a palavra.

**Por que não BLOCKER.** O critério 1 (anti-regressão) passa; não é "o mesmo produto". E as quatro
perguntas do teste do leigo **não** passam por estes quatro chips — conferi um a um: `2º turno`,
`votos válidos`, `viés` e `votos válidos`. O chip de `folga da medida` (a pergunta 4) fica a
x 47..130 a 390 e nenhum dos 18 chips que estouram é ele. A pessoa continua conseguindo responder às
quatro perguntas.

### 3.6 O raio de alcance, medido (para não pedir conserto onde não há defeito)

| superfície | chips | estouram | observação |
| --- | --- | --- | --- |
| home a **768** | 18 | **4** | o MAJOR |
| home a **1440** | 24 | **0** | passa — mas o chip mais à direita fica a **10 px** do limite (1 078 contra 1 088). É sorte da diagramação, não contenção. |
| home a **390** | 18 | — | folha de rodapé, imune por desenho |
| `/metodologia` 768 e 1440 | **0** | 0 | o glossário ali é lista de verbetes em prosa, não chip |
| `/historico` 768 e 1440 | **0** | 0 | idem |

**Confinado à home, a 768.** Digo isto explicitamente para que ninguém mexa em `/metodologia` nem em
`/historico` por causa deste item.

### 3.7 Conserto

O problema é **posição**, não largura — mexer em `w-[22rem]` não resolve. O painel precisa saber
onde está a borda da janela. O `useEffect` que já roda no `abrir` (`revelador.tsx:52`) é o lugar:
medir `gatilhoRef.current.getBoundingClientRect().left` e aplicar um deslocamento
`min(0, innerWidth − gutter − 352 − left)` no `style.left`. Sem valor mágico novo: o `352` é o mesmo
`22rem` da classe e o gutter é o que a página já usa (24 px a 768, medido). Alternativa mais limpa
se o alvo de browsers permitir: `position-area` / `position-try-fallbacks: flip-inline`.

E **apagar `md:max-w-[80vw]`** ou torná-lo real — hoje ele mente sobre uma proteção que não existe.

---

## 4. O MINOR

> **[MINOR] `home-390-full-aberto.png` y 12 442–12 678 — critérios 3, 6 — o reflow do formulário
> desalinhou duas linhas de campos: caixas vizinhas ficam 18 px fora de esquadro.**

Bordas medidas nos dois estados, a 390:

| linha do formulário | it. 5 (topos) | **it. 6 (topos)** |
| --- | --- | --- |
| 1 — instituto | 12 189 (linha inteira) | 12 189 (linha inteira) |
| 2 | 12 286 ‖ 12 286 | **12 268 — data, linha inteira** |
| 3 | 12 382 ‖ 12 382 | 12 364 ‖ 12 364 |
| 4 | 12 460 ‖ 12 460 | **12 460 ‖ 12 442 → 18 px de desnível** |
| 5 | 12 539 ‖ 12 539 | 12 539 ‖ 12 539 |
| 6 | 12 635 (sozinho) | **12 617 ‖ 12 635 → 18 px de desnível** |

**Na iteração 5 as seis linhas estavam alinhadas ao pixel. Na iteração 6, duas de seis não estão.**

**A causa** (`formulario-pesquisa.tsx:174-181`): a célula é
`<div class={largo ? "col-span-2" : ""}>` com `<label class="mb-1 block">` seguido de `<input>`, num
`grid` de `align-items: stretch`. Quando os dois rótulos da linha quebram em número diferente de
linhas, o input desce junto. Na ordem antiga os pares casavam por sorte (2 linhas com 2 linhas,
1 com 1); a data virar linha inteira deslocou o pareamento em um e descasou dois pares.

**Eu tenho que ser honesto sobre a autoria deste defeito, e ela não é do commit.** Fui medir o mesmo
formulário a 1440 na **iteração 5**: `y 7 359 ‖ 7 379` e `y 7 538 ‖ 7 558` — **duas linhas
desniveladas em 20 px, já lá**, no print que eu li e aprovei. A 768 (v6): 19 px, duas linhas. O
desnível é uma propriedade latente da grade que **eu fotografei e deixei passar em duas rodadas**. O
commit não o criou; trouxe-o para o viewport primário.

Contagem de linhas desniveladas, para não haver dúvida sobre regressão:

| viewport | it. 5 | it. 6 |
| --- | --- | --- |
| 390 | **0** | **2** |
| 768 | *(sem print)* | 2 |
| 1440 | **2** | **2** |

**Por que MINOR e não NIT.** É exatamente a comparação que eu me obriguei a fazer na iteração 5: o
meu MINOR da iteração 3 foi 44 px de um anel sumindo atrás de uma pílula — um controle, um viewport,
zero consequência. Isto é um desnível de 18–20 px entre caixas vizinhas, **nos três viewports**, num
formulário que o critério 3 exige que pareça editorial e não default de biblioteca. Não consigo
ranquear abaixo daquele sem mover a trave.

**Por que MINOR e não MAJOR.** Nada sai da tela, nada fica ilegível, nenhuma pergunta do leigo passa
por aqui, e o formulário é opcional e fica atrás de um botão.

**Conserto, uma classe e sem valor mágico:** `items-end` no `grid` da linha 174, **ou**
`flex h-full flex-col justify-end` na célula da linha 178. Os inputs têm todos a mesma altura
(`min-h-toque`), então alinhar pelo pé alinha tudo.

---

## 5. NITs (cinco; nenhum muda a contagem de severidade)

**[NIT] `scripts/qa/screenshots.mjs` — reprodutibilidade: RESOLVIDO.** Os três prints "aberto" e o
"técnica" saíram da mão e entraram no capturador versionado, e o 768 que faltava entrou junto. O
NIT que eu abri na iteração 5 fecha. Registro com nome: **foi essa correção de ferramenta que
produziu o MAJOR desta rodada.**

**[NIT] `screenshots.mjs:46-58` (`abrirTudo`) — o capturador congela um estado inalcançável.** O
helper faz `querySelectorAll('[aria-expanded="false"]').forEach(el => el.click())`, e `click()`
programático não dispara o `pointerdown` que `revelador.tsx:69` usa para fechar os vizinhos. O print
mostra 5 popovers abertos ao mesmo tempo — estado que nenhum dedo produz. Continua **útil** (é assim
que a segunda camada é auditada) e continua **precisando de legenda**, para que ninguém "conserte" a
sobreposição. Isto **não** contamina o MAJOR: aquele eu medi no print fechado.

**[NIT] `src/data/constantes.ts:13-25,60-66` e `src/lib/modelo/derivados.ts:212-213` — critérios 13,
1 — sexta rodada, não corrigido (deliberado).** A paleta v1 continua inteira no dado morto. **Zero
px chegam à tela** — remedido abaixo, agora sobre 40 prints. Fica registrado pelo mesmo motivo de
sempre: o campo morto é o caminho por onde a v1 volta.

**[NIT] tutorial "Como ler esta página", passo 3 — critério 10 — inalterado, deliberado.**
`home-390-full-aberto.png`, chip em y 2 572–2 603: o passo imprime `margem de erro ?` enquanto a
superfície usa `folga da medida ?`. Continuo contra mudar — o cartão que o chip abre começa por
*"'Folga da medida' e 'margem de erro' são a mesma coisa"*, e é a terceira ponte de vocabulário.

**[NIT] favicon e OG — critério 10 — quinta rodada declarados, não julgados.** Existem no código,
não aparecem em nenhum dos 40 prints. Não invento veredito sobre pixel que não vi.

*(Retiro da lista o NIT dos vãos de coluna a 1440 e o da micro-linha repetida do modo técnico: os
prints são byte-idênticos aos da iteração 5, o julgamento de lá continua valendo e repeti-lo aqui
seria engordar a lista sem informação nova.)*

---

## 6. Item 1 — ANTI-REGRESSÃO: **PASSA** (sexta vez)

Repeti a varredura da iteração 5 — as **24 cores mais frequentes da v1**, derivadas por contagem de
frequência dos próprios prints do `.qa/antes/` — agora sobre os **40** prints:

**196 451 614 pixels varridos · 24 cores da v1 · ZERO ocorrências exatas.**

Inclui o print novo a 768 e as regiões de formulário que mudaram. Nada da v1 voltou por nenhuma
porta. A paleta na tela continua sendo a lista curta e fechada da v2: `#FFFFFF` placa · `#EFECF1`
bruma · `#F6F3F7` nicho · `#E2D8E8` lilás · `#F8ECDA` âmbar · `#211C26` tinta · `#5C5566`
tinta-média · `#BE1745` carmim · `#26418B` naval · `#5A3A66` ameixa · `#8F5407` âmbar-texto ·
`#8E8598` contorno.

---

## 7. Contenção (critério 8) — a medição que expôs o MAJOR

Tinta medida nas 13 páginas inteiras:

| viewport | tinta de x .. x | veredito |
| --- | --- | --- |
| 390 (5 páginas: home, home-aberto, metodologia, metodologia-técnica, historico) | **16 .. 373** (aberto: 0..389, folha) | simétrico ao pixel |
| 768 (3 fechadas) | **24 .. 743** | simétrico ao pixel |
| 1440 (4) | **220 .. 1219** (aberto: até 1 429, cabe) | simétrico ao pixel |
| **768 aberto** | **24 .. 868 num viewport de 768** | **REPROVA — o MAJOR** |

Doze de treze passam com margem exata. A décima terceira é a que só existe desde hoje.

---

## 8. Teste do leigo — 4 de 4, quarta vez

`home-390-hero.png` é **byte-idêntico nas iterações 3, 4, 5 e 6**. Reli assim mesmo, com a persona
(homem de 47 anos, fundamental incompleto, Android de entrada, dados contados):

1. **"Quem está na frente?"** — *"O Lula. Tá escrito **'Em 100 eleições parecidas com esta, Lula é
   eleito em 83 e Flávio em 17'**, e o montão de bolinha vermelha tá do lado que diz **82 · Lula na
   frente →**."* **PASSA.**
2. **"É certeza?"** — *"Não: **'Isto não é previsão'**, e em 17 de cada 100 ganha o outro."*
   **PASSA.**
3. **"Isso pode mudar até a eleição?"** — *"Pode: **'até outubro isso ainda pode mudar'**, com letra
   grossa, antes da dobra."* **PASSA.**
4. **"O que é margem de erro?"** — *"**'folga da medida — a margem de erro'**, em negrito na
   primeira vez; e em Metodologia é o primeiro verbete."* **PASSA.**

**Critério 2: PASSA inteiro, quarta rodada seguida.** Nem o MAJOR nem o MINOR tocam qualquer das
quatro respostas — verifiquei chip a chip.

---

## 9. Varredura final da rubrica de 14 itens

| # | critério | veredito | como sei |
| --- | --- | --- | --- |
| 1 | anti-regressão vs v1 | **PASSA** (6ª) | 24 cores da v1, **0 exatas** em 196,5 M px, 40 prints |
| 2 | teste do leigo | **PASSA** (4/4, 4ª) | herói byte-idêntico em quatro rodadas; os 4 chips do MAJOR não são o de "folga da medida" |
| 3 | craft dos gráficos | **PASSA com 1 MINOR fora do gráfico** | enxame ×3, evolução ×3, sensibilidade ×3, barras dos 9, faixa de desfecho — todos intactos. O MINOR é o esquadro do formulário |
| 4 | microinterações / 60 fps | **fechado** (auditado na it. 3) | nada de movimento mudou desde então |
| 5 | dobra responde em 5 s | **PASSA** | herói 390, banda a banda |
| 6 | hierarquia tipográfica | **PASSA com 1 MINOR** | manchete serifada domina; escala consistente. O desnível de 18 px é o MINOR |
| 7 | contraste / alvo / foco / axe | **PASSA** | tabela de razões da it. 5 vale (pixels idênticos); axe zero é gate; `min-h-toque` no input de data e no `Fechar` do popover |
| 8 | cartões a 390 / **sem scroll horizontal** | **REPROVA — MAJOR** | 12 de 13 páginas simétricas ao pixel; `home-768-full-aberto` é 869 px num viewport de 768 |
| 9 | linguagem simples | **PASSA com ressalva do MAJOR** | dez títulos-pergunta, 13 verbetes, 18 chips, glossário íntegro nos dois modos — mas a 768 quatro chips entregam a definição pela metade |
| 10 | marca consistente | **PASSA** com a ressalva de sempre | wordmark PONTEIRO nas três páginas; favicon e OG **não aparecem em print** — quinta rodada declarados, não julgados |
| 11 | neutralidade | **PASSA** | 83/17 no mesmo peso; um carmim e um naval; identidade em ameixa |
| 12 | honestidade estatística | **PASSA — nada a assinar** | enxame, régua fixa 0–50 %, nenhum eixo truncado, estados vazios nomeados — todos byte-idênticos à rodada auditada |
| 13 | tokens | **PASSA com nota** | nada de mágico novo; mas `md:w-[22rem]` / `md:max-w-[80vw]` em `revelador.tsx` são valores crus, e o segundo é inerte (ver §3.2) |
| 14 | console e rede | **gate** | 60 e2e com console limpo |

**BLOCKER: 0 · MAJOR: 1 · MINOR: 1 · NIT: 5.**

---

## 10. O contador, e por que a segunda leitura dos mesmos pixels não vale a primeira leitura de pixels novos

Me foi posto o raciocínio a considerar, e ele merece resposta direta em vez de um "não" seco:

> *a iteração 4 era limpa exceto por um defeito que existia mas não estava fotografado; a 6
> byte-idêntica-fora-do-conserto é a segunda leitura dos mesmos pixels.*

A premissa factual está certa e eu a confirmei nesta rodada: fora do formulário e do relógio, os 39
prints são byte-idênticos. Se o conjunto fosse fechado, o argumento fecharia com ele.

**O que o derruba é que o conjunto não é fechado — e quem o abriu fui eu.** No fim da iteração 5 eu
escrevi, como item 2 da ordem de ataque, que faltava `home-768-full-aberto.png`. Ele foi feito. É o
40º print. **Ele reprova.**

Daí sai a objeção de fundo ao contador na forma em que eu o escrevi. Ele conta **repetições**, e
repetição de pixel idêntico tem informação **zero**: eu li `home-390-hero.png` quatro vezes,
byte-por-byte o mesmo arquivo, e a quarta leitura não me ensinou nada que a primeira não tivesse
ensinado. O que muda veredito é **cobertura**. E o histórico do v2 é inequívoco sobre isso:

| rodada | o que eu pedi de evidência nova | o que a evidência nova produziu |
| --- | --- | --- |
| 4 → 5 | os "aberto" refotografados + o `locale` aplicado | **1 MINOR** (máscara truncada) que existia desde a iteração 1 e que eu tinha diagnosticado errado **duas vezes** |
| 5 → 6 | `home-768-full-aberto.png`, "a lacuna que sobrou" | **1 MAJOR** (101 px de estouro) que existe desde que o `Revelador` foi escrito |

**Duas por duas.** Toda vez que a superfície fotografada cresceu, ela devolveu um defeito antigo — e
nenhuma das vezes o defeito era regressão. Isso não é azar: é a descrição de onde os defeitos moram.
Eles moram no que ainda não foi fotografado. Um contador que premia reler os mesmos pixels está
medindo a coisa errada, e nesta rodada ele teria me feito assinar "é bonito" numa página que rola de
lado a 768.

E ainda há fronteira. Nomeio-a para que a próxima rodada não tenha que adivinhar: **não existe
nenhum print com um popover só aberto** (todos os "aberto" trazem cinco de uma vez, por `click()`
programático); não existe `metodologia-{768,1440}-tecnica`; não existe nenhum "aberto" de
`/metodologia` nem de `/historico`. O MAJOR desta rodada mora exatamente nesse tipo de buraco.

**Decisão.** O critério (b) — duas limpas consecutivas — **não está cumprido**; o contador vai a
**0 de 2**; **o critério (c) não se abre**; e **eu não assino a minha metade do veredito a quatro
mãos.** Esta é a **6ª de 8** iterações; restam duas.

Não é preciosismo de contador. Eu me recuso a assinar *"é bonito"* na mesma página em que acabei de
medir uma barra de rolagem horizontal que aparece quando a pessoa toca em `votos válidos ?`. Assino
quando não estiver medindo isso.

### Declaração anti-desperdício (obrigatória)

Na iteração 5 eu escrevi, por extenso: *"se a iteração 6 corrigir SÓ esse campo e os prints voltarem
byte-idênticos fora dele, declaro a rodada limpa e assino sem nenhuma derivação pendente."* **A
condição foi cumprida na letra e eu não vou honrar a promessa** — porque na mesma página eu também
pedi um print que não existia, e ele veio com um MAJOR. A promessa tinha um defeito de construção:
prometia fechar com base num conjunto que ela própria mandava abrir. Prefiro registrar o defeito da
minha promessa a fingir que ele não existe para poder assinar.

Fora o MAJOR e o MINOR acima, **não consigo apontar nenhuma melhoria que um usuário real
perceberia.** Procurei onde tinha mais chance: as 13 faixas de pixel que mudaram (todas relógio ou
formulário), o formulário inteiro nos três viewports, os 18 chips do glossário a 390/768 e os 24 a
1440, a contenção nas 13 páginas, o glossário de `/metodologia` e `/historico` a 768 e 1440, e os
rótulos de data do eixo. **Quatro suspeitas morreram na verificação e eu não as filei** (§11).

---

## 11. Suspeitas que morreram na verificação, e que eu NÃO filei

A regra anti-desperdício vale nos dois sentidos — e numa rodada em que já filei um MAJOR fica barato
empilhar mais.

1. **"O `--lang=pt-BR` mudou texto renderizado pelo app."** Medido no lugar mais exposto: os rótulos
   `04/08` e `25/10` do eixo de evolução a 1440 são **byte-idênticos** à iteração 5. O app já
   formatava em pt-BR sozinho. Não é defeito.
2. **"O reflow do formulário empurrou a página."** Não empurrou: as **onze** alturas de página são
   idênticas, e nos dois prints "aberto" tudo abaixo de y 12 678 (390) e y 7 601 (1440) é
   byte-idêntico. Não é defeito.
3. **"O popover a 1440 também estoura."** **Não estoura**: 0 de 24 chips passam do limite de 1 088,
   e a imagem tem exatamente 1 440 px. Registro a fragilidade (o chip mais à direita fica a 10 px do
   limite) **dentro** do MAJOR, e não abro item separado — sem estouro medido, seria especulação.
4. **"O glossário de `/metodologia` tem o mesmo problema."** Medido: **zero chips** com contorno
   âmbar em `metodologia-{768,1440}-full` e em `historico-{768,1440}-full`. Ali o glossário é lista
   de verbetes em prosa. Não é defeito, e digo para que ninguém mexa nessas páginas.
5. **"Cinco popovers sobrepostos."** Mesma resposta da iteração 5, e ela continua de pé: `click()`
   programático não dispara `pointerdown`; um dedo real fecha o anterior. Artefato de captura. **A
   sobreposição não é defeito; o estouro é — e eu provei o estouro sem usar este print.**

---

## 12. Lacunas de evidência (declaradas, não julgadas)

1. **Nenhum print com um único popover aberto**, nos três viewports. O MAJOR está provado por
   geometria a partir do print fechado, mas a fotografia direta ainda falta.
2. **Nenhum "aberto" de `/metodologia` e de `/historico`**, e nenhum `metodologia-{768,1440}-tecnica`.
3. **Nenhum print do campo de data preenchido** — encerrada por aritmética em §2.3, não por medição.
4. **Favicon e OG** continuam fora de qualquer print. Quinta rodada.

---

## 13. Veredito

| severidade | it. 1 | it. 2 | it. 3 | it. 4 | it. 5 | **it. 6** |
| --- | --- | --- | --- | --- | --- | --- |
| **BLOCKER** | 2 | 0 | 0 | 0 | 0 | **0** |
| **MAJOR** | 12 | 4 | 0 | 0 | 0 | **1** |
| **MINOR** | 13 | 8 | 1 | 0 | 1 | **1** |
| **NIT** | 6 | 5 | 4 | 5 | 6 | **5** |
| **total** | 33 | 17 | 5 | 5 | 7 | **7** |

- **O conserto pedido está feito e verificado** nos três viewports, nas duas dimensões (largura e
  locale), sem custo de layout.
- **Item 1 (anti-regressão): PASSA**, sexta vez, 196,5 M px.
- **Critério 2 (teste do leigo): 4 de 4**, quarta vez.
- **Critério 12: nada a assinar.**
- **Regressões de produto: zero.** 26 de 39 byte-idênticos; os 13 restantes só relógio e formulário;
  as onze alturas de página inalteradas.
- **1 MAJOR e 1 MINOR**, nenhum deles regressão: os dois são defeitos antigos que a evidência nova
  desta rodada revelou — o MAJOR nunca tinha sido fotografado, o MINOR eu tinha fotografado a 1440
  e deixado passar.

### Contador de iterações limpas: **0 de 2** · parada **não** declarada · veredito **não** assinado

### Próxima iteração (7ª de 8) — ordem de ataque

1. **Obrigatório — o MAJOR:** clampar o popover à borda da janela em `revelador.tsx` (medir o
   gatilho no `useEffect` que já existe e deslocar o `left`), e matar ou tornar real o
   `md:max-w-[80vw]` inerte.
2. **Obrigatório — o MINOR:** `items-end` no `grid` de `formulario-pesquisa.tsx:174` (ou
   `flex h-full flex-col justify-end` na célula da linha 178). Uma classe.
3. **Ferramenta, e é o que fecha a fronteira:** um print por viewport com **um** popover aberto (por
   `dispatchEvent` de `pointerdown`, não `click()`), e os "aberto" de `/metodologia` e `/historico`.
4. **Opcional, não conta para o veredito:** `constantes.ts` / `derivados.ts:212-213` — tirar a
   paleta v1 do dado morto (sexta rodada).

E nada mais. Qualquer mudança além destas é risco sem contrapartida — e eu seria o primeiro a filar
a regressão que ela causasse.

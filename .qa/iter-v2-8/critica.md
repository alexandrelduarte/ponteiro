# Crítica — iteração v2-8 (8ª de 8, LIMITE DURO)

**Contagem: 1 MAJOR (herdado, NÃO corrigido) · 1 MINOR (novo) · 2 NIT.**
O contador de iterações limpas **continua em zero.**

**A leitura NÃO é limpa. O loop para aqui pelo limite, não por aprovação.**
Não assino o veredito a quatro mãos. As pendências honestas para o
RELATORIO-REDESIGN estão na seção 6.

---

## 0. O que li, e como cobri os 58 prints

Li os 58 PNGs de `.qa/iter-v2-8/`, a `critica.md` da iteração 7, e medi antes de
julgar. Três medidas de integridade da evidência, primeiro:

**(a) Larguras = viewport nos 58 arquivos.** Conferido um a um. `390→390`,
`768→768`, `1440→1440`, sem exceção. Nenhum estouro horizontal (rubrica 8).

**(b) O conjunto entregue é exatamente o conjunto prometido.** Derivei a lista do
próprio `scripts/qa/screenshots.mjs` (14 prints por viewport + 1 só a 768 + 5 das
outras páginas = 19+20+19) e ela fecha em **58**. Nada falta.

**(c) 9 dos 58 são duplicatas byte a byte — 49 imagens distintas.** Seis são os
pares `metodologia-*` e `historico-*` (`full` ≡ `full-aberto`), que eu já
**verifiquei e absolvi** na iteração 7: `abrirTudo` é no-op legítimo nessas
páginas. As outras **três são novas e valem nota**:

```
home-390-popover.png  ≡ home-390-chip-chance.png   (bc581a24…)
home-768-popover.png  ≡ home-768-chip-chance.png   (ca5ceba1…)
home-1440-popover.png ≡ home-1440-chip-chance.png  (fbe37980…)
```

O `[aria-expanded="false"].first()` do print `popover` **é** o chip `chance`. O
print `popover` nunca foi um segundo estado — sempre foi o mesmo. Isso confirma o
NIT que abri na iteração 7 e tem uma consequência que uso adiante.

**Cobertura, declarada:** diff pixel a pixel (limiar 18) dos 49 arquivos comuns
com a iteração 7 → **34 idênticos**. Esses 34 eu já havia lido integralmente na
pasta anterior e nada neles mudou um pixel. Li com olhos novos os **9 prints
novos** (`chip-*`) e os **15 que mudaram**, e localizei cada banda alterada. É
cobertura completa, e digo como foi feita para que ninguém precise confiar na
minha palavra.

---

## 1. Condição 1 — o MAJOR e os dois MINOR

### 1a. MAJOR (`transform: none` no keyframe `assenta`) — **FALHOU. E a culpa é minha.**

O conserto foi aplicado com fidelidade. Está no fonte
(`src/app/tokens.css:353-360`) e está no CSS **compilado** que gerou esta pasta
(`.next/static/chunks/1uy4po3mqxhhv.css`, build `52feHWxnLBXfDslc4pbpt` de 19:48,
prints de 20:03–20:05):

```css
@keyframes assenta{0%{opacity:0;transform:translateY(calc(var(--desloc-entrada)*-1))}
                   to{opacity:1;transform:none}}
```

**E não mudou absolutamente nada.** Medido no build de produção, no mesmo gesto:

```
anc P.entra.mt-2.max-w-texto -> transform=matrix(1, 0, 0, 1, 0, 0) | anim=assenta/both
```

O `transform` computado no ancestral continua sendo a **matriz identidade** — que
é exatamente o que ele era antes, com `translateY(0)`. Continua criando contexto
de empilhamento e bloco contentor de `position: fixed`.

**Por quê. Isolei a semântica num caso mínimo, fora do produto:**

| quadro final | fill-mode | `transform` computado |
|---|---|---|
| `transform: none` | `both` | `matrix(1, 0, 0, 1, 0, 0)` |
| `transform: translateY(0)` | `both` | `matrix(1, 0, 0, 1, 0, 0)` |
| `transform: none` | **`backwards`** | **`none`** |

Interpolar *para* `none` significa interpolar para a **matriz identidade**: o
valor computado que `fill-mode: both` persiste é uma matriz, nunca a palavra-chave.
`none` e `translateY(0)` no quadro final são a **mesma coisa**, byte a byte.

Eu escrevi na iteração 7, com confiança e em negrito, que `none` deixaria "o valor
computado `none` — sem contexto de empilhamento, sem bloco contentor". **Isso está
errado.** Prescrevi um conserto de uma palavra que era um no-op semântico, o
implementador aplicou exatamente o que eu pedi, e o defeito atravessou intacto
para a última iteração do loop. O custo desta iteração é meu.

**A prova em pixels, que dispensa qualquer argumento de CSS:**

```
md5 .qa/iter-v2-7/home-1440-popover.png  fbe3798044f95025b74994b5e0f81b24
md5 .qa/iter-v2-8/home-1440-popover.png  fbe3798044f95025b74994b5e0f81b24
```

**Byte-idêntico.** O print do MAJOR não mudou um único pixel entre as duas
iterações.

**Manifestação (i) — a colisão, ainda lá.** Ampliei 3× `home-768-chip-chance.png`
e 2,6× `home-1440-chip-chance.png`: a palavra **"empate"** continua impressa
**por cima do texto da definição**, entre "Chance é quantas vezes uma coisa" e
"acontece em 100 situações". A 1440 ela cai no meio do painel, colidindo com as
descidas da primeira linha. Geometria exata:

| | painel | rótulo "empate" | sobreposição do rótulo |
|---|---|---|---|
| 768 | `[248,315,600,556]` | `[242,382,292,401]` | `[248,382,292,401]` = 44×19 px |
| 1440 | `[457,347,809,625]` | `[527,416,579,436]` | inteiro dentro = 52×20 px |

**Manifestação (ii) — a folha a 390, com os mesmos números da iteração 7.**
Varri os **31 gatilhos** da home a 390: **19 folhas corretas, 2 quebradas**:

| chip | painel medido | esperado | véu | esperado |
|---|---|---|---|---|
| `chance` | `[16,164,374,413]` | `[0,…,390,844]` | **358×58** | 390×844 |
| `registro no TSE` | `[16,292,374,566]` | `[0,…,390,844]` | **358×186** | 390×844 |

São **os mesmos quatro números da iteração 7**. Zero progresso. Confirmei nos
pixels que não há véu: os cantos de `home-390-chip-chance.png` medem
`[239,236,241]`, idênticos ao baseline sem popover — a tela não escurece. É um
cartão solto no meio da prosa, com a alça de folha desenhada no topo e sem véu, e
no chip `chance` ele **tapa a manchete** — o LCP, a frase que responde "quem está
na frente" (rubrica 2 e 5).

**E `prefers-reduced-motion: reduce` não salva:** repeti a varredura com
`reduce` e o resultado é idêntico, 2 quebradas com a mesma geometria. Com
`--desloc-entrada: 0` o quadro `from` vira `translateY(0)` e a interpolação
continua produzindo matriz.

**Manifestação (iii) — NOVA, e é a pior: o painel perde o toque.** Isto eu não
tinha medido antes. Como o painel está preso no contexto de empilhamento do
parágrafo, a **fileira da régua do enxame** atravessa o painel inteiro:

| | sobreposição da fileira sobre o painel |
|---|---|
| 768 | `[248,382,600,402]` → **352×20 px, a largura inteira do painel** |
| 1440 | `[457,416,809,436]` → **352×20 px, a largura inteira do painel** |

Nessa faixa, `elementFromPoint` devolve um elemento de **fora** do painel. E
`aoTocarFora` (`revelador.tsx:80-85`) fecha o painel para qualquer `pointerdown`
que não esteja dentro dele. Testei o clique de verdade, nos dois viewports:

```
768px  toque em (451,381) — sobre o texto da definição — painel continua aberto? false
1440px toque em (660,415) — sobre o texto da definição — painel continua aberto? false
```

**O leitor toca na definição que está lendo e a definição desaparece.** Não é mais
só feio: o gesto-assinatura do sistema de design se desfaz na mão de quem o usa.

**O conserto, agora com a prova junto.** Duas opções, e eu recomendo a primeira:

1. **Portal.** Renderizar véu e painel com `createPortal(…, document.body)`. Um
   overlay `position: fixed` não pode depender da árvore em que o gatilho mora.
   Isso mata as três manifestações de uma vez, é imune a *qualquer* ancestral
   transformado que apareça no futuro, e de quebra conserta o NIT 2 abaixo.
2. **Paliativo de uma linha**, se houver pressa: `.entra { animation-fill-mode:
   backwards }` (`globals.css:77-80`). Provado acima: devolve `none`. Como o
   quadro final (`opacity:1; transform:none`) é idêntico ao estado natural do
   elemento, não há salto visual. Vale igual para `.bolinha`
   (`globals.css:88-91`). **Mas é paliativo**: remove o bloco contentor de hoje e
   não impede o próximo.

Desta vez não peço que se acredite em mim: a tabela de três linhas da semântica
está acima e é reproduzível em 10 linhas de HTML.

### 1b. MINOR (o "×" órfão do placar) — **PASSA**

`frente.tsx:73-81,146-148`: o "×" viaja preso ao segundo nome dentro de um
`flex … whitespace-nowrap`. Verificado nos pixels, recortando a mesma região nas
duas pastas:

- iteração 7: `Lula 46,9%   ×` / `Flávio 42,2%` — o "×" morre sozinho no fim da linha.
- iteração 8: `Lula 46,9%` / `× Flávio 42,2%` — o operador abre a linha de
  continuação, colado ao nome que ele descreve.

Vale nos **dois** cartões (2º e 1º turno) e é defeito de um breakpoint só:
`home-390-frente.png` e `home-1440-frente.png` seguem **byte-idênticos** à
iteração 7, como deviam. O "×" agora indenta "Flávio" em relação a "Lula" — é a
convenção tipográfica correta para expressão quebrada, e não abro item por isso.
**Fechado.**

### 1c. MINOR (o capturador engolindo a própria falha) — **PASSA**

`screenshots.mjs:46-52,231-234`: contador `falhou()` e `process.exitCode = 1`.
Todas as capturas nomeadas ou são incondicionais (e um erro derruba o processo) ou
estão num `catch` que incrementa o contador. **Não existe mais o estado "print
sumiu e a pasta parece íntegra".** E pagou o preço dele já nesta rodada, como
relatado: acusou 5 faltas, expôs o `goto`/`networkidle` que nunca resolvia depois
do `abrirTudo`, e a captura final saiu com zero falhas. **Fechado.**

---

## 2. Condição 2 — capturador com falha dura — **CUMPRIDA**

Cumprida, e provou o próprio valor. Registro uma diferença honesta do que pedi:
implementaram **contagem de falhas**, não o **manifesto positivo de arquivos** que
eu descrevi ("ao final, o script confere que todos os arquivos existem"). Na
prática as duas coisas coincidem hoje — derivei a lista do script e ela fecha em 58.
Não coincidem num caso: um `getByText().first()` que case com o **elemento errado**
tira o print do lugar errado, com sucesso, e nada acusa. Fica como NIT 1.

## 3. Condição 3 — evidência dirigida — **CUMPRIDA na entrega**

Todos os prints que nomeei existem: `home-{390,768,1440}-chip-{chance,tse}`,
`home-768-chip-pior`, `home-768-frente` recapturado, e o conjunto anterior sem
cortes. **E foi ela que fechou a questão** — a manifestação (iii), o toque que
fecha o painel, só apareceu porque havia um print de cada chip aberto sozinho.
A fronteira que nomeei na iteração 7 era mesmo a fronteira certa.

Duas notas de qualidade da evidência:

- O `home-768-chip-pior.png` faz o trabalho que eu pedi: o painel de `votos
  válidos` pousa em `[163,533]..[508,928]`, **dentro** do viewport. O clamp da
  iteração 6 está vivo e correto no pior caso. **Confirmado.**
- O print `popover` é duplicata do `chip-chance` nos três viewports (seção 0). São
  três dos 58 que não carregam informação nova.

---

## 4. Diff dirigido vs iteração 7, fora dos consertos — **limpo**

Dos 49 comuns: **34 byte-idênticos**. Agrupei em bandas as linhas alteradas das
páginas longas:

- `home-768-full.png`: **uma** banda real, `y 2290..2369` (4.298 px) — é o cartão
  "Quem está na frente?". É o conserto do "×". As outras 6 bandas somam **115 px**.
- `home-1440-full.png`: 5 bandas, **278 px no total** (0,001%).
- `home-390-full.png`: 4 bandas, **55 px no total**.

Ampliei 1,6× a maior sobra (`home-1440-full`, `y 11842..11971`, 69 px) nas duas
pastas: são as curvas e o tracejado da faixa de projeção caindo com fase
sub-pixel diferente entre renders — as duas imagens são visualmente
indistinguíveis. Mesmo diagnóstico da iteração 7. **Não é mudança de desenho.**

**Conclusão do diff:** a única mudança visual substantiva do produto entre a
iteração 7 e a 8 é o "×" a 768. **Nada regrediu** — e o MAJOR não recebeu um pixel.

---

## 5. Achado novo

### `[MINOR]` `scripts/qa/axe.mjs:41` + `src/components/ui/glossario.tsx:11-12,46` — rubrica 7, 9 — o gate do axe não cobre WCAG 2.1 nível A, e é exatamente ali que mora uma falha real

O gate roda `.withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"])`. Falta
**`wcag21a`** — a família 2.5.x (*Label in Name*, *Pointer Gestures*, *Pointer
Cancellation*, *Motion Actuation*). "axe zero" é verdade e continua sendo; o gate
só não olha para lá.

O `lighthouse.json` **desta pasta** olhou, e achou (`label-content-name-mismatch`,
impacto `serious`, peso 0 e grupo `hidden` na categoria — por isso a11y fecha em
100 com o audit em 0):

```
<button aria-label="o que é margem de erro" …>  →  texto visível: "folga da medida ?"
```

O nome acessível e o rótulo visível **não têm uma palavra em comum**. Quem usa
comando de voz olha o chip, diz "clicar em folga da medida", e nada acontece
(WCAG 2.5.3, nível A). Pior para a tese do produto: o vidente lê a expressão
simples ("folga da medida") e o leitor de tela recebe o **jargão** ("margem de
erro") — a rubrica 9 invertida exatamente para quem menos pode conferir na tela.

O que faz disto um item e não um detalhe é que **o componente documenta a
invariante que não consegue impor**. `glossario.tsx:11-12` afirma: *"o nome
acessível diz 'o que é <termo>', que contém o rótulo visível (WCAG 2.5.3)"*. Isso
só vale quando `children` é omitido. A API permite sobrescrever o rótulo visível
sem tocar no nome acessível, e um `<Termo>` faz isso.

**Escopo, medido nas 17 usagens de `<Termo>`:** exatamente **1** quebra —
`serie-pesquisas.tsx:183` (`chave="margemErro"`, visível "folga da medida").
`peso` ("peso" ⊂ "peso da pesquisa"), `empateTecnico` (só caixa) e `deriva`
(idêntico) passam. O segundo nó apontado pelo Lighthouse é o logo do cabeçalho
(`aria-label="PONTEIRO — Para onde apontam as pesquisas."` contra o mesmo texto
sem o travessão): tecnicalidade de travessão, impacto real nulo — **não** cobro.

**Conserto:** derivar o nome acessível do rótulo visível em `Termo` (`o que é
${children ?? verbete.termo}`), ou passar `rotuloAcessivel` explícito nessa
chamada; e somar `wcag21a` à lista de tags do gate, para que a próxima não dependa
de eu ler um JSON de 1,4 MB.

### NITs (não reabrem o loop, por disciplina anti-desperdício)

- `[NIT]` `screenshots.mjs` — contagem de falhas ≠ manifesto de arquivos (seção 2).
  Um seletor que case com o elemento errado ainda produz print bem-sucedido do
  lugar errado.
- `[NIT]` `revelador.tsx:121-146` — `<div role="dialog">` é descendente de
  `<p class="entra">`: `<p>` só admite conteúdo de frase, então o modelo de
  conteúdo é inválido. Não quebra hidratação (o painel só nasce depois do clique,
  nunca no HTML do servidor), por isso é NIT — mas é o mesmo sintoma de raiz: um
  diálogo morando dentro da prosa. **O portal do item 1a resolve os dois juntos.**

---

## 6. A parada, e as pendências honestas para o RELATORIO-REDESIGN

**O loop para aqui, no limite de 8, sem leitura limpa.** O contador de iterações
limpas termina o projeto em **zero**.

Fui explícito na iteração 7 sobre o preço: *"Aceito UMA leitura limpa na iteração
8 como parada, sob três condições inegociáveis"*. As condições **2 e 3 foram
cumpridas** — e cumpridas bem, tanto que foi a evidência dirigida que revelou a
manifestação (iii). A condição **1 não foi**, por um conserto que **eu** ditei
errado. O protocolo manda parar e seguir adiante, e eu paro.

**Não escrevo a minha metade do veredito a quatro mãos.** Disse na iteração 7 que
não escreveria "é bonito" na mesma página em que documento que o gesto-assinatura
do sistema de design não acontece no primeiro chip da home. Ele continua não
acontecendo, e agora sei que ele também **se fecha na mão de quem o toca**. A
assinatura fica em aberto — não é reprovação do redesenho, é recusa de assinar uma
frase que a evidência desta pasta não sustenta inteira.

**O que fica decidido, porque é fato de pixel e não depende do conserto:**

- **A rubrica 1 está fora de risco por larga margem.** `.qa/antes/home-1440-full.png`
  é um terminal preto com `PRESIDENTE 2026` em grotesca condensada, rótulos
  monoespaçados em caixa alta e verde-fósforo sobre placa preta.
  `home-390-hero.png` desta pasta é campo bruma, marca `PONTEIRO` em ameixa e a
  manchete serifada editorial "Em 100 eleições parecidas com esta, Lula é eleito
  em 83 e Flávio em 17". Não sobrou paleta, tipografia nem motivo visual da v1.
  **"É outro produto" eu sustento sem ressalva.** Isso nunca mais é o assunto.
- Os consertos das iterações 6 e 7 estão **todos** de pé e medidos: popover contido
  nos 3 viewports (pior caso a 768 confirmado neste print), formulário alinhado,
  "×" preso ao segundo nome, capturador com falha dura.
- Gates: **92/100/100/100, CLS 0**, `errors-in-console` e `color-contrast` com
  score 1, zero estouro horizontal em 58 prints. LCP 3,3 s é o que segura a
  performance em 92.

**Pendências, em ordem de custo/benefício:**

1. **[MAJOR] Portal para o `Revelador`.** Véu e painel via
   `createPortal(…, document.body)`. Fecha: a folha que não é folha e não tem véu a
   390 (2 chips: `chance`, `registro no TSE`); o "empate" impresso sobre a
   definição a 768/1440; a faixa de 352×20 px que fecha o painel ao toque; e o
   `<div role="dialog">` dentro de `<p>`. Paliativo de uma linha, se necessário:
   `animation-fill-mode: backwards` em `.entra` e `.bolinha` — **provado**, ao
   contrário do que eu prescrevi na iteração 7.
2. **[MINOR] `wcag21a` no gate do axe** + nome acessível derivado do rótulo
   visível em `Termo` (1 chip afetado: "folga da medida").
3. **[NIT]** manifesto de arquivos no capturador; o print `popover`, hoje
   duplicata do `chip-chance`, pode virar o chip de **pior** caso.

**Uma observação de método, para quem herdar isto.** O defeito que atravessou oito
iterações não sobreviveu por falta de cobertura — sobreviveu porque nas iterações 1
a 6 a evidência era **volumosa** (um `full-aberto` de 29.567 px de altura com 31
popovers abertos ao mesmo tempo) em vez de **dirigida**. Ele só ficou visível
quando passou a existir um print de cada chip, aberto sozinho, por gesto real, nos
três viewports. E a última manifestação — a que estraga o uso, não a aparência —
não estava em print nenhum: apareceu quando testei o **toque**. Evidência dirigida
ao estado suspeito acha em uma iteração o que a evidência abundante escondeu em
seis. Fica registrado como o aprendizado mais caro deste loop.

---
---

# ADENDO PÓS-LOOP — verificação de `.qa/iter-v2-final/` e assinatura

**Isto não é a iteração 9.** O loop encerrou no limite de 8, **sem leitura limpa**,
e essa decisão — a de todo o documento acima — permanece de pé e deve ser
reportada como está. O contador de iterações limpas termina o projeto em **zero**.

O que segue verifica um **hardening pós-loop da Fase 8** e responde a uma única
pergunta: a barreira factual que me impediu de assinar o veredito a quatro mãos
foi removida? Escrevi acima, na seção 6, o motivo exato da recusa — *"não escrevo
'é bonito' na mesma página em que documento que o gesto-assinatura se fecha na mão
de quem o toca"*. Ou essa frase deixou de ser verdade, ou a recusa fica.

Verifiquei eu mesmo. Nada aqui é relato de terceiro.

## A1. Procedência da evidência — conferida antes de olhar um pixel

O flake que envenenou as iterações 7 e 8 era servidor zumbi servindo build velho.
Não repito o erro de não checar:

| | |
|---|---|
| `.next/BUILD_ID` | `K7R2Fer8yvJFs5zHUMfts`, 04/08 **20:31** |
| prints de `iter-v2-final/` | 20:33–20:36 |
| `lighthouse.json` (`fetchTime`) | 20:36 |
| build que **eu** subi e dirigi (porta 3210, exclusiva) | o mesmo — chunk `23mpulrwbtkuj.js` de 20:31 |

Os 58 arquivos: larguras = viewport nos 58 (390→390, 768→768, 1440→1440), zero
estouro horizontal. O conjunto fecha em 58, sem faltas. Nove duplicatas byte a
byte — as **mesmas nove** da iteração 8 (seis pares `metodologia`/`historico` que
já absolvi, mais os três `popover ≡ chip-chance`). Nenhuma duplicata nova.

## A2. O MAJOR 1a — **REMOVIDO NA RAIZ.** As três manifestações, uma a uma

O conserto é o que recomendei como opção 1: `createPortal(…, document.body)`
(`revelador.tsx:137,193`), não o paliativo. Medido no build de produção, por
gesto real, nos três viewports:

```
390   pai do dialog=BODY  painel=[0,595,390,844]  véu=[0,0,390,844]  toque dentro → SOBREVIVE
768   pai do dialog=BODY  painel=[248,315,600,556]                    toque dentro → SOBREVIVE
1440  pai do dialog=BODY  painel=[457,347,809,625]                    toque dentro → SOBREVIVE
```

**(iii) — o painel que perdia o toque. A pior, e a que motivou a recusa.**
Na iteração 8 eu medi, e é a linha que me travou:

```
768px  toque em (451,381) sobre o texto da definição — painel continua aberto? false
1440px toque em (660,415) sobre o texto da definição — painel continua aberto? false
```

Agora, no mesmo gesto, `elementFromPoint` no meio do texto da definição devolve um
`DIV` **de dentro do diálogo** (`dentro: true`) nos três viewports, e o painel
sobrevive ao clique nos três. Onde antes havia uma faixa de 352×20 px que fechava
a definição na mão do leitor, hoje o alvo é o próprio painel. **Fechada.**

Prova independente do meu teste: no 390, o Playwright **se recusou a clicar** num
segundo chip — `<span class="fixed inset-0 z-40 bg-veu"> intercepts pointer
events`. O véu barrando o clique é o modal existindo de verdade.

**(ii) — a folha que não era folha, a 390.** Os dois chips quebrados:

| chip | iteração 8 | `iter-v2-final` | esperado (§6.4) |
|---|---|---|---|
| `chance` | painel `[16,164,374,413]`, véu **358×58** | painel `[0,609,390,844]`, véu **390×844** | `[0,…,390,844]` / 390×844 |
| `registro no TSE` | painel `[16,292,374,566]`, véu **358×186** | painel `[0,609,390,844]`, véu **390×844** | idem |

Varredura de coluna nos PNGs, nas duas bordas (`x=2` e `x=387`): véu contínuo
`(126,121,130)` de `y=0` a `y≈607`, transição de 2px, folha branca de `y=609` ao
rodapé — **idêntico nos dois chips**. Na iteração 8 os cantos mediam
`(239,236,241)`, iguais ao baseline: a tela não escurecia. Agora escurece inteira.

E os dois chips passaram a dar **a mesma geometria**, que era o dano de verdade:
`§6.4` promete que "o leitor aprende o gesto uma vez", e o gesto dava dois
resultados diferentes. Dá um só.

O ganho está inteiro em `home-390-chip-chance.png`: na iteração 8 o cartão solto
tapava a manchete — "Em 100 eleições parecidas com esta, Lula é eleito em 83 e
Flávio em 17", o LCP, a resposta a "quem está na frente". Em `iter-v2-final` a
manchete está **visível através do véu**, com o 83 em carmim e o 17 em azul, e a
definição sobe do rodapé sem cobrir nada. O leitor mantém a resposta **e** ganha a
explicação. **Fechada.**

**(i) — o "empate" impresso sobre a definição, a 768/1440.** Recortei e ampliei a
mesma região nas duas pastas. Na iteração 8 a palavra atravessa o painel entre
"…uma coisa" e "acontece em 100 situações"; em `iter-v2-final` sumiu a 1440 e
está corretamente **ocluída** pelo painel a 768 (só sobra o "e" que já nascia
fora da borda esquerda). O diff confirma a cirurgia: **uma única banda** por
viewport — `y421..432` a 1440 (297 px) e `y387..398` a 768 (221 px), exatamente as
linhas do rótulo. Nada mais mudou nesses dois prints. **Fechada.**

Assinatura de conserto certo: a 768 e 1440 o painel **não se moveu um pixel**
(`[248,315,600,556]` e `[457,347,809,625]` são os mesmos números da iteração 8), e
`home-768-chip-pior.png` — o pior clamp, `votos válidos` — é **byte-idêntico**.
Mudou a ordem de pintura e o hit-test; a geometria conquistada nas iterações 6 e 7
ficou intacta. É o oposto de um conserto que empurra o problema.

**NIT 2 fechado junto**, como eu previra: o `<div role="dialog">` não mora mais
dentro de um `<p>` — é filho direto do `<body>`, e há teste que exige isso.

## A3. Pendência 2 (`wcag21a` + nome acessível) — **fechada**

`scripts/qa/axe.mjs:41` agora traz `wcag21a`. E o conserto foi o que eu preferia —
derivar, não remendar: `glossario.tsx` calcula `rotuloVisivel = typeof children ===
"string" ? children : verbete.termo` e monta `o que é ${rotuloVisivel}`. **A
invariante que o componente documentava e não impunha virou a implementação.**

Conferido no pixel que o conserto foi do lado certo: o rótulo **visível** continua
"folga da medida" (`home-*-pesquisas.png` mudou 12–35 px, e a ampliação mostra
apenas a fase sub-pixel do tracejado da faixa de projeção — mesmo diagnóstico das
iterações 7 e 8). Ninguém trocou a linguagem simples por jargão para calar o gate.

`label-content-name-mismatch` no `lighthouse.json`: **2 nós → 1**. O que sai é o
chip. O que fica é o logo do cabeçalho, a tecnicalidade de travessão que eu
**explicitamente não cobrei** na iteração 8 e continuo não cobrando — o nome
acessível contém o rótulo visível; sobra o "—".

Registro uma nuance honesta: o gate do axe passa limpo com `wcag21a`, mas quem
pegou este defeito foi o Lighthouse, não o axe. O que de fato tranca a linha é o
terceiro teste de `tests/e2e/glossario.spec.ts`, que **varre todos os chips** e
exige `aria-label ⊇ texto visível`. Isso é mais forte que a tag, e é o que eu
queria.

## A4. O que travou a regressão

Li `tests/e2e/glossario.spec.ts`. Os três testes cobrem exatamente as três
manifestações: `parentElement === "BODY"` (o portal como contrato, não como
comentário), toque no meio do painel → sobrevive, toque fora → fecha, `Esc` →
fecha e devolve o foco ao chip; o pior chip a 768 sem estouro; e a varredura de
nome acessível. `npx playwright test --list` → **63 testes**, e o fixture
`consoleLimpo` de `base.ts` reprova qualquer `console.warn`/`error` em **todos**.
Confirmei `Esc` ao vivo: foco volta para `o que é chance` nos três viewports.

**Uma lacuna, dita com precisão:** o projeto do Playwright é único, 1280×900. O
teste do toque roda a 1280 e o do estouro a 768 — **o 390 não está no laço
automático**, e 390 é justamente onde o defeito era pior. A verificação a 390
existe (a minha, acima, e a do integrador), mas é humana, não travada. Como a 390
o painel é folha de largura inteira sob véu de tela inteira, não há geometria
possível para um vizinho pintar por cima — o risco residual é baixo. Fica como
recomendação: `setViewportSize({width:390})` num quarto caso. **Não reabre nada.**

## A5. Achado novo — e por que ele não muda a assinatura

Fui atrás da única diferença que me incomodou no diff: `home-1440-full-aberto.png`
mudou 127.487 px, com uma banda em `y0..366`, e ali aparecem **dois painéis de
cartão de pesquisa empilhados sobre o hero**. Não aceitei explicação; medi.

Replicando o `abrirTudo` do capturador (`page.evaluate` + `forEach(el =>
el.click())`, **tudo num tique**), abrem-se 29 diálogos ao mesmo tempo e
**14 deles, a 1440, pousam em `top:8px; left:16px`** — a origem do documento. A
causa é precisa: o `useLayoutEffect` (`revelador.tsx:80-86`) mede
`gatilho.getBoundingClientRect()` no mesmo tique em que o contêiner do gatilho é
revelado; o retângulo vem **zerado**, e `scrollY + 0 + 8 = 8`, `max(16, min(0,…)) =
16`. Escreve coordenada de lixo em vez de desistir.

**Isso é artefato do instrumento, não defeito do produto — e eu provei os dois lados:**

| gesto | 390 | 768 | 1440 |
|---|---|---|---|
| **mouse real** em dois chips seguidos | 1 diálogo (o véu intercepta o 2º clique) | 1 diálogo | 1 diálogo |
| **teclado puro** (Enter, sem `pointerdown`) | 2 diálogos, ambos `[0,595,390,249]` — corretos | 2, o 2º em `[400,536,352,268]` (clamp ok) | 2, o 2º em `[1053,474,352,278]` (borda 1405 ≤ 1424) |
| `abrirTudo` sintético (1 tique) | 29 abertos, **0** mal posicionados | 29, **1** | 29, **14** |

Com ponteiro é **inalcançável** — o `pointerdown` no segundo chip fecha o primeiro,
e a 390 o véu nem deixa o clique chegar. Com teclado dois painéis abrem, mas
**ambos pousam certo**, medido. A patologia exige clicar um gatilho **não
diagramado**, e para tabular até um chip ele precisa estar visível. Nenhum humano
chega lá.

Duas notas, nenhuma delas um item que reabra coisa alguma:

- `[NIT]` `revelador.tsx:80-86` — guarda de uma linha: se o retângulo do gatilho
  for degenerado (`!width && !height`), **desistir** em vez de escrever `top:8px;
  left:16px`. Hoje o modo de falha é "voa para a origem do documento"; antes do
  portal era "pousa sob o próprio gatilho", porque havia um `span.relative` de
  reserva. O portal trocou um fallback benigno por um berrante. Custa uma linha.
- `[NIT]` `home-{390,1440}-full-aberto.png` — **dois dos 58 prints deixaram de
  informar.** A 390 o `full-aberto` virou um véu de tela cheia sobre 29.567 px; a
  1440, uma pilha de painéis sobre o hero. Nenhum dos dois é o produto.

E aqui fecho o argumento que venho fazendo desde a iteração 7, agora dos dois
lados: **o `full-aberto` é um instrumento ruim.** Ele escondeu um MAJOR real
durante seis iterações e agora **inventa** um defeito que não existe. Os prints
que carregam verdade são os `chip-*`, um estado por gesto. Se alguém herdar isto,
troque `full-aberto` por evidência dirigida e não olhe para trás.

## A6. A barreira

A frase que me travou era: *"o gesto-assinatura se fecha na mão de quem o toca"*.

Nos três viewports, por gesto real, no build que gerou esta pasta: o toque na
definição **não a fecha**. A folha a 390 é folha, com véu de tela inteira, e não
tapa mais a manchete. O rótulo não pisa mais no texto. O diálogo saiu de dentro do
parágrafo. Três testes travam tudo isso.

**A barreira factual está removida.** Assino a minha metade.

---

# A minha metade do veredito a quatro mãos

*qa-critic · pós-loop, sobre `.qa/iter-v2-final/` contra `.qa/antes/`*

## "É outro produto" — **SUSTENTO**

1. **Cor, numericamente.** As sete cores dominantes da primeira dobra, medidas nos
   dois lados. v1 (`antes/home-390-full.png`): `#e6e6dd` papel esverdeado, `#0e241a`
   placa quase-preta de matiz **verde** (R14 G36 B26), `#f6f6f0`, `#dff0e5`. v2
   (`iter-v2-final/home-390-full.png`): `#efecf1` bruma de matiz **violeta**
   (B>R>G), `#ffffff` placa, `#be1745` carmim, `#211c26` tinta ameixa, `#26418b`
   azul, `#5a3a66` ameixa. **Interseção vazia**, a 390 e a 1440. Os eixos de matiz
   são opostos.
2. **Tipografia.** Na dobra da v1, *toda* etiqueta é monoespaçada em caixa alta —
   "APURAÇÃO DE PESQUISAS · REGISTRO OBRIGATÓRIO NO TSE", "CHANCE DE SER ELEITO ·
   LULA (ESQ.) × FLÁVIO (DIR.)", "PROJETADO PARA O DIA DA VOTAÇÃO (04–25/10,
   INCERTEZA ±5,2 P.P.)" — e o título é grotesca condensada em caixa alta,
   "PRESIDENTE 2026". Na dobra da v2 **não há um caractere monoespaçado**, e o
   elemento dominante é uma serifada editorial em três linhas.
3. **Motivo e marca.** A assinatura gráfica da v1 é uma barra bicolor 83/17. A da
   v2 é um enxame de 100 bolinhas com régua de "empate" e legenda direcional
   ("← Flávio na frente · 18 / 82 · Lula na frente →"). E a v1 **não tem marca**:
   abre com um kicker monoespaçado. A v2 abre com o logotipo PONTEIRO, o símbolo
   da bússola e a assinatura "Para onde apontam as pesquisas."

Não sobrou paleta, tipografia, motivo nem estrutura. Rubrica 1 fora de risco por
larga margem — como eu já havia registrado na iteração 7, e por isso nunca mais
foi assunto.

## "É bonito" — **SUSTENTO**

Esta é a que eu me recusei a escrever em 4 de agosto. Escrevo agora, e digo por quê.

1. **Hierarquia (rubrica 6).** A dobra da v1 empilha cinco blocos gritando no mesmo
   volume: três kickers em caixa alta monoespaçada, dois cartões numéricos e uma
   placa preta com mais dois cabeçalhos em caixa. Nenhum domina. A dobra da v2 tem
   **um** elemento dominante — a manchete serifada, com o 83 em carmim e o 17 em
   azul — e tudo mais desce em escala. Um elemento manda; os outros obedecem.
2. **O gesto-assinatura, agora inteiro (rubricas 3 e 4).** É a evidência que faltava
   e que eu exigi. `home-390-chip-chance.png` e `home-390-chip-tse.png`: painel em
   `[0,609]..[390,844]` — largura de viewport, encostado no rodapé, topo arredondado
   com alça — sob véu uniforme cobrindo `[0,0,390,844]`. **A mesma geometria nos
   dois**, com entrada de 200 ms em token e `Esc` devolvendo o foco. O que era um
   cartão solto no meio da prosa, com alça que não puxava nada e sem véu, virou
   componente nativo. E sobrevive ao toque.
3. **Craft do gráfico (rubrica 3).** A v1 imprime a incerteza como parêntese de
   texto: "(INCERTEZA ±5,2 P.P.)". A v2 **desenha**: 100 bolinhas, régua de empate
   rotulada, setas dos dois lados, faixa de projeção tracejada. E o desenho agora
   está limpo — o rótulo "empate" que pisava na segunda linha da definição saiu
   (banda única `y421..432`, 297 px a 1440). Com CLS **0** e Lighthouse
   **92/100/100/100**.

## "Um leigo entende" — **SUSTENTO**

Com a persona da rubrica 2, no celular, só com o que está na dobra de 390:

1. **As quatro perguntas, respondidas em palavras.** "Quem está na frente?" → *"Em
   100 eleições parecidas com esta, Lula é eleito em 83 e Flávio em 17."* "É
   certeza?" → *"Cada bolinha é um resultado possível: nenhuma é o resultado"* e
   *"Isto não é previsão."* "Pode mudar até a eleição?" → *"até outubro isso ainda
   pode mudar"*, em negrito. "O que é margem de erro?" → o chip **"folga da medida
   ?"**, que abre a folha com duas frases. Na dobra da v1, a expressão "margem de
   erro" **não existe**: o que se oferece é "INCERTEZA ±5,2 P.P.", sem explicação em
   lugar nenhum da dobra. Era MAJOR por rubrica 2; deixou de ser.
2. **O percentual foi rebaixado, e essa é a inversão certa (rubrica 9).** A v1 abre
   com "83%" em numeral gigante sobre placa preta. A v2 abre com a **frequência em
   palavras** e joga o percentual para a linha secundária — *"o mesmo que dizer 83%
   de chance para Lula"*. O número difícil virou nota de rodapé do número fácil.
3. **A linguagem simples vale também para quem não vê a tela.** O nome acessível
   passou a **derivar** do rótulo visível, e um dos 63 e2e varre todos os chips
   exigindo a contenção. Quem usa leitor de tela ou comando de voz recebe hoje
   "folga da medida" — a mesma palavra impressa — e não mais o jargão "margem de
   erro". Era a rubrica 9 invertida contra quem menos pode conferir; foi corrigida
   na API, não no texto.

## O que a minha assinatura NÃO cobre

Assino o produto, no estado de `.qa/iter-v2-final/`, verificado por mim. Não assino
o processo, e registro para que ninguém leia mais do que está escrito:

- **O loop terminou em zero leituras limpas**, no limite de 8. Esta assinatura vem
  de uma verificação **pós-loop, única, minha** — não de uma iteração limpa. A
  diferença importa e não deve ser apagada no relatório.
- **O MAJOR atravessou oito iterações**, e uma delas se perdeu porque **eu** ditei
  um conserto que era no-op semântico (seção 1a). O custo é meu e fica escrito.
- **Ficam de pé, sem cobrança:** LCP 3,3 s (é o que segura a performance em 92);
  o logo do cabeçalho no `label-content-name-mismatch` (travessão); os três prints
  `popover` duplicatas do `chip-chance`; a guarda de uma linha do retângulo
  degenerado (A5); o 390 fora do laço automático do toque (A4); e o `full-aberto`,
  que eu recomendo **aposentar** em favor de evidência dirigida.

Nenhum desses reabre coisa alguma — e, pela disciplina anti-desperdício da minha
rubrica, **declaro por escrito que não consigo mais apontar melhoria que um usuário
real perceberia** nos 58 prints desta pasta. Era a outra metade do meu critério de
parada. Ela também está cumprida agora.

*— qa-critic*

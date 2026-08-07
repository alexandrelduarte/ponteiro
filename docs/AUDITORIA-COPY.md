# AUDITORIA DE COPY — o carimbo do data-scientist

**Fase 5 do redesign · auditoria de `docs/COPY-DECK.md` (366 chaves) contra `docs/VOZ.md`,
`src/lib/modelo/` e `agregador-presidencial-2026.jsx`.**

Este documento é o único artefato desta auditoria. Ele **não edita o COPY-DECK** — quem aplica as
correções é o ux-writer, na Fase 6. Cada problema traz a **redação substituta exata** que eu
aprovo; onde a substituta depende de um placeholder que ainda não existe, o placeholder está
especificado no §5.

## Como ler o veredito

| Selo                    | O que significa                                                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **VETADA**              | a frase **é falsa** — hoje, com os dados atuais, ou num estado que o modelo alcança. Não pode ir para a tela como está. |
| **APROVADA COM EMENDA** | a frase não é falsa, mas é imprecisa, incompleta ou assimétrica. A Fase 6 aplica a substituta.                          |
| **APROVADA**            | fiel ao modelo e às regras H1–H14. Nada a fazer.                                                                        |

**Contagem final: 25 vetadas · 43 com emenda · 298 aprovadas.**

---

## 0. Base numérica desta auditoria

Modelo rodado com `tests/reference/original.mjs` (o gabarito verbatim do protótipo) sobre
`src/data/pesquisas.seed.json`, `PARAMS_PADRAO` e `hoje = 03/08/2026 12:00 −03` — a mesma data-base
que o COPY-DECK usa nas linhas _"Hoje:"_. **Todo número citado abaixo foi calculado, não estimado.**

| Campo do modelo                                   | Valor                                                  | Como o deck publica           |
| ------------------------------------------------- | ------------------------------------------------------ | ----------------------------- |
| `eleito.dia.l` / `.f`                             | 83,4 / 16,6                                            | 83 e 17 (soma 100 ✔)          |
| `eleito.hoje.l` / `.f`                            | 88,4 / 11,6                                            | 88 e 12 ✔                     |
| `pL2dia` (o enxame)                               | 81,9                                                   | 82 / 18 ✔                     |
| `pL2hoje`                                         | 87,6                                                   | 88                            |
| `p1.lulaDia` / `p1.flavioDia`                     | 8,49 / **0,0004**                                      | 8 e **0** ← H13               |
| `p1.lulaHoje`                                     | 5,9                                                    | 6                             |
| `p2Tacontece`                                     | 91,5                                                   | 92 (92 + 8 = 100 ✔ por sorte) |
| `margem` / `margemAj`                             | +4,72 / +4,72                                          | 4,7                           |
| `mediaL2` / `mediaF2`                             | 46,95 / 42,23                                          | 47,0 e 42,2 (somam 89,2)      |
| `validoL2`                                        | 52,645                                                 | 52,6 × 47,4 ✔                 |
| `sdEntre` / `seAgora`                             | 2,38 / **0,80 (no piso)**                              | 2,4 publicado; 0,80 usado     |
| `sigmaHoje` / `sigmaDia2`                         | 4,08 / 5,18                                            | 4,1 e 5,2                     |
| `deriva2`                                         | 3,19                                                   | 3,2                           |
| `int80`                                           | [−1,92; +11,35]                                        | −1,9 e +11,4 ✔                |
| `t1raw` L/F                                       | 41,36 / 33,41                                          | 41,4 × 33,4 ✔                 |
| `t1valL` / `t1valF` / dif                         | 46,04 / 37,19 / **+8,85**                              | 46,0 ✔                        |
| `qtdEmpate` / `qtdRecentes`                       | 3 / 7                                                  | 3 de 7 ✔                      |
| `gap3` / `bn`                                     | 28,7 / 9,6                                             | ✔                             |
| `cenBase.pElei` / `pDireto` / `pV2` / `pLulaEm1`  | 83,4 / 8,5 / 81,9 / 93,8                               | 83 / — / 82 / 94              |
| `cenBase.placarL`                                 | 52,645                                                 | 52,6 × 47,4                   |
| bandas                                            | Flávio 18,1 · Lula 0–5 **34,1** · 5–10 32,4 · 10+ 15,4 | modal = "0–5"                 |
| `replay.elRepD` / `elRepH`                        | **69,1** / 97,8                                        | 69 / 98                       |
| `replay.p2Trep` / `pV2rep` / `p1Ld`               | 99,1 / 68,9 / 0,85                                     | 99 / 69 / 1                   |
| `replay.r1L`/`r1F` (dif)                          | 45,04 / 42,49 (**+2,55**)                              | 45,0 × 42,5                   |
| `replay.r2L`/`r2F` (dif)                          | 51,05 / 48,96 (**+2,09**)                              | 51 × 49 ✔                     |
| `replay.pLider1` / `pPainel`                      | 73,1 / 63,3                                            | 73 / 63                       |
| `calcVies` em +3,1 / +6,3                         | elD 63,3 / **38,4**                                    | —                             |
| **ponto de virada (elD = 50%)**                   | **vies = +4,807**                                      | o deck diz `{{MARGEM}}` = 4,7 |
| `sigmaSys` 3,1 / 4,0 / 6,0 / 6,3 → `eleito.dia.l` | 86,1 / 83,4 / **78,9** / 78,4                          | deck: 86 / 83 / 79            |

Três fatos desta tabela sustentam a maior parte dos vetos:

1. **A réplica fiel de 2022 dá 69 em 100, não uma vitória.** Em 31 de cada 100 cenários dessa
   mesma hipótese, quem é eleito é Flávio.
2. **O ponto de virada é +4,8, menor que o erro de 6,3 já registrado em 2022.** Virar não exige
   erro inédito — exige menos erro do que o setor já cometeu.
3. **`empate2` no modelo é `|margem2| ≤ 2 × moe`** (`nucleo.ts` L204), e o protótipo escreve isso
   por extenso (L1640: _«empate técnico» = diferença ≤ 2× margem de erro_). O deck perdeu o **2×**
   em quatro chaves — e ele é verificável na própria tabela da página.

---

## 1. Veredito por seção

| §   | Seção                    | Veredito                   | Chaves vetadas                    |
| --- | ------------------------ | -------------------------- | --------------------------------- |
| A   | Placeholders e origem    | **aprovada com correções** | mapeamento do Replay ausente (§5) |
| B   | Marca e cabeçalho        | **aprovada com correções** | — (1 emenda)                      |
| C   | Hero                     | **aprovada com correções** | 3                                 |
| D   | Como ler esta página     | **aprovada com correções** | 1                                 |
| E   | Quem está na frente      | **aprovada com correções** | 4                                 |
| F   | Isso ainda pode virar    | **aprovada com correções** | 1                                 |
| G   | Evolução                 | **aprovada com correções** | 1                                 |
| H   | As pesquisas             | **aprovada com correções** | 2                                 |
| I   | Outros candidatos        | **aprovada com correções** | 1                                 |
| J   | Contexto social          | **aprovada com correções** | — (1 emenda)                      |
| K   | Simulação e réguas       | **aprovada com correções** | 2                                 |
| L   | Erro de 2022 / Replay    | **VETADA como bloco**      | 6                                 |
| M   | Cenário-base             | **VETADA como bloco**      | 3                                 |
| N   | Resumo do método         | **aprovada com correções** | — (2 emendas)                     |
| O   | Glossário                | **aprovada com correções** | 1                                 |
| P   | Botões e microcopy       | **aprovada**               | 0                                 |
| Q   | Selo de frescor          | **aprovada**               | 0                                 |
| R   | Modo simulação           | **aprovada**               | 0                                 |
| S   | Estados vazios e de erro | **aprovada**               | 0                                 |
| T   | Rodapé                   | **aprovada**               | 0                                 |
| U   | `/metodologia`           | **aprovada com correções** | — (1 emenda)                      |
| V   | `/historico`             | **aprovada com correções** | — (1 emenda)                      |
| W   | Cobertura do INVENTÁRIO  | **aprovada com correções** | ver §6                            |

§L e §M são vetadas **como bloco** porque o defeito é estrutural e se repete: a seção converte
probabilidade em desfecho e apresenta somas que não fecham na tela. As chaves não citadas dentro
delas continuam aprovadas.

---

## 2. O ponto mais exposto: a micro-legenda 83 ↔ 82

### `hero.enxame.legenda` — **VETADA**

**Frase atual:**

> Cada bolinha é um resultado possível, e todas valem o mesmo. Aqui elas mostram só a **decisão de
> 25 de outubro**: {{T2_LULA}} caem do lado de Lula e {{T2_FLAVIO}} do lado de Flávio. Na frase de
> cima são {{ELEITO_LULA}} porque ela conta também a chance de a eleição acabar já no 1º turno.
> Nesse caso não existe 2º turno para a bolinha cair de um lado.

**Por que distorce.** A primeira metade está certa (`pL2dia` = 82/18, e o enxame é mesmo só a
decisão). A explicação da diferença, não. A conta do modelo é

```
eleito.dia.l  =  p1.lulaDia  +  p2Tacontece × pL2dia          (nucleo.ts L276)
83,4          =  8,5         +  91,5 × 81,9 / 100
```

de onde

```
eleito.dia.l − pL2dia  =  p1.lulaDia × (1 − pL2dia)  −  p1.flavioDia × pL2dia
+1,5                   =  8,5 × 0,181  −  0,0004 × 0,819
```

Ou seja: **a diferença não é "somar a chance de acabar no 1º turno"** — é somar a parte dela que
pertence a _cada_ candidato, com sinais opostos. Três consequências:

1. **A frase é falsa para Flávio.** Ele vai de **18 bolinhas para 17 na manchete**: contar o 1º
   turno _subtrai_ dele. Um leitor que aplique a explicação publicada ao lado direito da régua
   conclui o contrário do que o modelo diz. Isso quebra H9 (simetria) e H3.
2. **O sinal não é garantido.** Se `p1.flavioDia` crescer (a régua da puxada em +6,3 já inverte o
   quadro), a manchete de Lula passa a ser **menor** que o enxame e a frase inverte de valor-verdade
   sem que ninguém toque no texto.
3. **O número que explica a diferença não aparece.** A legenda cita 82 e 83 e omite os 8 em 100 que
   acabam em 4 de outubro — que são a causa inteira do 1 ponto.

**Redação substituta aprovada** (mesma tela, sem clique — DESIGN-V2 §2.1):

> Cada bolinha é um resultado possível, e todas valem o mesmo. Aqui elas mostram **só a decisão de
> 25 de outubro**: {{T2_LULA}} caem do lado de Lula e {{T2_FLAVIO}} do lado de Flávio. A frase de
> cima conta outra coisa: quem termina eleito pelos dois caminhos juntos. Em {{P_1T_DEF}} de cada
> 100 cenários a eleição acaba já em 4 de outubro — nesses não existe 2º turno para a bolinha cair
> de um lado, e eles entram na frase de cima a favor de quem venceu no 1º turno. {{FECHO}}

E `{{FECHO}}` é uma das duas variantes, escolhida pelo dado (`p1.lulaDia ≥ p1.flavioDia`):

**`hero.enxame.legenda.fecho.lula`**

> Hoje quase todos esses cenários terminam com Lula eleito — por isso na frase de cima ele fica com
> {{ELEITO_LULA}}, um pouco acima das {{T2_LULA}} bolinhas, e Flávio com {{ELEITO_FLAVIO}}, um
> pouco abaixo das {{T2_FLAVIO}} dele.

**`hero.enxame.legenda.fecho.flavio`**

> Hoje quase todos esses cenários terminam com Flávio eleito — por isso na frase de cima ele fica
> com {{ELEITO_FLAVIO}}, um pouco acima das {{T2_FLAVIO}} bolinhas, e Lula com {{ELEITO_LULA}}, um
> pouco abaixo das {{T2_LULA}} dele.

Com os números de hoje isso rende, literalmente: _"Em 8 de cada 100 cenários a eleição acaba já em
4 de outubro … Hoje quase todos esses cenários terminam com Lula eleito — por isso na frase de cima
ele fica com 83, um pouco acima das 82 bolinhas, e Flávio com 17, um pouco abaixo das 18 dele."_
Verdadeiro, simétrico, e continua verdadeiro se a régua da puxada virar o quadro.

**Nota de montagem:** 78 palavras. É mais longa que o teto de `traduzindo` (VOZ §7), e deve ser —
`legenda` não é `traduzindo`, e DESIGN-V2 §2.1 proíbe encurtá-la até perder a explicação. Se a
Fase 6 precisar de uma versão curta para 390px, ela **corta a primeira frase** ("Cada bolinha…",
que se repete em `comoLer.passo2`), nunca o fecho.

### A mesma conta aparece, quebrada, em mais três lugares

`secao.virar.resposta` (18, sem reconciliação), `secao.cenarioBase.resposta` (83 colado num evento
de 75) e `secao.cenarioBase.passo2.texto` (8 + 82 = 83 na tela) — tratados em §3 e §4.

---

## 3. VETADAS — chave a chave

### 3.1 "Empate técnico" perdeu o fator 2 (4 chaves)

O modelo marca `empate2` quando **`|margem2| ≤ 2 × moe`**. É a regra certa: o erro amostral da
_diferença_ entre dois candidatos é cerca do dobro do erro de cada número isolado (com dois nomes
perto de 47%, `SE(dif)/SE(p) ≈ 1,94`). O deck escreveu "menor que a folga da medida" — a folga
simples. **Isso é verificável contra a própria tabela da página**, que publica a coluna "Folga da
medida": das 3 pesquisas hoje marcadas como empate técnico, **duas contradizem a definição
publicada** — PoderData (diferença 3,0 · folga 2,0) e Nexus (diferença 4,0 · folga 2,0). Só a Gerp
(1,0 contra 2,19) satisfaz a versão escrita. O deck ainda se contradiz: `secao.metodo.item4` e
`metodologia.classificacao.simples` dizem "o dobro da folga", que é o certo.

**`secao.frente.t2.empates` — VETADA**

> {{QTD_EMPATE}} das {{QTD_RECENTES}} pesquisas dos últimos 35 dias estão em empate técnico: nelas,
> a diferença é menor que **o dobro** da folga da medida — é essa a folga que vale quando se
> comparam os dois números. Em {{INSTITUTO_INVERTIDO}}, quem aparece à frente é Flávio, por
> {{MARGEM_INVERTIDA_ABS}} ponto, ainda dentro dessa folga.

_(o "recentes" do original não tem definição na tela; `qtdRecentes` é `idadeDias < 35`. "Gerp" era
constante escrita à mão — vira placeholder, §5.)_

**`secao.pesquisas.chip.empate.explica` — VETADA**

> A diferença é menor que **o dobro** da folga da medida — é o tamanho da folga quando se comparam
> os dois números, não só um. Não dá para dizer quem está na frente; não quer dizer que os dois
> estão iguais.

**`glossario.empateTecnico` — VETADA**

> É quando a diferença entre os dois é menor que **o dobro** da folga da medida — a folga de cada
> número vale em dobro quando se comparam os dois. Não quer dizer que estão iguais: quer dizer que
> a pesquisa não consegue dizer quem está na frente.

**`secao.pesquisas.traduzindo` — VETADA** (a barra desenhada é 2× a margem de erro — DESIGN-V2 §4.3)

> Cada linha é uma pesquisa registrada no TSE, da mais nova para a mais antiga. O peso diz o quanto
> ela conta na média: mais nova e com mais gente ouvida pesa mais. A barra mostra **o dobro** da
> folga da medida — é essa a folga da diferença entre os dois. Quando a barra cruza a régua do
> empate, não dá para dizer quem está na frente.

> ⚠ **Efeito colateral obrigatório em `docs/VOZ.md`.** A definição errada nasceu lá: §3 (linha
> "Empate técnico") e **H5** mandam escrever _"a diferença é menor que a folga da medida"_. Essa
> linha e essa regra precisam ganhar o **dobro** também, senão a Fase 6 reintroduz o erro pela
> regra. É a única alteração que peço fora do COPY-DECK.

### 3.2 Probabilidade virando desfecho no bloco de 2022 (5 chaves)

**`secao.erro2022.resposta` — VETADA**

> ✗ _"Se o erro do 2º turno de 2022 se repetisse igual, Lula ainda seria eleito — mas por pouco,
> como em 2022."_

`replay.elRepD` = **69,1**. Em 31 de cada 100 cenários dessa mesma hipótese quem é eleito é Flávio.
"Lula ainda seria eleito" é H1 puro — e o próprio deck se desmente três cartões abaixo, em
`replay.card3.numero` ("Lula 69 em 100 × Flávio 31 em 100"). É a `resposta` da seção: a primeira
linha, a que conclui.

> ✓ Se o erro do 2º turno de 2022 se repetisse igual, Lula continuaria à frente — eleito em
> {{REPLAY_EL_DIA}} de cada 100 cenários, e por pouco, como em 2022.

**`secao.erro2022.cenario2.texto` — VETADA**

> ✗ _"…A diferença real cairia para cerca de 1,6 ponto: Lula seria eleito apertado, como em 2022."_

`calcVies(+3,1).elD` = **63,3**. Trinta e sete em 100 do outro lado viram zero na frase.

> ✓ As pesquisas da decisão erram 3,1 pontos a favor de Lula — o mesmo tamanho do erro do 2º turno
> de 2022. A diferença medida cairia para cerca de 1,6 ponto, e Lula seria eleito em {{P_L}} de
> cada 100 cenários: apertado, como em 2022.

**`secao.erro2022.cenario3.texto` — VETADA** (mesmo defeito + assimetria: só o cartão 1 tem
`.chances`; os cartões 2 e 3 anunciam desfecho sem número — H9)

> ✓ Uma hipótese que **não** aconteceu em 2022: o erro grande do 1º turno chegar inteiro até a
> decisão, sem a correção que os institutos fizeram entre os turnos. Como 6,3 passa do ponto de
> virada, quem fica na frente é Flávio — Lula é eleito em {{P_L}} de cada 100 cenários.

**Chaves novas obrigatórias:** `secao.erro2022.cenario2.chances` e `secao.erro2022.cenario3.chances`,
com o mesmo texto de `cenario1.chances` (`Lula {{P_L}} em 100 × Flávio {{P_F}} em 100`). Sem elas,
um dos três cartões carrega a dúvida e dois não (H9). Com os números de hoje: 83/17 · **63/37** ·
**38/62**.

**`secao.erro2022.replay.calibracao` — VETADA** (trecho)

> ✗ _"Por isso a repetição fiel de 2022 **ainda elege Lula, por pouco**."_
> ✓ Por isso a repetição fiel de 2022 **ainda deixa Lula na frente: eleito em {{REPLAY_EL_DIA}} de
> cada 100 cenários, por pouco.**

O resto do parágrafo está correto e é bom — a calibragem (11,6 × 5,2 e 4,9 × 1,8), o "não se somam"
e o {{REPLAY_P_PAINEL}} = 63 conferem com `ERRO_2022` e com `calcVies(3,1)`. Duas notas menores que
**não** exijo corrigir: 11,6 − 5,2 = 6,4 e a constante é 6,3 (arredondamento herdado do protótipo);
e o parágrafo tem 118 palavras.

**`secao.erro2022.replay.card3.conta` — VETADA**

> ✗ _"= {{REPLAY_P1_DIRETO}} em 100 (ganhando já no 1º turno) + {{REPLAY_P2T}} × {{REPLAY_PV2}}
> (indo para o 2º e ganhando lá)"_

Renderiza **"= 1 em 100 + 99 × 69"**. Um leitor que faça a conta na tela obtém 6.832. A conta real
é `1 + 0,99 × 69 = 69`: os dois fatores estão em base 100 e o produto precisa voltar para base 100.
Um bloco intitulado "as contas" que não fecha destrói exatamente a confiança que ele existe para
construir.

> ✓ De cada 100 cenários desta hipótese: **{{REPLAY_P1_DIRETO}}** terminam com Lula eleito já no 1º
> turno. Os outros **{{REPLAY_P2T}}** vão à decisão, e Lula ganha em {{REPLAY_PV2}} de cada 100
> deles — o que dá **{{REPLAY_V2_ABS}}** em 100. Somando os dois caminhos: **{{REPLAY_EL_DIA}}** em 100.

Com os números de hoje: 1 + 68 = 69. Fecha exatamente. (`{{REPLAY_V2_ABS}}` é novo — §5.)

**`secao.erro2022.porQue1T.p4` — VETADA**

> ✗ _"…Se o erro voltar ao tamanho do 1º turno, cerca de **79** em 100. Escolha a sua suposição na
> régua de erro, logo acima."_

Dois erros de fidelidade contra o protótipo (L1237–1238: _«correção mantida (σ≈3) → ~86% · parcial
(σ=4, padrão) → ~83% · regressão ao 1ºT (σ≈6) → ~79%»_):

- **79 é o valor de σ = 6,0, não de 6,3.** Com `sigmaSys` = 6,3 o painel mostra **78**. E a régua de
  erro vai só até 6,0 — a instrução "escolha na régua" manda o leitor a um valor inalcançável.
- **"pela metade" não é "parcial".** 4,0 não é o meio de 3,1 e 6,3 (seria 4,7).

> ✓ Traduzindo em número, sempre falando da chance de Lula no dia da votação: se a correção se
> manteve (régua em 3,0), cerca de 86 em 100. Se veio só em parte — o padrão do painel, 4,0 — cerca
> de 83 em 100. Se o erro voltar para perto do tamanho do 1º turno (6,0, o topo da régua), cerca de
> 79 em 100. Escolha a sua suposição na régua de erro, logo acima.

**`secao.erro2022.replay.card3.texto` → ver §4 (emenda).**

### 3.3 Somas que não fecham no cenário-base (3 chaves)

**`secao.cenarioBase.resposta` — VETADA**

> ✗ _"{{LIDER}} eleito **na decisão de 25 de outubro**, por diferença {{APERTADA_OU_MEDIA}}:
> acontece em {{P_ELEI}} de cada 100 cenários."_

`{{P_ELEI}}` é `cenBase.pElei` = `max(eleito.dia)` = **83**, que inclui ganhar já em 4 de outubro.
O evento descrito na frase — ser eleito **na decisão** — vale `p2Tacontece × pV2` = **75 em 100**.
Oito pontos de probabilidade colados no evento errado, na frase-conclusão da seção.

> ✓ {{LIDER}} eleito, com a definição saindo em 25 de outubro e por diferença
> {{APERTADA_OU_MEDIA}}: é o caminho que aparece em {{P_V2_ABS}} de cada 100 cenários. Somando com
> o caminho de vitória já em 4 de outubro, {{LIDER}} termina eleito em {{P_ELEI}} de cada 100.

**`secao.cenarioBase.passo2.texto` — VETADA**

> ✗ _"{{LIDER}} ganha a decisão em {{P_V2}} de cada 100 cenários. Somando os dois caminhos — ganhar
> já no 1º turno ou ganhar no 2º — dá {{P_ELEI}} em 100."_

Na tela: "ganha a decisão em **82**… somando os dois caminhos dá **83**". O leitor tem, no cartão
anterior, "vai para o 2º turno em 92 de cada 100" e "ganhar já no 1º" — e nenhuma soma dessas
parcelas dá 83. A conta certa é `8 + 92 × 82/100 = 8 + 75 = 83`: `pV2` é **condicional a haver 2º
turno**, e a frase o apresenta como parcela absoluta.

> ✓ Havendo 2º turno, {{LIDER}} ganha a decisão em {{P_V2}} de cada 100 desses cenários — como o 2º
> turno acontece em {{P_2T}} de cada 100, esse caminho vale {{P_V2_ABS}} em 100. Some os
> {{P_1T_DIRETO}} em 100 em que {{LIDER}} já ganha em 4 de outubro: {{P_ELEI}} em 100.

Com os números de hoje: 82 → 75 · 75 + 8 = 83. Fecha.

**`secao.cenarioBase.porQue.texto` — VETADA** (três asserções, uma delas banida pela VOZ)

> ✗ _"…**6 dos 7** institutos de julho mostram Lula à frente **ou empatado**…"_ — são **7 de 7**
> nesse critério: 6 mostram Lula à frente e o sétimo (Gerp) está em empate técnico. Errar para
> menos não conserta: é número errado.
> ✗ _"…rejeição de Flávio **igual ou maior** que a de Lula…"_ — `CONTEXTO[1]` traz Lula 47–53% e
> Flávio 46–57%: faixas que se cruzam, sem ordem definida. O deck escolheu o lado.
> ✗ _"O erro histórico das pesquisas **sempre** foi para o mesmo lado…"_ — VOZ §5.2 bane
> literalmente esta forma ("as pesquisas erram sempre") e o dado a contradiz: `HISTORICO_ERROS`
> registra **acerto (0–1 p.p.) em 2018 · 2º turno** e Datafolha e Quaest acertando a margem em
> 2022 · 2º turno. É a frase mais forte da seção e é falsa.

> ✓ Quatro motivos. **Um:** a vantagem é constante — 6 dos 7 institutos de julho mostram Lula à
> frente, e no sétimo os dois estão em empate técnico; a comparação de cada instituto com ele mesmo
> está estável. **Dois:** o contexto medido não desfavorece quem está no governo: aprovação e
> desaprovação próximas, rejeição alta dos dois lados e mais gente aberta a votar em Lula (47%
> contra 38%). **Três:** com dois terços de cada lado já decididos, a diferença anda devagar. Virar
> exige movimento fora do padrão de 2026. **Quatro:** mesmo assim a diferença fica apertada. Quando
> as pesquisas erraram em 2018 e em 2022, o erro foi na mesma direção — subestimando a direita — e a
> repetição fiel de 2022 dá algo perto de 51 × 49.

### 3.4 Espaço de virada subestimado (1 chave)

**`secao.virar.oQueDerruba` — VETADA**

> ✗ _"…Ou **um erro de pesquisa maior que os já registrados**."_

O ponto de virada calculado é **+4,81 pontos de puxada**. O erro registrado em 2022 no 1º turno é
**6,3** — _maior_ que o necessário para virar. A frase diz ao leitor que a virada exige um erro
inédito quando o modelo diz que ela exige **menos erro do que o setor já cometeu**. É a
subestimação de incerteza mais consequente do deck, e contradiz `cenario3` na mesma página ("6,3 …
a corrida se inverte"). O gêmeo em §M (`cenarioBase.oQueDerruba`) acerta — compara com o erro do
estado calibrado (3,1) — e fica aprovado.

> ✓ Três coisas mudariam este quadro. Pesquisas novas trazendo a diferença para baixo de 2 pontos.
> Três institutos seguidos com Flávio na frente, fora da folga. Ou uma puxada das pesquisas a favor
> de Lula maior que {{MARGEM_ABS}} pontos — menos que os 6,3 do 1º turno de 2022.

### 3.5 Rótulos que descrevem outro evento (3 chaves)

**`secao.frente.t1.defHoje` — VETADA** · **`secao.frente.t1.defDia` — VETADA**

> ✗ _"Acabar no 1º turno, se fosse hoje: {{P1_L_HOJE}} em 100"_ / _"…em 4 de outubro:
> {{P1_L_DIA}} em 100"_

`p1.lulaHoje` e `p1.lulaDia` são a chance de **Lula** ganhar já no 1º turno. "Acabar no 1º turno" é
outro evento — `p1.lulaDia + p1.flavioDia`, que o deck publica como `{{P_1T_DEF}}`. O rótulo nomeia
o evento errado, e o cartão logo abaixo dá o número de Flávio separadamente: o leitor que somar
conta duas vezes.

> ✓ `defHoje`: **Lula ganhar já no 1º turno, se fosse hoje: {{P1_L_HOJE}} em 100**
> ✓ `defDia`: **Lula ganhar já no 1º turno, em 4 de outubro: {{P1_L_DIA}} em 100**

**`secao.frente.t1.flavio` — VETADA** (H13, disparando **hoje**)

> ✗ _"Flávio ganhar já no 1º turno acontece em {{P1_F_DIA}} de cada 100 cenários…"_

`p1.flavioDia` = **0,0004%**. `Math.round(× 100)` = **0**. A tela publica hoje **"acontece em 0 de
cada 100 cenários"** — proibido por H13 e por VOZ §2.3 ("nem 0, nem 100"; improbabilidade não é
impossibilidade), e assimétrico em relação a Lula, que recebe um número contável.

> ✓ Flávio ganhar já no 1º turno acontece em **menos de 1** de cada 100 cenários — precisaria de
> mais da metade dos votos válidos.

**Regra de renderização que a Fase 6 tem de aplicar:** `{{P1_F_DIA}}`, `{{P1_L_DIA}}`,
`{{P1_L_HOJE}}`, `{{P_1T_DEF}}`, `{{P_BANDA}}`, `{{P_L}}`, `{{P_F}}`, `{{SIM_LULA}}` e todo
`{{REPLAY_*}}` percentual passam por `pctComPiso` ("menos de 1 em 100" / "mais de 99 em 100"). Hoje
`{{REPLAY_P1_DIRETO}}` = 0,85 → "1" (ok) e `{{REPLAY_P2T}}` = 99,1 → "99" (ok), mas ambos ficam a
um dado novo de estourar o piso/teto.

### 3.6 Afirmações não deriváveis do modelo (5 chaves)

**`hero.veredito.favorito.texto` — VETADA** (faixa 75–90)

> ✗ _"A vantagem de {{MARGEM_AJ_ABS}} pontos na decisão **é maior que a dúvida de hoje**."_

Hoje é verdade por 0,6 ponto (4,72 contra `sigmaHoje` 4,08) — e deixa de ser dentro da própria
faixa. No piso da faixa (`eleito.dia` = 75), `margemAj ≈ 0,60 × sigmaDia2 ≈ 0,77 × sigmaHoje`: a
vantagem fica **menor** que a dúvida de hoje e a frase se torna falsa sem que ninguém a edite. O
protótipo dizia "supera a incerteza de curto prazo" — vago de propósito; a tradução endureceu uma
comparação que o modelo não garante.

> ✓ A vantagem de {{MARGEM_AJ_ABS}} pontos na decisão é grande diante da dúvida de hoje, que é de
> cerca de {{SIGMA_HOJE}} pontos para cada lado. Mesmo assim, um erro das pesquisas do tamanho do
> de 2022, ou a campanha na TV, ainda permitiriam a virada.

**`hero.veredito.amplo.texto` — VETADA** (faixa 90+)

> ✗ _"A vantagem aparece **em todas as fontes**."_

Nada no modelo garante unanimidade em nenhuma faixa — hoje, a 83, a Gerp mostra Flávio à frente, e
a tabela de pesquisas está na mesma página. É afirmação sobre a série que a série pode desmentir.

> ✓ A vantagem aparece na maioria das pesquisas e resiste ao erro que elas já cometeram antes. Para
> virar, seria preciso um erro de pesquisa maior que os já vistos e uma mudança de opinião fora do
> padrão. Improvável não é impossível.

**`comoLer.rodape` — VETADA**

> ✗ _"**Nada nesta página é palpite nosso.** Todos os números saem de pesquisas registradas no
> TSE…"_

Falso, e o próprio deck admite duas seções adiante: _"Estas quatro réguas são as suposições que o
painel usa"_ (`secao.simulacao.resposta`). Meia-vida 21, erro 4,0, deriva 0,35 e puxada 0 são
escolhas nossas — e são exatamente o que move a manchete de 86 para 79. Afirmar zero suposição é
fabricar objetividade; é o espelho da certeza fabricada que H1 proíbe.

> ✓ **Ninguém aqui torce.** Os números saem de pesquisas registradas no TSE, com link para a fonte.
> O painel também faz quatro suposições para calcular a chance — elas ficam à vista, e você pode
> mexer em todas.

**`secao.evolucao.resposta` — VETADA**

> ✗ _"Desde janeiro a diferença encolheu — e **nunca saiu da faixa da dúvida**."_

A primeira metade é verdadeira (a média do painel foi de **+7,0** em 10/01 a **+4,7** hoje, com
idas e vindas: 7,0 → 3,6 → 5,9 → 4,7). A segunda não é derivável e provavelmente é falsa no
desenho: em janeiro a média era +7,0 com `sigmaHoje` ≈ 4,1, então a faixa ia de ~+2,9 a ~+11,1 e
**não continha o empate**. A frase-conclusão da seção afirma o oposto do que o gráfico mostra.

> ✓ Desde janeiro a diferença encolheu: era de cerca de {{MARGEM_INICIO}} pontos e hoje está em
> {{MARGEM_ABS}}. No caminho ela subiu e desceu — não foi uma queda em linha reta.

**`secao.outros.nomesPequenos` — VETADA**

> ✗ _"Outros nomes testados (Hertz Dias, Rui C. Pimenta, Edmilson Costa, Heró Bezerra) ficam em 1%
> ou menos em cada pesquisa."_

Nenhum desses quatro nomes aparece em `pesquisas.seed.json` — a frase diz "testados" sobre gente
que a série não testa. E **Aécio Neves**, que _está_ nos `outros1` do protótipo (2%), não aparece
nem aqui nem em `CANDIDATOS`, ou seja, some da aba "Todos os candidatos". Procedência é R4/H12: um
nome publicado tem de ter linha na série.

> ✓ Outros nomes testados em alguma pesquisa ficam em 1% ou menos e não entram no ranking.

_(Se a Fase 6 quiser nomear, os nomes têm de sair de `outros1`, não de uma lista escrita à mão.)_

### 3.7 A caixa "as contas" nomeia o número errado (2 chaves)

O protótipo mostra a fórmula com a raiz visível: `hoje: √(0,8² + 4,0²) = ±4,1 p.p.` e
`dia da votação: √(hoje² + 3,2²) = ±5,2 p.p.` (L1154–1155). A tradução tirou a raiz e trocou o
nome do primeiro termo.

**`secao.simulacao.contas.linha2` — VETADA**

> ✗ _"Dúvida de hoje: **o desacordo entre os institutos** junto com o erro que todas podem cometer
> = ± {{SIGMA_HOJE}} pontos."_

O primeiro termo do modelo é `seAgora` = `max(0,8; sdEntre/√kEff)` = **0,80** — e está **no piso**.
"O desacordo entre os institutos" é `sdEntre` = **2,4**, que o deck publica em
`secao.frente.t2.dispersao`. São dois números diferentes com o mesmo nome, na mesma página. Além
disso o "=" convida a somar: 2,4 + 4,0 = 6,4, e o resultado é 4,1.

> ✓ Dúvida de hoje: o quanto a média das pesquisas ainda pode variar, combinado com o erro que
> todas podem cometer juntas — dá **± {{SIGMA_HOJE}} pontos**. As duas dúvidas não se somam: juntas
> dão menos que a soma.

**`secao.simulacao.contas.linha3` — VETADA** (mesmo motivo)

> ✓ Dúvida no dia da votação: a dúvida de hoje combinada com o quanto a corrida ainda pode andar —
> dá **± {{SIGMA_DIA}} pontos**. Aqui também não se somam: {{SIGMA_HOJE}} e {{DERIVA_PT}} juntos
> dão {{SIGMA_DIA}}, não a soma dos dois.

---

## 4. APROVADAS COM EMENDA — a Fase 6 aplica a substituta

| Chave                                                                                                                   | Frase problemática (trecho)                                                                                                                        | Por que distorce (campo)                                                                                                                                                                                                                       | Redação substituta                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `marca.compartilhar.texto`                                                                                              | "…Veja de onde vem esse número."                                                                                                                   | é o texto que viaja sozinho no WhatsApp; a ressalva de H4 fica na página e não no card                                                                                                                                                         | "Em 100 eleições parecidas com esta, Lula é eleito em {{ELEITO_LULA}} e Flávio em {{ELEITO_FLAVIO}}. **Não é previsão** — veja de onde vem esse número."                                                                                                                                                    |
| `hero.manchete.rodape`                                                                                                  | "o mesmo que {{ELEITO_LULA_PCT}} × {{ELEITO_FLAVIO_PCT}}"                                                                                          | "83% × 17%" ao lado de "47% × 42%" (intenção de voto) faz o leitor ler chance como divisão de votos; "×" é a forma de placar (VOZ §5.3)                                                                                                        | "o mesmo que dizer {{ELEITO_LULA_PCT}} de chance para Lula e {{ELEITO_FLAVIO_PCT}} para Flávio"                                                                                                                                                                                                             |
| `hero.traduzindo`                                                                                                       | "100 cenários compatíveis com **as pesquisas de hoje**"                                                                                            | `eleito.dia` inclui `deriva2`; os cenários não são só das pesquisas de hoje — contradiz `hero.naoEPrevisao` na mesma dobra                                                                                                                     | "…monta 100 cenários compatíveis com as pesquisas de hoje **e com o quanto a corrida ainda pode andar até outubro**, e conta em quantos deles cada um termina eleito. …"                                                                                                                                    |
| `hero.caminho`                                                                                                          | "Caminho mais provável: {{P_2T}} … Em {{P_1T_DEF}} …"                                                                                              | `p2Tacontece = 1 − p1L − p1F` exatamente; arredondar os dois em separado pode dar 101 (hoje escapa por 91,5→92 e 8,49→8). E "caminho mais provável" só vale se `P_2T > 50`                                                                     | manter o texto, **acrescentar a regra**: arredondar `{{P_2T}}` e fazer `{{P_1T_DEF}} = 100 − {{P_2T}}` (VOZ §2.3); e trocar o prefixo por "**Como a eleição se decide:**", que vale nos dois estados                                                                                                        |
| `hero.avisoVies` · `hero.veredito.sufixoVies` · `secao.simulacao.slider4.valor.flavio` · `secao.simulacao.slider4.aria` | "{{VIES}} pontos a favor de Flávio"                                                                                                                | a régua vai de −3 a +10; com `vies` negativo renderiza "**−1,0 pontos a favor de Flávio**" — sinal e direção dizem a mesma coisa duas vezes e se anulam na leitura                                                                             | usar `{{VIES_ABS}}` (§5) em toda frase que já diga a direção por extenso: "1,0 ponto a favor de Flávio"                                                                                                                                                                                                     |
| `hero.veredito.empate.texto`                                                                                            | "é menor que a dúvida"                                                                                                                             | a faixa é fixada em `eleito.dia` (combinado), e a comparação é feita com `sigmaDia2` (só 2º turno): há estados da faixa em que a afirmação inverte                                                                                             | "A diferença de {{MARGEM_AJ_ABS}} pontos na decisão é pequena diante da dúvida, que é de cerca de {{SIGMA_DIA}} pontos para cada lado. Pelos números de hoje, qualquer um dos dois pode ser eleito."                                                                                                        |
| `hero.veredito.favorito.titulo`                                                                                         | "provável, não garantido" (faixa 75–90)                                                                                                            | H2 manda "ainda pode mudar" **abaixo de 90**; "não garantido" é a cláusula de 90+ e não informa que a corrida ainda anda                                                                                                                       | "{{LIDER}} está na frente — provável, mas **ainda pode mudar**"                                                                                                                                                                                                                                             |
| `secao.frente.resposta`                                                                                                 | "**Nas pesquisas** do 2º turno, Lula tem {{MEDIA_L2}}%"                                                                                            | `mediaL2` é a média ponderada do painel, não o que cada pesquisa diz (H11)                                                                                                                                                                     | "**Na média das pesquisas** do 2º turno, Lula tem {{MEDIA_L2}}% e Flávio {{MEDIA_F2}}% — diferença de {{MARGEM_ABS}} pontos, cerca de {{MARGEM_PESSOAS}} pessoas a mais em cada 100."                                                                                                                       |
| `secao.frente.traduzindo`                                                                                               | "Estes são os números **crus** das pesquisas"                                                                                                      | não são crus: são média com peso por recência e amostra                                                                                                                                                                                        | "Estes são os números das pesquisas, sem projeção: a média que o painel faz do que os institutos mediram até agora. …"                                                                                                                                                                                      |
| `secao.frente.t2.validos`                                                                                               | (não diz o que falta para 100)                                                                                                                     | `mediaL2 + mediaF2` = 89,2: 10,8% somem sem explicação, ao lado de números de voto válido                                                                                                                                                      | acrescentar ao fim: "O que falta para 100 é branco, nulo e quem ainda não sabe."                                                                                                                                                                                                                            |
| `secao.frente.t2.dispersao`                                                                                             | "discordam entre si em cerca de {{SD_ENTRE}} pontos"                                                                                               | `sdEntre` é a dispersão da **diferença**, não do número de cada um                                                                                                                                                                             | "Os institutos discordam entre si em cerca de {{SD_ENTRE}} pontos **na diferença entre os dois**."                                                                                                                                                                                                          |
| `secao.frente.t2.faixa80`                                                                                               | "essa faixa inclui vitória apertada de Flávio na ponta de baixo"                                                                                   | só vale enquanto `int80[0] < 0` (hoje −1,9). E `int80` está na base "todas as pessoas ouvidas", não em votos válidos                                                                                                                           | "Em 8 de cada 10 cenários, a diferença **medida nas pesquisas** fica entre {{INT80_MIN}} e {{INT80_MAX}} pontos." + variante condicional `…faixa80.incluiFlavio` → "A ponta de baixo dessa faixa é uma vitória apertada de Flávio." (renderizada só se `int80[0] < 0`)                                      |
| `secao.frente.t1.validos`                                                                                               | "abaixo da metade que evitaria o 2º turno"                                                                                                         | verdadeiro só enquanto `t1valL < 50` (hoje 46,0)                                                                                                                                                                                               | "Em votos válidos, Lula tem cerca de {{T1_VAL_L}}% — **faltam {{FALTA_50}} pontos** para a metade que evitaria o 2º turno." (some sozinha quando o sinal virar)                                                                                                                                             |
| `secao.virar.resposta`                                                                                                  | "Em {{T2_FLAVIO}} de cada 100 cenários … é Flávio quem ganha a decisão"                                                                            | 18 (`1−pL2dia`) contra os 17 (`eleito.dia.f`) da manchete, sem reconciliação nesta seção                                                                                                                                                       | "Pode. Em {{T2_FLAVIO}} de cada 100 cenários para 25 de outubro, é Flávio quem ganha a decisão — e em {{ELEITO_FLAVIO}} de cada 100 ele termina eleito, contando os dois caminhos."                                                                                                                         |
| `secao.virar.faixa80`                                                                                                   | "a diferença final fica entre …"                                                                                                                   | mesma troca de base do item acima                                                                                                                                                                                                              | "Em 8 de cada 10 cenários, a diferença **medida nas pesquisas** fica entre {{INT80_MIN}} e {{INT80_MAX}} pontos."                                                                                                                                                                                           |
| `secao.pesquisas.resposta`                                                                                              | "pesquisas **recentes** … nas outras, Lula aparece na frente"                                                                                      | "recentes" = `idadeDias < 35`, não dito; e "nas outras" é conclusão escrita à mão, não campo do modelo                                                                                                                                         | "{{QTD_EMPATE}} das {{QTD_RECENTES}} pesquisas dos últimos 35 dias estão em empate técnico; nas outras {{QTD_NAO_EMPATE}}, Lula aparece na frente."                                                                                                                                                         |
| `secao.outros.aba.todos`                                                                                                | "Todos os candidatos ({{N_CANDIDATOS}})"                                                                                                           | `campoCompleto.linhas` só traz quem está em `CANDIDATOS`; há nome em `outros1` fora da lista                                                                                                                                                   | "Candidatos testados nas pesquisas ({{N_CANDIDATOS}})"                                                                                                                                                                                                                                                      |
| `secao.contexto.resposta`                                                                                               | "a diferença anda **em décimos**, não em saltos"                                                                                                   | a média do painel andou 7,0 → 3,6 → 5,9 → 4,7: pontos inteiros, e o gráfico da seção anterior mostra isso                                                                                                                                      | "Os dois lados têm voto fechado e rejeição alta. Por isso a diferença anda devagar, e quase sempre dentro da mesma faixa."                                                                                                                                                                                  |
| `secao.simulacao.slider2.dica` · `secao.simulacao.slider4.dica`                                                         | "esse erro foi de 6,3 pontos no 1º turno"                                                                                                          | `ERRO_2022.t1.margem` é erro **na diferença** (Lula −1,0 · Flávio +5,3); ao lado de "47%" o leitor mapeia 6,3 no número de um candidato                                                                                                        | trocar por "6,3 pontos **na diferença entre os dois** no 1º turno e 3,1 no 2º" nas duas dicas. **O resto das duas dicas está aprovado como está** — âncoras 6,3 / 3,1 / 4,0, estado calibrado × não calibrado, desconto de véspera e "não se somam" todos preservados, com fidelidade exemplar ao protótipo |
| `secao.simulacao.slider3.valor`                                                                                         | "± {{DERIVA_PT}} pontos até 25 de outubro"                                                                                                         | `deriva2` é um desvio-padrão, não um limite; "±" lido como teto vira certeza                                                                                                                                                                   | "cerca de {{DERIVA_PT}} pontos para cada lado, até 25 de outubro"                                                                                                                                                                                                                                           |
| `secao.simulacao.restaurar.detalhe`                                                                                     | "21 dias · 4,0 pontos · sem puxada"                                                                                                                | são 4 réguas; a deriva (0,35 ×√dias) não aparece — o botão promete restaurar o que não lista                                                                                                                                                   | "21 dias · 4,0 pontos · corrida pode andar {{DERIVA_PT}} pontos · sem puxada"                                                                                                                                                                                                                               |
| `secao.erro2022.curva.virada` · `secao.erro2022.curva.legenda`                                                          | "ponto de virada: {{MARGEM}}" / "as duas linhas se cruzam quando a puxada fica **do tamanho da diferença medida**"                                 | o cruzamento real é **+4,81**, não 4,72: com `vies` = margem, `margemAj` = 0 mas `elD` = 50,7, porque o caminho de vitória no 1º turno sobrevive. Rótulo e desenho discordam (H3)                                                              | `virada` → "ponto de virada: perto de {{MARGEM}}"; `legenda` → "O ponto preto é a virada: as duas linhas se cruzam quando a puxada suposta fica **perto do tamanho** da diferença medida ({{MARGEM}} pontos). Puxada maior que isso a favor de Lula inverte quem está na frente."                           |
| `secao.erro2022.cenario1.texto`                                                                                         | "A média acerta e a diferença de {{MARGEM}} pontos é real."                                                                                        | afirma o que é hipótese do cartão                                                                                                                                                                                                              | "**Nesta hipótese** a média acerta, e a diferença de {{MARGEM}} pontos é a real. É assim que o painel calcula por padrão."                                                                                                                                                                                  |
| `secao.erro2022.replay.card1.texto`                                                                                     | "**Ninguém chega à metade**: teria 2º turno"                                                                                                       | categórico ao lado do próprio selo do cartão, que diz "vai a 2º turno em 99 de cada 100"                                                                                                                                                       | "Pelos números centrais, ninguém chega à metade: em {{REPLAY_P2T}} de cada 100 cenários dessa hipótese haveria 2º turno, com uma chegada apertada de {{REPLAY_M1}} pontos, em vez dos {{T1_DIF}} das pesquisas. Lula chegar em 1º lugar acontece em {{REPLAY_PLIDER}} de cada 100."                         |
| `secao.erro2022.replay.card3.texto`                                                                                     | "um resultado perto de {{REPLAY_R2L_INT}} × {{REPLAY_R2F_INT}} apareceria **em quase todos os cenários** — Lula em {{REPLAY_EL_HOJE}} de cada 100" | mistura duas coisas: "quase todos" sugere a chance do placar, e o número dado (98) é a chance de Lula ser **eleito**. Um placar exato não tem "quase todos os cenários"                                                                        | "…Se a votação fosse hoje sob essa hipótese, a dúvida quase desapareceria: a diferença ficaria perto de {{REPLAY_R2L_INT}} × {{REPLAY_R2F_INT}} e Lula seria eleito em {{REPLAY_EL_HOJE}} de cada 100 cenários. É a distância até outubro que derruba esse número para {{REPLAY_EL_DIA}}."                  |
| `secao.cenarioBase.passo1.texto`                                                                                        | "**Ninguém passa da metade**: vai para o 2º turno em {{P_2T}} de cada 100"                                                                         | categórico + probabilístico na mesma frase                                                                                                                                                                                                     | "Na maioria dos cenários ninguém passa da metade: vai para o 2º turno em {{P_2T}} de cada 100. Lula chega em 1º lugar em {{P_LULA_1}} de cada 100."                                                                                                                                                         |
| `secao.cenarioBase.passo3.texto`                                                                                        | "Lula {{PLACAR_L}}% × Flávio {{PLACAR_F}}% dos votos válidos. Em 8 de cada 10 cenários, a diferença fica entre {{INT80_MIN}} e {{INT80_MAX}}"      | duas bases na mesma frase: o placar é voto válido (52,6 × 47,4 = **5,3 pontos**) e `int80` é a diferença medida nas pesquisas (centro **4,7**). O leitor subtrai e não bate — e VOZ §3 proíbe explicitamente comparar as duas bases            | "Lula {{PLACAR_L}}% × Flávio {{PLACAR_F}}% dos votos válidos. Em 8 de cada 10 cenários, a diferença **medida nas pesquisas** fica entre {{INT80_MIN}} e {{INT80_MAX}} pontos."                                                                                                                              |
| `secao.cenarioBase.bandas.flavio` · `.ate5` · `.5a10` · `.mais10`                                                       | "Lula ganha por até 5 pontos" etc.                                                                                                                 | as bandas saem de `N(margemAj, sigmaDia2)`, na base das pesquisas; hoje a banda modal é "0–5" (34%) enquanto o placar do cartão vizinho implica 5,3 — contradizem-se na tela                                                                   | "Flávio na frente" · "Lula por até 5 pontos **nas pesquisas**" · "Lula por 5 a 10 **nas pesquisas**" · "Lula por mais de 10 **nas pesquisas**" (o "nas pesquisas" pode ir uma vez só, no título `bandas.titulo`: "De quanto pode ser a diferença no fim, do jeito que as pesquisas medem")                  |
| `secao.cenarioBase.comoFoiFeito.texto`                                                                                  | "vai perguntando … e fica sempre com a resposta mais provável"                                                                                     | encadear respostas modais não produz o cenário conjunto mais provável; o número final (`pElei`) está certo, a narrativa sugere que ele sai da corrente                                                                                         | acrescentar após a 1ª frase: "Cada resposta é a mais provável da sua pergunta — juntas elas descrevem o caminho mais comum, não o único."                                                                                                                                                                   |
| `secao.cenarioBase.notaFrequencia`                                                                                      | "Um resultado com {{P_CONTRA}} de chance em 100 contra acontece…"                                                                                  | frase truncada ("de chance em 100 contra"), ilegível na primeira leitura                                                                                                                                                                       | "Leitura das pesquisas, não previsão nem torcida. Um resultado que aparece em {{P_CONTRA}} de cada 100 cenários acontece, no longo prazo, 1 vez a cada {{UMA_EM}} eleições parecidas."                                                                                                                      |
| `secao.metodo.item3` · `metodologia.classificacao.simples`                                                              | "de 50 a 60 em 100 **é empate**"                                                                                                                   | é a terceira coisa chamada "empate" na mesma página (a coluna zero do enxame e o empate técnico das pesquisas são as outras duas), e uma chance de 58 não é empate nenhum. `hero.veredito.empate.titulo` já resolveu isso com "está em aberto" | "de 50 a 60 em 100 **está em aberto**; de 60 a 75, na frente por pouco; de 75 a 90, na frente; acima de 90, bem na frente — e nem aí é garantia."                                                                                                                                                           |
| `secao.metodo.traduzindo`                                                                                               | "**Nada aqui é palpite**: as contas estão abertas."                                                                                                | mesmo problema de `comoLer.rodape`: as quatro réguas são suposições                                                                                                                                                                            | "Nada aqui é torcida: as contas estão abertas e as quatro suposições do painel ficam à vista."                                                                                                                                                                                                              |
| `glossario.votosValidos`                                                                                                | "depois de tirar os brancos, os nulos e **quem não sabe**"                                                                                         | na lei, voto válido é total menos branco e nulo. O painel calcula `100·lula/(100−bnns)`, tirando também os indecisos — o que é certo para pesquisa e não é a definição do termo                                                                | "É o bolo de votos depois de tirar os brancos e os nulos. Nas pesquisas também se tira quem ainda não sabe, porque essa pessoa ainda não escolheu. É esse bolo que decide se alguém passou da metade e ganhou já no 1º turno."                                                                              |
| `historico.mudouPorQue`                                                                                                 | "A chance mudou de {{ANTES}} para {{DEPOIS}} … **quando entrou** a pesquisa do {{INSTITUTO}}"                                                      | a chance muda **todo dia sem pesquisa nova**: `dias2T` cai, `deriva2 = 0,35·√dias` encolhe e a probabilidade se afasta de 50. Creditar a variação inteira a uma pesquisa é H10 aplicado com a causa errada                                     | "Quando entrou a pesquisa do {{INSTITUTO}}, que puxou a diferença {{PARA_ONDE}}, a chance passou de {{ANTES}} para {{DEPOIS}} em 100. Parte do movimento de um dia para o outro também vem do calendário: quanto menos tempo falta, menos a corrida ainda pode andar."                                      |

---

## 5. Lacunas de mapeamento (§A / §A.2) — bloqueiam a Fase 6

O mapeamento existente **está correto onde existe** — conferi campo a campo contra
`nucleo.ts`/`derivados.ts`: `{{ELEITO_*}}` → `eleito.dia` ✔, `{{T2_*}}` → `pL2dia` ✔ (é mesmo o
enxame, DESIGN-V2 §2.1), `{{T1_L}}` → `t1raw` ✔ e `{{T1_VAL_L}}` → `t1valL` ✔ (turno bruto ×
válidos não foram trocados), `{{MARGEM}}`/`{{MARGEM_AJ}}` ✔, `{{INT80_*}}` ✔, `{{P_2T}}` →
`p2Tacontece` ✔, `{{QTD_EMPATE}}`/`{{QTD_RECENTES}}` ✔. **Os defeitos estão nas frases que descrevem
um evento diferente do campo que carregam**, não na tabela.

Três buracos, porém, impedem a Fase 6 de renderizar:

**(a) `{{REPLAY_*}}` não tem tabela.** §A diz "ver §L" e §L não traz mapeamento nenhum — justamente
o bloco mais delicado (H6). O mapa correto, contra `calcReplay` (`derivados.ts` L124–163):

| Placeholder                                 | Campo                       | Formato                                         |
| ------------------------------------------- | --------------------------- | ----------------------------------------------- |
| `{{REPLAY_R1L}}` · `{{REPLAY_R1F}}`         | `replay.r1L` · `r1F`        | 1 casa (45,0 · 42,5)                            |
| `{{REPLAY_R2L}}` · `{{REPLAY_R2F}}`         | `replay.r2L` · `r2F`        | 1 casa (51,0 · 49,0)                            |
| `{{REPLAY_R2L_INT}}` · `{{REPLAY_R2F_INT}}` | `round(r2L)` · `round(r2F)` | inteiro; devem somar 100                        |
| `{{REPLAY_M1}}`                             | `r1L − r1F`                 | 1 casa (+2,6)                                   |
| `{{REPLAY_M2}}`                             | `r2L − r2F`                 | 1 casa (+2,1)                                   |
| `{{REPLAY_P2T}}`                            | `p2Trep × 100`              | inteiro, com piso (99)                          |
| `{{REPLAY_PV2}}`                            | `pV2rep × 100`              | inteiro (69) — **condicional a haver 2º turno** |
| `{{REPLAY_PLIDER}}`                         | `pLider1 × 100`             | inteiro (73)                                    |
| `{{REPLAY_P1_DIRETO}}`                      | `p1Ld × 100`                | inteiro, com piso (1)                           |
| `{{REPLAY_EL_DIA}}` · `{{REPLAY_EL_DIA_F}}` | `elRepD × 100` · `100 −`    | inteiros, soma 100 (69 · 31)                    |
| `{{REPLAY_EL_HOJE}}`                        | `elRepH × 100`              | inteiro, com teto (98)                          |
| `{{REPLAY_P_PAINEL}}`                       | `pPainel × 100`             | inteiro (63)                                    |

**(b) Placeholders novos exigidos pelas substitutas acima:**

| Novo                                                   | Como se calcula                                     | Onde é usado                                |
| ------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------- |
| `{{VIES_ABS}}`                                         | `\|params.vies\|`, 1 casa                           | toda frase que já diz a direção por extenso |
| `{{P_V2_ABS}}`                                         | `round(p2Tacontece × cenBase.pV2 × 100)` = 75       | `cenarioBase.resposta`, `.passo2.texto`     |
| `{{P_1T_DIRETO}}`                                      | `round(cenBase.pDireto × 100)` = 8                  | `cenarioBase.passo2.texto`                  |
| `{{REPLAY_V2_ABS}}`                                    | `round(p2Trep × pV2rep × 100)` = 68                 | `replay.card3.conta`                        |
| `{{MARGEM_INICIO}}`                                    | `serie2[0].l − serie2[0].f`, 1 casa = 7,0           | `secao.evolucao.resposta`                   |
| `{{QTD_NAO_EMPATE}}`                                   | `qtdRecentes − qtdEmpate` = 4                       | `secao.pesquisas.resposta`                  |
| `{{INSTITUTO_INVERTIDO}}` · `{{MARGEM_INVERTIDA_ABS}}` | instituto recente com `margem2 < 0` e `\|margem2\|` | `secao.frente.t2.empates`                   |
| `{{FALTA_50}}`                                         | `50 − t1valL.valor`, 1 casa = 4,0                   | `secao.frente.t1.validos`                   |

**(c) Duas regras de renderização que faltam na §A:**

1. **Piso e teto (H13 / `pctComPiso`)** em todo percentual de chance — a lista está no §3.5. Hoje
   `{{P1_F_DIA}}` já renderiza "0".
2. **Complemento em vez de arredondamento duplo (H3 / VOZ §2.3)** para todo par que deve somar 100:
   §A já marca `{{ELEITO_*}}` e `{{T2_*}}`, mas falta em `{{P_2T}}`/`{{P_1T_DEF}}`,
   `{{VALIDO_L2}}`/`{{VALIDO_F2}}`, `{{P_L}}`/`{{P_F}}`, `{{SIM_LULA}}`/`{{SIM_FLAVIO}}`,
   `{{PLACAR_L}}`/`{{PLACAR_F}}` e `{{REPLAY_EL_DIA}}`/`{{REPLAY_EL_DIA_F}}`.

---

## 6. Notas que não são veto

- **A tradução consertou um bug do protótipo, e isso é mérito.** `nucleo.ts` L339 monta
  _"viés assumido de X p.p. **pró-direita** nas pesquisas"_ quando `vies > 0` significa pesquisas
  **superestimando Lula** (`tipos.ts`) — o protótipo se contradiz com `CENARIOS_VIES` ("erram +3,1
  **pró-Lula**"). O deck resolveu para o lado certo (`{{DIRECAO}}`: `vies > 0 → "a favor de Lula"`,
  e a dica 4 diz "as pesquisas estariam dando a Lula mais do que ele tem"). **Aprovado.** Fica o
  aviso: `M.titulo` e `M.texto` continuam existindo no modelo com caixa alta, "p.p." e essa palavra
  errada — **não podem ser publicados**; a v2 os substitui por `hero.veredito.*`.
- **As analogias canônicas passam**, com uma ressalva cada:
  - _"folga da medida"_ (margem de erro) — correta em pesquisa isolada; **mente quando descreve a
    diferença entre os dois**, onde a folga é o dobro (§3.1). Corrigido nas 4 chaves.
  - _"puxada para um lado"_ (viés) — sempre pergunta e hipótese no deck ("Isto é um teste, não uma
    acusação"). ✔
  - _"o quanto a corrida ainda pode andar"_ (deriva) — ✔, inclusive o limite ("não diz para que
    lado"). Só o "±" de `slider3.valor` sugere teto (emenda).
  - _"quanto tempo uma pesquisa continua valendo"_ (meia-vida) — ✔ e a dica explica a metade
    exatamente como `exp(−ln2·idade/meiaVida)` faz.
- **O glossário está correto** em 12 dos 13 verbetes; `empateTecnico` está vetado e
  `votosValidos` tem emenda. `chance` é o único lugar onde "1 em 10" aparece, como VOZ §2.2 manda. ✔
- **`metodologia.seletor.dica`** — _"A simples não tira nada: só troca as palavras difíceis"_ — hoje
  é falsa (a camada simples perdeu o 2× do empate técnico e a raiz da fórmula). **Volta a ser
  verdadeira quando os vetos §3.1 e §3.7 forem aplicados**; sem eles, ela é a promessa que o resto
  do deck quebra. Não a vetei porque a correção está nos outros itens.
- **`replay.calibracao`** cita "média de 11,6 × urna 5,2" e a constante é 6,3 (11,6 − 5,2 = 6,4).
  Herdado do protótipo, dentro do arredondamento. Sem veto.
- **§W (cobertura do INVENTÁRIO) confere**, com uma falha: a linha "3.7 botão restaurar padrão" dá
  por coberta uma chave que lista 3 das 4 réguas (emenda em `restaurar.detalhe`).
- **`hero.hoje.porQueDifere`, `secao.simulacao.slider1/3.dica`, `secao.erro2022.porQue1T.p1/p2/p3`,
  `podeRepetir`, `podeSerMenor`, `rodape.simples.p1–p4`, §P, §Q, §R, §S** — auditados linha a linha
  e **aprovados sem ressalva**. `porQue1T.p2` ("folga de cerca de 9 pontos vira chegada de cerca de
  2,5") confere: `t1valL − t1valF` = 8,85 e `replay.r1L − r1F` = 2,55. `podeSerMenor` ("de 0,4 a 6,2
  em 2022, quase zero em 2018") confere com `HISTORICO_ERROS`. `rodape.simples.p1` ("20 em 100
  acontece uma vez a cada cinco") está aritmeticamente certo.

---

## 7. Listas finais

### 7.1 VETADAS — bloqueiam a Fase 6 até correção (25)

`hero.enxame.legenda` · `hero.veredito.favorito.texto` · `hero.veredito.amplo.texto` ·
`comoLer.rodape` · `secao.frente.t1.defHoje` · `secao.frente.t1.defDia` · `secao.frente.t1.flavio` ·
`secao.frente.t2.empates` · `secao.virar.oQueDerruba` · `secao.evolucao.resposta` ·
`secao.pesquisas.traduzindo` · `secao.pesquisas.chip.empate.explica` · `secao.outros.nomesPequenos` ·
`secao.simulacao.contas.linha2` · `secao.simulacao.contas.linha3` · `secao.erro2022.resposta` ·
`secao.erro2022.porQue1T.p4` · `secao.erro2022.cenario2.texto` · `secao.erro2022.cenario3.texto` ·
`secao.erro2022.replay.card3.conta` · `secao.erro2022.replay.calibracao` ·
`secao.cenarioBase.resposta` · `secao.cenarioBase.passo2.texto` · `secao.cenarioBase.porQue.texto` ·
`glossario.empateTecnico`

**Mais 2 chaves novas obrigatórias:** `secao.erro2022.cenario2.chances` e
`secao.erro2022.cenario3.chances`. **Mais 2 variantes novas:** `hero.enxame.legenda.fecho.lula` /
`.fecho.flavio`. **Mais 1 variante condicional:** `secao.frente.t2.faixa80.incluiFlavio`.

### 7.2 APROVADAS COM EMENDA — a Fase 6 aplica a redação substituta do §4 (43)

`marca.compartilhar.texto` · `hero.manchete.rodape` · `hero.traduzindo` · `hero.caminho` ·
`hero.avisoVies` · `hero.veredito.empate.texto` · `hero.veredito.favorito.titulo` ·
`hero.veredito.sufixoVies` · `secao.frente.resposta` · `secao.frente.traduzindo` ·
`secao.frente.t2.validos` · `secao.frente.t2.dispersao` · `secao.frente.t2.faixa80` ·
`secao.frente.t1.validos` · `secao.virar.resposta` · `secao.virar.faixa80` ·
`secao.pesquisas.resposta` · `secao.outros.aba.todos` · `secao.contexto.resposta` ·
`secao.simulacao.slider2.dica` · `secao.simulacao.slider3.valor` · `secao.simulacao.slider4.dica` ·
`secao.simulacao.slider4.valor.flavio` · `secao.simulacao.slider4.aria` ·
`secao.simulacao.restaurar.detalhe` · `secao.erro2022.curva.virada` ·
`secao.erro2022.curva.legenda` · `secao.erro2022.cenario1.texto` ·
`secao.erro2022.replay.card1.texto` · `secao.erro2022.replay.card3.texto` ·
`secao.cenarioBase.passo1.texto` · `secao.cenarioBase.passo3.texto` ·
`secao.cenarioBase.bandas.flavio` · `secao.cenarioBase.bandas.ate5` ·
`secao.cenarioBase.bandas.5a10` · `secao.cenarioBase.bandas.mais10` ·
`secao.cenarioBase.comoFoiFeito.texto` · `secao.cenarioBase.notaFrequencia` ·
`secao.metodo.item3` · `secao.metodo.traduzindo` · `glossario.votosValidos` ·
`metodologia.classificacao.simples` · `historico.mudouPorQue`

### 7.3 APROVADAS (298)

Todas as demais chaves das 366 do deck, incluindo os blocos íntegros §P (ações), §Q (frescor),
§R (modo simulação), §S (estados) e §T (rodapé).

---

## 8. Carimbo

**Carimbo condicional.** O COPY-DECK v2 está aprovado para a Fase 6 **sob quatro condições**, todas
verificáveis:

1. As **25 chaves vetadas** entram na tela apenas com a redação substituta deste documento (ou com
   outra que volte a esta mesa).
2. As **43 emendas** são aplicadas — nenhuma delas é opinativa: cada uma corrige distância entre a
   frase e o campo do modelo.
3. Os **buracos de mapeamento do §5** são fechados antes da implementação: a tabela `{{REPLAY_*}}`,
   os 8 placeholders novos, o piso/teto de H13 e a regra de complemento de H3.
4. **`docs/VOZ.md` §3 e H5 são corrigidos** para "menor que **o dobro** da folga da medida". Enquanto
   a regra estiver errada, ela reintroduz o erro que acabei de vetar.

Fora disso, o deck é bom trabalho: a proibição do percentual solto foi respeitada em todas as
chaves de chance; a ordem Lula-esquerda/Flávio-direita não quebrou em lugar nenhum; as âncoras de
2022 (6,3 · 3,1 · 4,0 · calibrado × não calibrado · desconto de véspera · "os erros não se somam")
chegaram inteiras às dicas das réguas; o Replay é apresentado como conta de "e se" em todos os
lugares onde é nomeado — o que ele perde não é a moldura, é o número. E o deck consertou um bug de
direção do viés que o protótipo carrega desde sempre.

O que reprovei tem quase todo um padrão só: **onde a probabilidade era condicional, o texto a
tratou como absoluta.** 69 virou "seria eleito"; `pV2` condicional virou parcela de soma; a folga de
um número virou a folga da diferença; a chance de acabar no 1º turno virou explicação simétrica de
um lado só. Corrigido isso, o produto fala com honestidade.

— _data-scientist, 04/08/2026_

---

## 9. Adendo — despachos sobre as 4 discordâncias do ux-writer

Registradas depois da aplicação integral da auditoria. Nenhuma reabre o veto correspondente.

**1. `secao.frente.t1.flavio` — literal "menos de 1" → `{{P1_F_DIA}}` com `pctComPiso`: APROVADO.**
Ele tem razão: eu fixei o literal para garantir H13 hoje, e o placeholder com piso entrega a mesma
string sem congelar a frase quando `p1.flavioDia` passar de 0,5%. Condição única: o piso tem de
render **"menos de 1"** neste encaixe (a frase já traz "de cada 100 cenários"), e o teto espelhado
("mais de 99") vale para o mesmo campo — o espelho é R4.

**2. `secao.simulacao.slider4.valor.lula` — `{{VIES_ABS}}` por paralelismo: CONFIRMADO.**
A regra é minha e é simétrica por construção (H9): onde a direção vem por extenso, o número vem sem
sinal. Deixar a variante de Lula com sinal e a de Flávio sem seria dar tratamento diferente aos dois
lados da mesma régua. `slider4.valor.zero` ("nenhuma puxada") não é afetada.

**3. `secao.cenarioBase.bandas.*` — canônica é a alternativa: base dita UMA vez em
`bandas.titulo`, chips curtos.** A exigência de honestidade é que a base esteja **na mesma tela**,
não em cada chip; repeti-la em três rótulos de 24px a 390px empurra o texto para o corte, e rótulo
cortado é pior que rótulo econômico. Condição: `bandas.titulo` ("…do jeito que as pesquisas medem")
fica na **mesma dobra** dos chips, nunca colapsado nem atrás de rolagem — se em algum layout ele se
separar, os chips voltam a carregar "nas pesquisas".

**4. `secao.frente.t2.validos` — DEDUPLICA. Fica a primeira ocorrência (o aposto), reescrita para
fazer o trabalho das duas.** Minha frase acrescentada sai (VOZ §4 proíbe explicar o óbvio duas vezes
na mesma tela). Mas o aposto sozinho **define** voto válido sem dizer que é ali que foram parar os
10,8 pontos que faltam em `t2.numeros` — que era o motivo da emenda. Redação final aprovada:

> Em votos válidos — o bolo depois de tirar os {{BN_T2}}% de branco, nulo e quem não sabe, que é o
> que falta para 100 nos números acima — fica {{VALIDO_L2}}% × {{VALIDO_F2}}%.

Placeholder novo, décimo da lista do §5: **`{{BN_T2}}`** = `100 − mediaL2 − mediaF2`, 1 casa
(hoje **10,8**).

— _data-scientist, 04/08/2026_

---

## 10. Adendo — assinatura dos dois itens da Fase 7

Sobre `.qa/iter-v2-1/critica.md`: o BLOCKER do mini-enxame e o MAJOR da dobra de 390.

### 10.1 BLOCKER — o cartão da simulação rotulando o oficial, e 83 escrito sobre 82 desenhado

A crítica está certa nos dois vetos, e o segundo é o meu §2 se repetindo num lugar onde ninguém o
reconciliou. `secao.simulacao.resultado` **é aposentada** e vira duas chaves excludentes, mais uma
legenda para o desenho.

**(a) Estado padrão — `secao.simulacao.resultado.oficial`**

> Com as réguas no padrão, este é o número oficial do painel: Lula é eleito em **{{ELEITO_LULA}}**
> de cada 100 cenários, e Flávio em **{{ELEITO_FLAVIO}}**.

**Condição de renderização (as duas, não uma):** réguas iguais a `PARAMS_PADRAO` **e** série igual à
oficial. Se o leitor tirou ou acrescentou uma pesquisa, é simulação mesmo com as quatro réguas
intocadas — `simulacao.faixa.detalheSerie` existe exatamente porque os dois eixos são independentes.
E o número exibido aqui é `{{ELEITO_LULA}}`, não `{{SIM_LULA}}`: no estado padrão são o mesmo valor
por construção, e usar o placeholder oficial elimina qualquer chance de os dois divergirem por
arredondamento.

**Aria:** `Resultado com as réguas no padrão: {{ELEITO_LULA}} em 100 para Lula, {{ELEITO_FLAVIO}} em 100 para Flávio.`

**(b) Estado alterado — `secao.simulacao.resultado.simulacao`**

> Nesta simulação, Lula é eleito em **{{SIM_LULA}}** de cada 100 cenários, e Flávio em
> **{{SIM_FLAVIO}}**. No painel oficial são {{ELEITO_LULA}} e {{ELEITO_FLAVIO}}.

A segunda frase não é enfeite: é o que transforma o rótulo em informação. Um número de simulação sem
o oficial ao lado obriga o leitor a rolar para saber o que ele mesmo mudou — e H7 pede a volta ao
oficial a um toque, não a uma rolagem. `secao.simulacao.resultado.aria` fica com o texto que já
tinha, aplicado só a este estado.

**(c) O 83 ↔ 82 ali — `secao.simulacao.miniEnxame.legenda` (nova)**

Escolho a via que a crítica sugere primeiro: **a frase colada no desenho usa o número do desenho.** O
mini-enxame é a mesma gramática do hero (DESIGN-V2 §4.2) e desenha os quantis da margem do 2º turno
— não há como desenhar uma probabilidade combinada como quantis de margem, então mudar o desenho
está fora de questão. O que muda é quem fala por ele:

> As bolinhas mostram só a decisão de 25 de outubro: {{SIM_T2_LULA}} caem do lado de Lula e
> {{SIM_T2_FLAVIO}} do lado de Flávio. A frase acima soma também quem ganha já em 4 de outubro — por
> isso dá outro número.

39 palavras. H3 fica intacto (o número escrito ao lado do desenho **é** o desenhado), a reconciliação
existe sem repetir a do hero, e "quem ganha já em 4 de outubro" é neutro: continua verdadeiro se a
régua da puxada inverter o quadro e o mini-enxame passar a ter mais bolinhas do lado de Flávio.

**Aria — `secao.simulacao.miniEnxame.aria`:** `Cem bolinhas, uma por cenário da decisão de 25 de outubro: {{SIM_T2_LULA}} do lado de Lula e {{SIM_T2_FLAVIO}} do lado de Flávio.`

**Placeholders novos (11º e 12º da lista do §5):** `{{SIM_T2_LULA}}` = `pL2dia × 100` do estado
simulado, inteiro, com piso/teto; `{{SIM_T2_FLAVIO}}` = `100 − {{SIM_T2_LULA}}` (complemento, nunca
arredondamento independente).

### 10.2 MAJOR — a legenda do enxame em 55 palavras, com a dúvida dentro

A crítica tem razão e o excesso é meu: a redação do §2 tinha 78 palavras de corpo mais o fecho
condicional. Reescrita, **55 palavras exatas**, com os quatro requisitos e mais um:

> **`hero.enxame.legenda`** — redação canônica, substitui a do §2
>
> Cada bolinha é um resultado possível: nenhuma é o resultado — até outubro isso ainda pode mudar.
> Aqui, só a decisão de 25 de outubro: {{T2_LULA}} do lado de Lula, {{T2_FLAVIO}} do lado de Flávio.
> Em {{P_1T_DEF}} de cada 100 cenários não há 2º turno; esses entram na frase de cima, que dá
> {{ELEITO_LULA}} e {{ELEITO_FLAVIO}}.

O que mudou e por quê:

- **"nenhuma é o resultado — até outubro isso ainda pode mudar"** põe **duas** marcas de dúvida
  dentro da legenda, e a segunda é a cláusula literal de H2. A dobra de 390 passa a carregar dúvida
  mesmo que "Isto não é previsão" e o veredito desçam. Não conflita com a faixa 90+: lá a ressalva
  "não é garantia" continua obrigatória no `hero.veredito.amplo.titulo`, e as duas frases são
  verdadeiras ao mesmo tempo — a deriva existe até o dia da votação em qualquer faixa.
- **"esses entram na frase de cima"** substitui os fechos condicionais. É a mesma explicação, sem
  direção: verdadeira para Lula e para Flávio, e imune à inversão do quadro. Era exatamente a
  assimetria que eu vetei no §2 — resolvida com menos palavras em vez de mais.
- **`hero.enxame.legenda.fecho.lula` e `.fecho.flavio` ficam APOSENTADOS.** Não devem ser
  implementados: duas fontes para o mesmo fato é como o 83 ↔ 82 nasceu. Se o design quiser nomear a
  direção em md+, ela já está publicada em `hero.caminho`, na mesma página.

**Nota sobre o outro MAJOR (nenhum número junto ao desenho).** Ancorar "82" e "18" nas duas metades
do enxame é correto e **reforça** esta legenda: o escrito no desenho, o escrito na legenda e o
desenhado passam a ser o mesmo inteiro nos três lugares (H3). Nenhuma alteração de texto é necessária
para isso — só a exigência de que os rótulos ancorados usem `{{T2_LULA}}`/`{{T2_FLAVIO}}`, os mesmos
placeholders da legenda, e nunca a manchete.

— _data-scientist, 04/08/2026_

---

## 11. Adendo — carimbo dos blocos A–I da iteração 2

Auditado no código real, não no relatório. **3 vetados · 4 com emenda · o resto aprovado.**

### A. `src/components/painel/copia-contexto.ts` — tradução dos 5 cartões

**Os cinco campos `dado`: APROVADOS.** Conferi número a número contra `src/data/contexto.ts`
(intocado): 48/47 · 46/50 · 47,6/51,2 · 42/51 · 47–53 · 46–57 · 47/38 · 36/31 · 27 anos · 25% ·
22/07 · 16/08 · 04/10 · 25/10 — **nenhum trocado, nenhum perdido**. O "conforme o instituto"
sobreviveu. E o desfazimento do "×" está **correto nos quatro pares**: a leitura original ("1º saldo
positivo de Lula") só fecha se o primeiro número for a aprovação, e é assim que os quatro foram
traduzidos. Era o ponto onde um deslize viraria fato fabricado; não houve. O `fonte` de cada cartão
passa intacto pelo `map` (H12 ✔), e o fallback para o texto original quando falta tradução é o
desenho certo — nada some da tela.

**A.1 Cartão 1, `leitura` — APROVADO COM EMENDA.** "incumbente competitivo, não dominante" virou
"costuma disputar de igual para igual — **não larga na frente**, nem está fora da disputa". "Não
dominante" é sobre o tamanho da vantagem; "não larga na frente" é sobre a posição — e a posição é
exatamente o que a manchete da mesma página afirma (Lula em 83 de 100). O cartão passa a parecer
desmentir o painel, dizendo mais do que o dado dele diz.

> ✓ País dividido. Na Quaest foi a primeira vez, desde dezembro de 2024, que mais gente aprova do
> que desaprova. Isso vai na mesma direção da leve melhora de Lula nas pesquisas de voto. Governo
> com aprovação entre 42% e 48% costuma disputar de igual para igual: continua na disputa, mas sem
> vantagem grande.

**A.2 Cartão 2, `leitura` — APROVADO COM EMENDA.** Uma ressalva foi amputada: o original diz
"**~**8–15% de indecisos e brancos" e a tradução fixa "8% a 15%". O til é a única marca de que a
faixa é estimada.

> ✓ …A disputa se decide entre os **cerca de** 8% a 15% que ainda não escolheram ou vão de branco e
> nulo. …

_(o resto do cartão fica: "teto" → "limite" está certo, e trocar "indecisos e brancos" por "ainda
não escolheram ou vão de branco e nulo" aproxima o cartão do `bnns` que o modelo publica — 9,6%,
dentro da faixa. Melhoria, não desvio.)_

**A.3 Cartão 3, `leitura` — VETADO.** Três problemas em duas linhas:

- "…por isso as pesquisas de 2026 **andam de décimo em décimo**, e não aos saltos." É a mesma frase
  que emendei em `secao.contexto.resposta` (§4) — e ela está **falsa contra a série do próprio
  painel**: a média ponderada andou 7,0 → 3,6 → 5,9 → 4,7, e as pesquisas individuais vão de −1,0
  (Gerp) a +8,0 (Quaest). Pior: a `resposta` da seção, 30 linhas acima no mesmo bloco, já foi
  corrigida para "anda devagar". A tela passaria a dizer as duas coisas.
- "tende a oscilar pouco" virou "**a opinião se mexe pouco**": o "tende a" é uma ressalva e foi
  amputado.
- "é voto fechado" virou "**já decidiu e não muda**": o dado é uma resposta declarada ("é o único em
  que votaria"), não uma garantia de comportamento futuro. É certeza fabricada em miniatura (H1).

> ✓ Dois terços de quem vota em cada um já diz que não votaria em mais ninguém. Com o eleitorado
> dividido assim, sobra pouca gente para conquistar — e a opinião tende a se mexer pouco.

_(A frase "sobra pouca gente para conquistar" vinha do cartão-síntese que o bloco H apagou; trazê-la
para cá recupera a ideia sem recriar a repetição.)_

**A.4 Cartões 4 e 5, `leitura` — APROVADOS.** "fundamento matemático da «deriva»" → "é daí que sai a
conta do quanto a corrida ainda pode andar" usa o nome canônico do glossário e a direção está certa
(`deriva = 0,35·√dias`: mais tempo, mais espaço). "choques exógenos com efeito eleitoral ainda
incerto" → "fatos grandes, vindos de fora da disputa, e ainda não se sabe o efeito de nenhum deles"
— a incerteza sobreviveu inteira. Sem reparo.

**Observação de manutenção (não é veto):** o mapa é chaveado pelo `titulo` original. Se um título
mudar em `contexto.ts`, o cartão cai no fallback e o texto v1 — "incumbente competitivo", "choques
exógenos" — volta à superfície pública sem aviso. Vale um teste que falhe quando uma chave de
`CARTOES` não casar com nenhum `CONTEXTO[i].titulo`.

### B. Ponte de vocabulário "folga da medida — a margem de erro" — APROVADO

Nos três lugares (`frente.tsx:99`, `metodologia/page.tsx`, 1ª linha de `GLOSSARIO.margemErro`). Os
dois nomes designam a mesma quantidade, VOZ §5.4 mantém "margem de erro" como termo com chip, e a
ponte é o que permite ao leitor que chega da televisão entender a regra do **dobro** sem achar que é
outra coisa. Confirmado no código que o "o dobro" e o "é essa a folga que vale quando se comparam os
dois números" continuam junto — a ponte não diluiu o veto do §3.1.

### C. Legenda do mini-enxame, cláusula nova — VETADO

> ✗ "A largura da pilha é o tamanho da dúvida: quanto mais espalhadas, **maior a margem de erro**."

A largura da pilha é `sigmaDia2` = **5,2 pontos** — a combinação de três coisas: o quanto a média
ainda pode variar, o erro que todas as pesquisas podem cometer juntas e o quanto a corrida ainda
pode andar. **Margem de erro** é outra coisa: a folga amostral de **uma** pesquisa, que a tabela da
mesma página publica como 1,0 · 2,0 · 2,2. Chamar a largura do enxame de "margem de erro" funde as
três fontes num nome só, contradiz as três linhas de "As contas" logo abaixo (que existem para
separá-las) e desfaz a ponte de vocabulário do bloco B na mesma tela.

A intenção — ensinar a ler a **forma**, não só a contar os lados — é boa e fica. Só o nome muda:

> ✓ As bolinhas mostram só a decisão de 25 de outubro: {{SIM_T2_LULA}} caem do lado de Lula e
> {{SIM_T2_FLAVIO}} do lado de Flávio. A largura da pilha é o tamanho da dúvida **no dia da
> votação**: quanto mais espalhadas, **menos fechada está a disputa**. A frase acima soma também
> quem ganha já em 4 de outubro — por isso dá outro número.

_("menos fechada está a disputa" já é a redação aprovada em `secao.virar.traduzindo`: a mesma forma
passa a ter a mesma explicação nos dois enxames.)_

### D. Glossário `amostra`, exemplo novo — VETADO

> ✗ "…ouvir 2.000 pessoas dá uma folga de cerca de 2 pontos; **ouvir 5.000 dá cerca de 1,4**."

A conta está certa (`0,98/√n`: 2.000 → 2,19; 5.000 → 1,39) e **é justamente por isso que o exemplo
não pode ficar**: a tabela da mesma página tem duas linhas da AtlasIntel com **5.021 e 4.999 pessoas
ouvidas e folga declarada de 1,0**. O leitor que aprender a regra e for conferir encontra o painel
se desmentindo — exatamente o defeito do "empate técnico" que vetei no §3.1. (O "cerca de 2" para
2.000 não tem esse problema: a tabela mostra 2,0 e 2,2 para pesquisas desse tamanho.)

> ✓ É o tamanho da pesquisa. Quanto mais gente ouvida, menor a folga da medida. Exemplo: com 2.000
> pessoas ouvidas a folga fica perto de 2 pontos, e para cortá-la pela metade seria preciso ouvir
> quatro vezes mais gente. Cada instituto calcula a sua, e ouvir mais gente não conserta erro de
> método.

Ensina a lei que importa (a folga cai com a **raiz** do tamanho — quatro vezes mais gente para
metade da folga, exatamente verdadeiro), e nenhuma linha da tabela a contradiz.

**Observação:** os exemplos acrescentados aos outros verbetes foram conferidos e **estão todos
aritmeticamente corretos** — `votosValidos` (47 e 41 com 12% fora dá 53 × 47 ✔), `vies` (4,7 − 3 =
1,7 ✔), `empateTecnico` (folga 2 → 4; vantagem 3 é empate ✔), `projecao` (88 → 83, os números reais
✔) e `peso` (1,00 e 0,05: `exp(−ln2 × 90/21)` = 0,051 ✔). Só noto que os verbetes passaram de 1–2
para 3–4 frases, contra VOZ §5.4 — é chamada do ux-writer, não minha; os exemplos valem o espaço.

### E. Lead "Isto não é previsão." no rodapé — APROVADO

O texto legal continua íntegro no parágrafo seguinte, e o parágrafo de chance ganhou, de quebra,
"dadas as suposições que ficam à vista e que você pode mudar nas réguas" — que é o conserto que
exigi em `comoLer.rodape` e `secao.metodo.traduzindo` (§3.6), agora também onde o leitor mais
desconfiado chega. Nenhum reparo.

### F. Legenda da ilustração — APROVADO COM EMENDA

O diagnóstico do dev está certo e é fino: a ilustração mostra quatro cápsulas, uma inteira do lado
de Flávio, colada na frase "nas outras 4, Lula aparece na frente" — o leitor lia "1 em 4" onde o
painel tem 1 em 13. A legenda resolve _quais_ pesquisas são; falta resolver _quantas_, que é o
número que ele estava lendo errado.

> ✓ Exemplo: quatro pesquisas imaginárias, **só para mostrar como ler a barra**. Não são as
> pesquisas da lista.

### G. Eixo y da curva de sensibilidade — APROVADO

"chance de ser eleito, em cada 100 — a linha tracejada no 50 é a metade a metade". O campo é
`calcSerieSens → elD × 100` (chance de ser **eleito**, projetada), que é o que o rótulo diz; a
unidade é frequência em 100, não percentual solto (VOZ §2.1 ✔); e o cruzamento das duas linhas cai
mesmo sobre y = 50 ✔. Nenhum reparo.

### H. Os dois cortes de repetição

**H.1 Cartão-síntese do contexto — APROVADO.** Nada de estatístico se perdeu: as quatro ideias da
síntese vivem nos cartões 2 ("8% a 15% que ainda não escolheram"), 3 (eleitorado dividido), 4
(propaganda a partir do fim de agosto) e 5 (economia e Justiça). O corte, aliás, foi provocado pela
minha própria emenda em `secao.contexto.resposta`, que criou a duplicata. **Condição:** §W dá
`secao.contexto.sintese.*` como coberto e o INVENTÁRIO manda que nada suma — a supressão precisa
virar linha registrada, não sumiço silencioso.

**H.2 Frase da régua na virada — APROVADO COM EMENDA.** A consolidação da faixa de 80% num lugar só
está certa e conferida (renderiza uma vez, em `frente.tsx`, já com "medida nas pesquisas" e com a
ponta de baixo condicional a `int80[0] < 0` ✔). Mas a frase apagada — "a régua do meio é o empate:
ali os dois teriam o mesmo tanto de voto" — era a **única definição de "empate" naquele bloco**, e
"empate" é a palavra que este produto usa para três coisas diferentes (a coluna do zero, o empate
técnico das pesquisas e a faixa 50–60 da chance). O `traduzindo` restante diz de quem é cada lado,
nunca o que é o meio. Restaura-se sem parágrafo novo, dentro do `traduzindo` que já existe:

> ✓ Cada bolinha é um resultado possível para a diferença no dia da votação, e todas valem o mesmo.
> As que caem à direita da régua são cenários em que Lula ganha; à esquerda, cenários em que Flávio
> ganha. **Na régua, os dois teriam o mesmo tanto de voto.** Quanto mais espalhadas, menos fechada
> está a disputa.

### I. "PT · média de 9 pesquisas" na lista de candidatos — APROVADO, e com elogio

`k` vem de `mediaEm` e é o número de pesquisas que mediram **aquele** nome. Conferido: Lula e Flávio
9, o pelotão do meio 7, a cauda 4. Publicar isso impede a comparação silenciosa entre uma média de 9
pesquisas e uma de 4 como se tivessem o mesmo lastro — é procedência por linha (R4/H12), e foi
iniciativa da implementação, não exigência minha.

### Fecho do §11

Vetados: **`copia-contexto` cartão 3 `leitura`**, **cláusula "maior a margem de erro" da legenda do
mini-enxame**, **exemplo dos 5.000 no glossário `amostra`**. Com emenda: `copia-contexto` cartões 1
e 2 `leitura`, legenda da ilustração, `traduzindo` da virada. Todo o resto — as cinco `dado`, os
cartões 4 e 5, a ponte de vocabulário, o rodapé, o eixo da curva, o corte da síntese e o `k` por
candidato — **aprovado**.

Os três vetos têm a mesma assinatura dos vetos originais: **um nome técnico aplicado à quantidade
errada** (largura do enxame chamada de margem de erro), **uma regra que a própria tabela desmente**
(5.000 → 1,4 contra a AtlasIntel em 1,0) e **uma frase que o próprio gráfico desmente** (décimo em
décimo contra uma série que andou 3,4 pontos). Nenhum deles é opinião: os três são conferíveis na
tela em menos de um minuto.

— _data-scientist, 04/08/2026_

---

## 12. Adendo — o hover por coluna do enxame (leitura acumulada)

Uma frase só. Rodei o enxame na mesma data-base do §0 (`tests/reference/original.mjs` sobre
`pesquisas.seed.json`, `PARAMS_PADRAO`, 03/08/2026 12:00 −03) e montei o layout com o algoritmo
real de `enxame-nucleo.ts`. **Todo número abaixo foi calculado, não estimado.**

Estado oficial: `margemAj` = +4,7177 · `sigmaDia2` = 5,1776 → **coluna de 1 ponto, 28 colunas, de
[−9,−8) a [18,19)**, bolinha de 9,36px a 390, `nFlavio` = 18, `nLula` = 82. (A largura de 2 pontos
é rejeitada pelo teto de pilha: 16 bolinhas dariam 339px contra o limite de 180.)

### 12.1 A tabela que decide o caso

| coluna  | bolinhas | **acumulado da esquerda** | lado   |
| ------- | -------- | ------------------------- | ------ |
| [−9,−8) | 1        | 1                         | Flávio |
| [−8,−7) | **0**    | 1                         | Flávio |
| [−3,−2) | 3        | 10                        | Flávio |
| [−1, 0) | 5        | **18**                    | Flávio |
| [ 0, 1) | 6        | **24**                    | Lula   |
| [ 4, 5) | 8        | 52                        | Lula   |
| [10,11) | 4        | 89                        | Lula   |
| [16,17) | **0**    | 99                        | Lula   |
| [17,18) | **0**    | 99                        | Lula   |
| [18,19) | 1        | **100**                   | Lula   |

Três fatos desta tabela decidem tudo o que vem abaixo: o acumulado na última coluna de Flávio é
**exatamente 18**, o mesmo inteiro já impresso sob o desenho; **três das 28 colunas estão vazias**;
e a última coluna lê **100**.

### 12.2 Veredito da frase proposta — **APROVADA COM EMENDA** (a âncora não é opcional)

> ✗ até aqui, {n} de 100 cenários

A frase **não é falsa**: com a âncora que o autor tem na cabeça, ela é exata. Ela é **incompleta**,
e a lacuna é a palavra que diz de onde se conta. A régua tem UM lugar com nome no desenho — a linha
chamada **"empate"**. É de lá que o leitor mede "aqui", e a partir dela o número está errado:

- na primeira coluna do lado de Lula, [0,1), a frase mostra **24** onde a coluna tem **6 bolinhas**
  e o lado de Lula acabou de começar — erro de **4×**, contável na tela em dez segundos;
- em [4,5), mostra **52** onde a contagem a partir da régua dá **34** — 18 cenários de Flávio
  entram no número sem aviso, 53% a mais.

É a mesma assinatura dos três vetos do §11: **uma frase que o próprio gráfico desmente**. Como o
conserto é uma âncora e não uma reescrita, o selo é emenda — mas a emenda é obrigatória.

### 12.3 Substituta exata

> ✓ **da esquerda até aqui: {n} de 100 cenários**

40 caracteres com `n` de dois dígitos. Quatro razões, nesta ordem de força:

1. **A âncora já está publicada na tela, não neste documento.** `virada.tsx` diz, no `traduzindo`
   do mesmo enxame: _"As que caem à direita da régua são cenários em que Lula ganha; à esquerda,
   cenários em que Flávio ganha"_ — e as pontas do próprio desenho dizem "← Flávio na frente · 18"
   e "82 · Lula na frente →". "Da esquerda" não ensina palavra nova: cobra uma que a página já
   pagou.
2. **A âncora é ESPACIAL de propósito, nunca quantitativa.** Qualquer redação por quantidade vira
   ao cruzar o zero: à direita o acumulado é _"diferença de ATÉ x pontos para Lula"_; à esquerda é
   _"diferença de PELO MENOS |x| pontos para Flávio"_. Mesma aritmética, duas frases opostas, e a
   virada cai exatamente onde o leitor já está confuso. A leitura espacial é a única que atravessa
   a régua com uma frase só — e a única que sobrevive aos estados em que o enxame não tem nenhuma
   coluna de Flávio (`nFlavio` = 0 é alcançável).
3. **"de 100 cenários", nunca "de cada 100 cenários".** "De cada 100" é a forma que VOZ §2.1 exige
   para **chance** — ela promove uma leitura de gesto a probabilidade publicada, e aí a linha
   passaria a dever a ressalva de H2 no hover. "De 100" conta as cem bolinhas que estão na tela,
   que é tudo o que a linha afirma. É o que cumpre a promessa da missão: nenhuma afirmação nova
   sobre o mundo.
4. **A forma não quebra em n = 1** (o valor da primeira coluna): o plural pertence ao 100, então
   "1 de 100 cenários" está certo sem caso especial.

**Descartadas:** nomear o lado ("a partir do lado de Flávio") quebra quando `nFlavio` = 0;
"acumulado" é jargão de §5.1; o complemento ("os outros {100−n} estão à direita") é **permitido,
não exigido** — é honesto e simétrico, mas dobra a linha e a missão já dispensa o número duplo.

### 12.4 Condições de implementação (1 e 2 são veto se descumpridas)

1. **`n` é a soma corrida de `layout.colunas[].qtd` — nunca `normCdf`.** Dois âncoras têm de valer
   exatos: na última coluna de Flávio (`i = −1`) a leitura é **18**, o mesmo inteiro impresso sob o
   desenho; na última coluna é **100**. Calcular a acumulada analiticamente em vez de somar as
   colunas desenhadas erra por uma ou duas bolinhas — foi assim que o 83 ↔ 82 nasceu (§2). H3.
2. **A leitura existe em TODA coluna, inclusive nas vazias.** Hoje três das 28 estão vazias. O alvo
   do hover é a **faixa** da coluna, não o grupo de bolinhas: senão 3 de 28 colunas viram zona
   morta e o número parece pular (1 → 2, e 99 → 100 sem coluna no meio). Sobre coluna vazia o
   número **não muda** — é a resposta certa, e é a que ensina o que uma coluna vazia significa.
3. **Nunca 0; e o 100 fica.** A primeira coluna sempre contém a bolinha 1 por construção (`min` sai
   dos próprios dados), então "0 de 100" é inalcançável — desde que a faixa de hover não comece
   antes dela. Já **"100 de 100 cenários" na última coluna FICA**: H13 e §2.3 governam **chance
   publicada**, não a contagem das bolinhas desenhadas, e "corrigir" para "mais de 99 em 100" seria
   escrever uma falsidade — são exatamente 100, e o leitor acabou de ver o número subir até lá.
   Registro isto aqui para que ninguém conserte depois.
4. **A linha não empurra nada.** Espaço reservado, sempre. Número que aparece sob o desenho e
   desloca o desenho tira do leitor a âncora visual no meio da comparação entre colunas — é o primo
   do "referência que se mexe mente". E, sendo só de ponteiro fino, ela **não pode existir a 390**:
   a dobra de 390 já está calibrada até "Isto não é previsão" (H4).
5. **`aria-hidden` aceito, com condição.** O SVG já publica os dois totais no `rotuloAcessivel`, e a
   linha do hover não é a única casa de nenhum fato — é leitura de gesto sobre números que já estão
   na tela. Tem de continuar assim: no dia em que carregar um fato próprio, deixa de poder ser
   `aria-hidden`.
6. **No mini-enxame (`parametros.tsx`) o número é de simulação** — e está dentro do cartão que já
   carrega o rótulo (H7, §10.1). A linha não pode ser içada para fora desse cartão.

### 12.5 Consistência com a legenda de 55 palavras e com VOZ

- **Sem colisão com `hero.enxame.legenda`.** Os únicos inteiros que o hover compartilha com ela são
  18 e 82, e são o mesmo inteiro por construção (H3). Nenhum 83 ↔ 82 novo: a linha não fala em
  eleição, só em cenários do desenho, e a legenda logo abaixo já faz a reconciliação com 83 e 17.
- **A operação já foi ensinada.** "Como ler esta página", item 2: _"As 100 bolinhas são 100
  resultados possíveis. Conte de que lado da régua elas caem."_ O hover é essa mesma contagem,
  continuada — gramática existente, não gramática nova.
- **VOZ:** §2.2 (denominador 100) ✔ · §2.1 não se aplica, não é chance publicada ✔ · §5.1 sem
  jargão ✔ · §5.3 sem caixa alta ✔ · §1.1 uma ideia por frase ✔ · H1/H2 não disparam (a linha não
  atribui favoritismo a ninguém) ✔ · H9 ✔ — a linha não nomeia candidato, e os dois totais das
  pontas continuam impressos com o mesmo peso.
- **Bônus verificável, e era o risco que eu procurava.** `int80` = [−1,92; +11,35] é, por
  construção, a 10ª e a 90ª bolinha. O acumulado confirma: a coluna [−3,−2) fecha em **10**, e a
  bolinha 90 cai em [11,12). Quem varrer o enxame das pontas encontra a faixa de 80% que
  `frente.tsx` publica — o painel se **confirmando** na tela, não se desmentindo. É o argumento mais
  forte a favor do recurso.

### 12.6 Nota que não é veto — VOZ §2.4 tem a justificativa invertida

VOZ §2.4 (e o comentário de `src/components/ui/textos.ts:16`) diz: _"Lula sempre à esquerda, Flávio
sempre à direita — **porque essa é a posição deles na régua da diferença**"_. Na régua a posição é a
inversa: as três escalas do elemento-assinatura põem **Flávio à esquerda e Lula à direita**
(`enxame-nucleo.ts`, `lado: i >= 0 ? "lula" : "flavio"`; os rótulos de ponta do `enxame.tsx`; a
`ReguaPesquisas` de `barra-pesquisa.tsx`). A **regra** de ordem na prosa continua boa — ordem fixa é
o que impede a ordem de virar juízo (R4); só a **justificativa** está de cabeça para baixo. Nada na
tela muda hoje, mas é a armadilha exata desta frase: quem for escrever a âncora do hover
consultando §2.4 escreve "da esquerda" achando que é o lado de Lula. Trocar a justificativa por
"é a ordem de leitura, e ela é fixa" resolve em uma linha.

### Fecho do §12

**Substituta exata: "da esquerda até aqui: {n} de 100 cenários".** A frase proposta estava a duas
palavras da honestidade, e as duas palavras são a âncora. A leitura acumulada em si é legítima e
bem-vinda: é a acumulada empírica das próprias bolinhas desenhadas, ela reencontra o 18 e o 100 que
a página já imprime, e reencontra a faixa de 80% que ela já publica. O que não pode é atravessar a
régua do empate calada.

— _data-scientist, 05/08/2026_

## 13. Adendo — a série retroativa do /historico (tracejado × linha cheia)

Seis chaves novas para o gráfico "Como a chance mudou com o tempo", que passa a ter pontos
RETROATIVOS: o modelo determinístico re-rodado em cada data passada, usando só as pesquisas com
`campo_fim <= data`, desenhado TRACEJADO antes da fronteira do primeiro registro ao vivo. Auditei
contra o código real (`src/components/historico/serie.ts`,
`src/components/graficos/probabilidade-tempo.tsx`, `src/app/historico/page.tsx`) e contra o seed —
que **não guarda data de divulgação** de pesquisa nenhuma, só `inicio` e `fim` do campo.

**Contagem: 0 vetadas · 4 com emenda · 2 aprovadas verbatim.** Textos finais na seção V do
COPY-DECK (chaves `historico.grafico.*`).

### 13.1 A palavra que caiu em três chaves: "recalculado"

Não se recalcula o que nunca foi calculado. Naquelas datas não houve conta nenhuma — o painel não
existia. "Recalculado depois" insinua que existia um valor original daquela data, depois refeito:
é exatamente a sugestão de registro histórico que a missão proíbe. Virou **"calculado depois"**,
e o par com o tooltip do vivo ficou paralelo: **calculado depois × registrado no dia**.

### 13.2 Emendas além do §13.1

- **`traduzindo`** — "…cujo trabalho de campo já tinha terminado naquela data" era FALSA no
  trecho da linha cheia (pesquisa com campo encerrado mas ainda não aprovada não entrou na conta
  do dia). "Conhecidas até aquela data" é verdadeira nos dois trechos. A frase antiga da "faixa
  em volta" morreu junto: o gráfico não tem faixa, de propósito (H14).
- **`legendaReconstituido`** — 27 palavras viraram três frases; "rodamos o mesmo modelo" virou
  "fizemos a mesma conta" (§1.3 — e "a mesma" é a afirmação de honestidade que importa).
- **`contagem`** — o par assimétrico "retratos registrados" × "pontos calculados" é DELIBERADO:
  "retrato" é vocabulário reservado ao que foi tirado no próprio dia. Não harmonizar.
- **`ressalvaConhecimento`** — "cada pesquisa só foi divulgada alguns dias depois" era universal
  e inverificável (o seed não guarda data de divulgação; H8). Afirma-se só o certo por
  construção ("só chegou ao público depois do fim do campo") com o "alguns dias" rebaixado a
  típico ("em geral").

### 13.3 Onde mora a ressalva

**Sob o gráfico, no /historico** — H4 ("a dúvida mora na mesma tela do número") e uma razão
mecânica: legenda e tooltip usam a palavra "conhecidas"; a definição dela não pode morar noutra
página. A /metodologia pode ganhar a versão técnica EM ADIÇÃO (recomendado, não condição).

### 13.4 Condições de implementação (1–4 são veto se descumpridas)

1. **{{L}}/{{F}} somam 100** na contagem E no tooltip — `parEmCem` (arredonda um, complementa o
   outro). O arredondamento separado publicaria 83 × 18 = 101.
2. **H13**: "100 em 100"/"0 em 100" não são publicáveis — piso/teto de prosa do próprio
   `parEmCem` ("mais de 99", "menos de 1").
3. **Tracejado só ANTES do primeiro registro ao vivo.** Buraco no meio da série cheia não pode
   ser preenchido com ponto retroativo sob esta legenda — se um dia se quiser, a legenda volta
   para auditoria.
4. **O tracejado é derivado, nunca estocado como verdade**: mudou a lista oficial → recalcular
   (o botão do /admin existe para isso; o texto dele avisa).
5. Estados de borda tratados: `fronteiraMs === null` → sem a 3ª frase da legenda e sem rótulo de
   fronteira; `N_REC = 0` → volta à frase de contagem simples; singular/plural tratados.
6. Datas em dd/mm quando a série não cruza ano (VOZ §8); com ano quando cruzar.

### 13.5 Nota (não é veto)

No tracejado a linha anda mesmo em semanas sem pesquisa (o calendário encolhe a deriva). A causa
já tem redação aprovada (§4, `historico.mudouPorQue`, frase do calendário) — reusada verbatim na
tela do gráfico, junto da ressalva.

### Fecho do §13

Nenhum veto: a arquitetura nasceu honesta — dois traços, fronteira nomeada, tooltip que declara a
origem de cada ponto, e o código recusa fingir registro quando tudo é reconstituído.

---

## 14. Adendo — a página por pesquisa (/pesquisas/[slug]), o índice e o widget\n\nDez chaves novas, auditadas como TEMPLATE (variáveis entre chaves) contra `docs/VOZ.md`\n(H1–H14, §1–§5), o modelo (`nucleo.ts` / `derivados.ts`) e os vetos já assentados nos §3–§5.\nBase numérica do §0: `empate2` = `|margem2| ≤ 2 × moe` · `margem` = `margemAj` = +4,72 no\nestado oficial (`vies` padrão = 0) · PoderData com diferença 3,0 e folga 2,0 marcada empate ·\n13 pesquisas na série oficial.\n\n**Contagem: 1 vetada · 7 com emenda · 2 aprovadas verbatim** (mais os títulos de\n`pesquisas.indice` e `imprensa`, aprovados).\n\n### 14.1 A vetada — o empate técnico perdeu o fator 2 pela terceira vez\n\n**`pesquisa.vsMediaEmpate` — VETADA.**\n\n> ✗ \"…a diferença ficou dentro da folga da medida…\"\n\nÉ o mesmo erro do §3.1, e aqui ele é falsificável **pelos campos impressos no próprio\ncartão**: a ficha da PoderData publica diferença 3,0 e folga 2,0 — e 3,0 não está dentro de\n2,0. O gatilho é `empate2` (`|margem2| ≤ 2 × moe`), então toda pesquisa com diferença entre\n1× e 2× a folga desmente a frase na mesma dobra. Redação substituta:\n\n> Nesta pesquisa, a diferença ficou menor que o dobro da folga da medida — a folga que vale\n> quando se comparam os dois números. Ela não consegue dizer quem está na frente; isso não\n> quer dizer que os dois estão iguais. Na média do painel hoje, a diferença é de\n> {{DIF_MEDIA}} pontos {{DIRECAO_MEDIA}}.\n\nA última frase é a segunda frase de `pesquisa.vsMedia`, **verbatim e de propósito** — o mesmo\nfato com as mesmas palavras (§10.2); e o estado empate não perde a comparação com o painel\nque o estado normal tem (H9).\n\n### 14.2 Emendas — texto final por chave\n\n- **`pesquisa.papelNaSerie`** — \"diz menos que a média\" é o que a analogia canônica da média\n proíbe (VOZ §3 / H11: a média não é mais certa que as pesquisas — reduz o vaivém, não o\n erro comum). E a 1ª aparição de \"média\" na página carrega a forma longa (§5.1).\n\n > Esta é uma das {{N_PESQUISAS}} pesquisas que alimentam a média do painel. A média dá\n > mais peso às pesquisas mais novas e com mais gente ouvida. Nenhuma decide sozinha: o\n > painel é a leitura de todas juntas.\n\n- **`pesquisa.tendenciaInstituto`** — \"rodada\" banida (§5.1); \"subiu/desceu\" quebra ao\n cruzar o zero (de +1,0 Lula para 1,0 Flávio, \"desceu 2,0\" é conta certa e leitura errada) —\n direção por extenso e número sem sinal, como nas decisões 10 e 12; e o que a comparação\n pareada cancela é o efeito do jeito da casa, não a folga (ver §14.3.2).\n\n > Comparada com a pesquisa anterior do mesmo instituto ({{DATA_ANTERIOR}}), a diferença\n > andou {{DELTA_ABS}} pontos na direção de {{CANDIDATO_DELTA}}. Cada casa tem um jeito\n > próprio de medir. Comparar a casa com ela mesma tira boa parte desse jeito da conta — a\n > folga de cada medida continua valendo.\n\n- **`pesquisa.primeiraRodada`** — \"rodada\" e \"série\" banidas (§5.1).\n\n > É a primeira pesquisa deste instituto no painel — ainda não há com o que comparar.\n\n- **`pesquisa.naoEPrevisao`** — \"projeção\" sem chip é banida (§5.1); a substituta oficial já\n existe.\n\n > Uma pesquisa é um retrato do período em que ela foi a campo — não é previsão do\n > resultado. O número para o dia da votação, com a dúvida à vista, está no painel.\n\n- **`pesquisa.metaDescricao`** — reordenação: com valores reais a string passa de 200\n caracteres e buscadores truncam em ~160; \"não é previsão\" estava no fim. Ressalva que só\n existe na parte truncada não existe. Agora ela cabe nos primeiros ~120 caracteres.\n\n > Pesquisa {{INSTITUTO}} no 2º turno: Lula {{L2}}% × Flávio {{F2}}%, {{N}} pessoas\n > ouvidas, folga de {{MOE}} pontos — não é previsão. Registro no TSE ({{TSE}}), campo de\n > {{INICIO}} a {{FIM}}, contratante, fonte e o peso dela na média.\n\n- **`pesquisas.indice.intro`** — \"série\" banida (§5.1); título aprovado verbatim.\n\n > Cada pesquisa desta lista tem uma página com o registro no TSE, o contratante, o\n > período de campo e o link para a publicação original. A leitura de todas juntas está no\n > painel.\n\n- **`imprensa.intro`** — \"placar\" banida (§5.3, é o exemplo literal da tabela); \"MESMO\" em\n caixa alta banido (§5.3/P3); \"embedado\" → \"incorporado\" (§1.3 — esta troca é sugestão, as\n duas anteriores são vinculantes). Título aprovado verbatim.\n\n > O número do painel pode ser incorporado em qualquer página, de graça, com a atribuição\n > \"PONTEIRO · oponteiro.com.br\". Os dados são abertos (CC-BY-4.0): cite a fonte e o link.\n > O widget mostra o mesmo número do painel, atualizado junto com ele.\n\n### 14.3 Despachos sobre as três dúvidas levantadas\n\n**1. `pesquisa.vsMedia` e a margem ajustada: o texto fica, o mapeamento decide.\nAPROVADA verbatim.** A ficha é superfície oficial, sem réguas: `vies` = 0 por construção e\n`margem` ≡ `margemAj` — o texto nunca diverge de nenhum dos dois. Mas o mapeamento é\nvinculante: **`{{DIF_MEDIA}}` → `margem`** (a média ponderada das pesquisas), nunca\n`margemAj`. \"Na média do painel\" nomeando `margemAj` seria rótulo descrevendo outro evento —\na assinatura do §3.5 — no dia em que um padrão de viés não nulo existisse. Se algum dia a\nficha quiser o número ajustado, ele entra com outro nome (\"descontada a puxada suposta\"),\nnunca sob \"média\". Bônus da escolha: pesquisa e média ficam na MESMA base (diferença medida\nnas pesquisas), sem o cruzamento de bases que §4 corrigiu em `passo3`.\n\n**2. \"Cancela parte do jeito de cada casa medir\": não preciso o suficiente — duas\nimprecisões.** (a) O que a comparação pareada cancela é o **efeito** do jeito da casa sobre a\ncomparação, não o jeito; (b) o \"parte\" esconde onde mora a dúvida restante: o efeito estável\nda casa sai quase inteiro da conta, mas a folga amostral **não sai** — na diferença entre\nduas medidas ela até cresce. A redação do §14.2 diz as duas coisas: \"tira boa parte desse\njeito da conta — a folga de cada medida continua valendo\".\n\n**3. \"%\" em metadado: CONFIRMADO aceitável — mas pelo motivo certo.** Os percentuais da\n`metaDescricao` são **intenção de voto**, e §2.1 (linha 2) + decisão 2 permitem % de pesquisa\ncom o objeto medido na mesma frase (\"no 2º turno\") — valeria até em tela, não só em metadado.\nO que NÃO fica autorizado por tabela: **chance** como percentual solto em metadado. A atual\ndescription do site (\"84% de chance\") não tem salvo-conduto — a exceção do §5.1 cobre o\n`alternateName`, não o formato de chance. Recomendo migrar para a forma de frequência na\npróxima passada (nota, não veto deste lote).\n\n### 14.4 Placeholders novos e regras de renderização\n\n| Placeholder | Como se calcula | Regra |\n| ---------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------- |\n| `{{N_PESQUISAS}}` | total da série oficial (hoje 13) | mesmo número do índice e de \"ver as N pesquisas\" |\n| `{{DIF_PESQUISA}}` · `{{DIRECAO_PESQUISA}}` | `|l2 − f2|` da pesquisa, 1 casa · \"a favor de Lula/Flávio\" | valor absoluto com direção por extenso (dec. 12) |\n| `{{DIF_MEDIA}}` · `{{DIRECAO_MEDIA}}` | `|margem|`, 1 casa — **nunca `margemAj`** · idem | idem |\n| `{{DELTA_ABS}}` · `{{CANDIDATO_DELTA}}` | `|margem2_atual − margem2_anterior|` do mesmo instituto, mesmo turno, 1 casa · \"Lula\" se o delta anda para Lula, \"Flávio\" se anda para Flávio | idem |\n| `{{DATA_ANTERIOR}}` | `campo_fim` da pesquisa anterior, dd/mm (ano só se cruzar ano — §8) | |\n| `{{L2}}` · `{{F2}}` · `{{MOE}}` · `{{N}}` | números publicados pelo instituto, verbatim | **NUNCA `parEmCem`**: não somam 100 por construção — o que falta é branco, nulo e quem não sabe. Forçar soma 100 falsificaria dado publicado. `{{N}}` com ponto de milhar |\n\n### 14.5 Condições de implementação (1–5 são veto se descumpridas)\n\n1. **O gatilho de `vsMediaEmpate` é `empate2` do modelo** (`|margem2| ≤ 2 × moe`), nunca\n comparação com a folga simples — e o texto renderizado carrega o DOBRO (§3.1).\n2. **`{{DIF_MEDIA}}` → `margem`.** `margemAj` não entra na ficha sob o nome \"média\" (§14.3.1).\n3. **`pesquisa.naoEPrevisao` mora na mesma tela dos números da ficha** (H4) — em toda\n /pesquisas/[slug], sem colapso, sem sumir a 390px.\n4. **No widget, a chance sai em frequência** (\"NN em 100\"), com `parEmCem` e piso/teto de\n H13 — página de terceiro é superfície pública por excelência; e o rodapé\n \"PONTEIRO · oponteiro.com.br — não é previsão\" é **inseparável do número**: não removível,\n não ocultável, corpo nunca abaixo do mínimo, string idêntica à citada em `imprensa.intro`.\n Precedente: `marca.compartilhar.texto` (§4) — \"não é previsão\" é a ressalva do número que\n viaja sozinho.\n5. **\"O mesmo número do painel, atualizado junto\" tem de ser verdade mecânica**: widget e\n painel leem a mesma fonte de dados e publicam no mesmo passo. Se o widget tiver cache\n próprio com defasagem, a frase é falsa e volta a esta mesa.\n6. Bordas: `{{DELTA_ABS}}` = 0,0 → variante \"a diferença ficou onde estava\" (a forma\n \"na direção de\" quebra); `{{DIF_*}}` = 0,0 → idem; pesquisa sem registro TSE não ganha\n página (R3/H12 — só a série oficial aprovada).\n7. Primeira aparição de \"pontos\" em cada tela nova (ficha e índice) carrega a tradução\n \"cerca de N pessoas a mais em cada 100\" **uma vez** (§2.1) — condição de montagem da\n página, não de chave.\n\n### 14.6 Notas que não são veto\n\n- A ficha deve carregar, uma vez, a ponte \"folga da medida — a margem de erro\" (§11.B): o\n instituto publica \"margem de erro\", a ficha republica o número dele sob o nome canônico.\n- Os nomes de chave `primeiraRodada` e `papelNaSerie` contêm palavras banidas — chave não é\n superfície, sem veto; renomear é opcional.\n- \"Incorporado\" no lugar de \"embedado\" é §1.3, chamada do ux-writer; \"placar\" e a caixa alta\n não são.\n\n### Fecho do §14\n\nO lote nasceu bem: ordem fixa, \"pontos\", pares por `parEmCem` e piso/teto já vinham de\nfábrica, e o índice seco com procedência por linha é R4/H12 do jeito certo. O único veto é o\nvelho conhecido — o fator 2 do empate técnico, caindo pela terceira vez no mesmo lugar\n(§3.1, §11.B, aqui) — e as emendas são quase todas a lista §5 escapando (\"rodada\", \"série\",\n\"placar\", \"projeção\", caixa alta). Duas lições novas ficam registradas: ressalva de metadado\nconta caractere (truncou, sumiu — então ela vem primeiro), e \"média\" é nome reservado de\n`margem` — a ajustada, quando existir na ficha, entra com o nome do que ela é.\n\n— _data-scientist, 06/08/2026_

---

## 15. Adendo — \"Quando saem as próximas pesquisas?\" (ritmo por instituto e calendário oficial)\n\nOnze itens novos da home, auditados como TEMPLATE contra `docs/VOZ.md` (H1–H14, §1–§5) e\ncontra a conta que o bloco vai publicar: rodei a mediana dos intervalos de `campo_fim` por\ninstituto sobre `src/data/pesquisas.seed.json`, com hoje = **07/08/2026**. **Todo número\ncitado abaixo foi calculado, não estimado.**\n\n| instituto | pesquisas | fins (dd/mm) | intervalos (dias) | mediana cheia → prevista | intervalo na janela 120d → prevista |\n| ------------- | --------- | --------------------- | ----------------- | ------------------------ | ----------------------------------- |\n| AtlasIntel | 2 | 30/06 · 27/07 | [27] | 27 → 23/08 | [27] → 23/08 |\n| Datafolha | 3 | 05/03 · 18/06 · 24/07 | [105, 36] | **70,5 → 02/10** | [36] → 29/08 |\n| Genial/Quaest | 3 | 11/01 · 08/06 · 13/07 | [148, 35] | **91,5 → 13/10** | [35] → 17/08 |\n| PoderData | 2 | 24/06 · 28/07 | [34] | 34 → 31/08 | [34] → 31/08 |\n| Gerp · Indexa · Nexus | 1 cada | — | — | fora do bloco | fora do bloco |\n\n**Contagem: 1 vetada · 6 com emenda · 4 aprovadas** — mais **1 veto de cálculo** (o\nestimador como especificado) e 3 chaves novas obrigatórias.\n\n### 15.1 O veto de cálculo — a mediana da série inteira publica o absurdo na tela\n\nA especificação manda usar a mediana de **todos** os intervalos. Com a base de hoje, isso\nrenderiza: _\"Genial/Quaest — vem publicando a cada 92 dias · próxima por volta de **13/10**\"_\n— nove dias **depois do 1º turno** — e _\"Datafolha — a cada 70 dias · próxima por volta de\n02/10\"_. A causa é mudança de regime: os intervalos do começo do ano (105, 148 dias) e os da\ncampanha (34–36) são duas populações, e a mediana da mistura não descreve nenhuma. A última\nfrase do próprio `aviso` (\"perto da eleição, os institutos costumam publicar mais vezes\")\ndesmente as duas linhas na mesma dobra — a assinatura clássica: uma frase que a própria tela\ndesmente. E o verbo escolhido pela copy decide o estimador: \"**vem** publicando\" é presente\ncontínuo, então a conta tem de medir o comportamento recente.\n\n**Regra substituta (vinculante):** o ritmo é a **mediana dos intervalos entre `campo_fim`\nconsecutivos cujo início cai nos últimos 120 dias**; elegibilidade = **≥2 pesquisas com\n`campo_fim` na janela** (o \"≥2 na base\" da especificação cai). A janela de 120 dias é\nproposta desta mesa — qualquer valor entre 90 e 150 serve, desde que registrado em\n`DECISOES.md` e escrito em `/metodologia`. Com ela, hoje: AtlasIntel 27 → 23/08 · Datafolha\n36 → 29/08 · Genial/Quaest 35 → 17/08 · PoderData 34 → 31/08. Tudo mensal, tudo antes da\neleição, tudo coerente com o aviso. A mediana em si fica — é o estimador certo (robusta a um\nintervalo atípico); o que não fica é ela engolir janeiro.\n\n### 15.2 A vetada de texto — o 2º turno não é \"a data da manchete\"\n\n**`proximas.calendario.evento.t2` — VETADA** no aposto.\n\n> ✗ \"2º turno — é a data da manchete do painel\"\n\nA manchete é `eleito.dia` — **os dois caminhos juntos**, incluindo os 8 em 100 cenários em\nque a eleição acaba em 4 de outubro. O §2 desta auditoria existe inteiro para separar o 83\n(manchete) do 82 (decisão de 25/10); este aposto solda os dois de volta, no rodapé da mesma\npágina. O que é só de 25/10 é o **enxame**, e a página já diz isso com estas palavras\n(`hero.enxame.legenda`: \"mostram só a decisão de 25 de outubro\") — mesmo fato, mesmas\npalavras (§10.2). Redação substituta:\n\n> 2º turno — a decisão que as 100 bolinhas mostram\n\n_(Alternativa igualmente verdadeira, se o ux-writer quiser uma linha autônoma do hero:\n\"2º turno — as contas do painel vão até esta data\". Escolher uma; \"projeta\" não pode — §5.1.)_\n\n### 15.3 Emendas — texto final por chave\n\n- **`proximas.pergunta`** — **APROVADA** verbatim: \"Quando saem as próximas pesquisas?\"\n (5 palavras, pergunta — §1.6). Mas o bloco chegou sem a camada `resposta` do padrão §7\n (pergunta → resposta → traduzindo). **Chave nova obrigatória `proximas.resposta`:**\n\n > Instituto não marca data. Dá para ver o ritmo de cada casa e as datas fixas do\n > calendário da eleição.\n\n- **`proximas.traduzindo`** — a 2ª frase tinha 27 palavras com aparte embutido (§1.1) e a\n base da conta não era dita:\n\n > O ritmo é o intervalo típico entre uma pesquisa e a seguinte da mesma casa. Ele é\n > contado pelas datas de fim das entrevistas. A data estimada é isso: uma estimativa,\n > não uma promessa.\n\n- **`proximas.linhaRitmo`** — o texto fica, com condição de estado: \"**vem publicando a\n cada**\" afirma padrão e só renderiza com **≥2 intervalos na janela**. Com 1 intervalo\n (hoje: as quatro casas), entra a irmã nova — fato puro do passado, H8 do jeito certo:\n\n > `linhaRitmo` (≥2): última em {{ULTIMA}} · vem publicando a cada {{RITMO}} dias ·\n > próxima por volta de {{PREVISTA}}\n > `linhaRitmo.unico` (1): última em {{ULTIMA}} · a anterior saiu {{RITMO}} dias antes ·\n > próxima por volta de {{PREVISTA}}\n\n- **`proximas.linhaAtrasada`** — \"**vinha** publicando\" afirma quebra de ritmo, e passar da\n mediana é o desfecho esperado em **metade das esperas, por construção**: o imperfeito\n transforma o caso típico em anomalia. \"Pode sair a qualquer momento\" é exatamente a\n leitura certa depois da mediana — fica.\n\n > `linhaAtrasada` (≥2): última em {{ULTIMA}} · vem publicando a cada {{RITMO}} dias ·\n > pelo ritmo, uma nova pode sair a qualquer momento\n > `linhaAtrasada.unico` (1): última em {{ULTIMA}} · a anterior saiu {{RITMO}} dias antes ·\n > uma nova pode sair a qualquer momento\n\n- **`proximas.aviso`** — frase de 23 palavras (§1.1); \"as pesquisas saem mais rápido\" é\n futuro sem condição (H8) — vira habitual; \"a campanha esquenta\" sai (§1.7); e entra a\n frase da base campo → divulgação (§15.4.2):\n\n > A estimativa é só o ritmo passado de cada casa, e ritmo passado não marca data. As\n > datas são as do fim das entrevistas. A publicação costuma sair alguns dias depois. E o\n > passo não é fixo: perto da eleição, os institutos costumam publicar mais vezes.\n\n- **`proximas.calendario.titulo`** — \"que mexem com este painel\" é rótulo nomeando outro\n evento (§3.5): das quatro datas, só 04/10 e 25/10 entram nas contas (a deriva conta os\n dias até elas); registro e propaganda não mexem em nada mecanicamente.\n\n > Datas oficiais da eleição\n\n- **`proximas.calendario.evento`** — template e \"é hoje\" aprovados; falta a borda do\n singular: `{{DIAS}}` = 1 → \"falta 1 dia\" (\"faltam 1 dias\" é defeito de vitrine).\n\n- **Nomes dos eventos** — \"prazo final de registro das candidaturas no TSE\" (15/08 —\n Lei 9.504, art. 11), \"começa a propaganda eleitoral\" (16/08 — art. 36, após 15/08) e\n \"1º turno\" (04/10, ordinal conforme §8): **APROVADAS**. Datas conferidas contra a lei;\n 04/10 e 25/10/2026 são de fato o primeiro e o último domingo de outubro.\n\n### 15.4 Despachos sobre as três dúvidas levantadas\n\n**1. \"Mediana\" na tela: NÃO — e não é gosto.** §5.1 bane \"quantil, percentil, mediana\" na\nsuperfície pública, sem exceção nova. \"Ritmo\" é a tradução certa, com duas condições\nvinculantes: `/metodologia` ganha a entrada técnica (mediana dos intervalos entre\n`campo_fim` consecutivos, janela de 120 dias, arredondamento, gatilhos de estado) — a\ncamada técnica íntegra é a promessa de capa da VOZ; e a tradução nova entra em\n`DECISOES.md` com o limite escrito (VOZ §3): **\"ritmo\" não pode dizer** que existe\ncompromisso, agenda ou regularidade garantida.\n\n**2. Campo × divulgação: a frase é obrigatória.** Nos intervalos o atraso\ncampo → divulgação se cancela (atraso quase constante: cadência de fim de campo ≈ cadência\nde publicação); no nível, não: `PREVISTA` estima o fim do **campo** da próxima, e a\npublicação vem dias depois. Sem a frase, um bloco intitulado \"quando **saem**\" publica\nestimativa de fim de campo sob rótulo de publicação (§3.5) — e o estado \"atrasada\" dispara\nsistematicamente cedo. Uma frase no aviso resolve; já está na emenda.\n\n**3. \"Por volta de\" basta para H14 — janela explícita seria pior.** É a família de hedge\nque §5.2 já manda usar (\"perto de\", \"em torno de\"). \"Na semana de 24/08\" fabricaria uma\nprecisão de segunda ordem: afirmaria que a dispersão é de uma semana, o que não é derivável\ne varia por casa. O que fecha H14 são as regras de renderização do §15.5: ritmo inteiro,\ndata sem dia da semana, aviso na mesma dobra.\n\n### 15.5 Placeholders e regras de renderização\n\n| Placeholder | Como se calcula | Regra |\n| -------------- | ---------------------------------------------------------------------- | ------------------------------------------------------- |\n| `{{ULTIMA}}` | `campo_fim` da última pesquisa da casa, dd/mm | ano só se cruzar ano (§8) |\n| `{{RITMO}}` | mediana dos intervalos entre `campo_fim` consecutivos na janela de 120d | **inteiro, sempre** — \"70,5 dias\" é H14 |\n| `{{PREVISTA}}` | `ULTIMA + RITMO`, dd/mm | **nunca dia da semana**; some se cair depois de 25/10 |\n| `{{DIAS}}` | dias corridos até o evento, America/Sao_Paulo | 0 → \"é hoje\" · 1 → \"falta 1 dia\" |\n| `{{EVENTO}}` · `{{DATA}}` | constantes da Lei 9.504 (art. 11 · art. 36 · art. 1º) | dd/mm; cada linha some sozinha quando a data passa |\n\n### 15.6 Condições de implementação (1–5 são veto se descumpridas)\n\n1. **Janela de recência no estimador** (§15.1): só intervalos iniciados nos últimos 120\n dias; elegibilidade ≥2 pesquisas com `campo_fim` na janela. Sem isso, a tela de hoje\n publica \"a cada 92 dias · próxima por volta de 13/10\" — depois do 1º turno.\n2. **Gatilho de estado:** `linhaAtrasada` entra quando `hoje > PREVISTA`; o texto nunca\n insinua quebra de ritmo (\"vinha\") — passar da mediana é o esperado em metade dos casos.\n3. **Variante `.unico` obrigatória** com 1 intervalo na janela: \"vem publicando a cada\" só\n com ≥2.\n4. **`{{RITMO}}` inteiro e `{{PREVISTA}}` sem dia da semana** (H14); se `PREVISTA > 25/10`,\n a estimativa não é publicada — a linha mostra só a última e o intervalo.\n5. **Contagem de dias em America/Sao_Paulo** (date-fns-tz, convenção do projeto): virada de\n dia em UTC não pode adiantar \"é hoje\" nem o desaparecimento das linhas.\n6. `/metodologia` ganha a entrada técnica e `DECISOES.md` registra a janela e a tradução\n \"ritmo\" com o limite escrito (§15.4.1).\n\n### 15.7 Notas que não são veto\n\n- **Casas com 1 pesquisa** (hoje: Gerp, Indexa, Nexus) somem do bloco sem explicação, mas\n aparecem na tabela da mesma página. Chave opcional recomendada `proximas.semRitmo`:\n \"Institutos com uma pesquisa só no painel ainda não mostram ritmo.\"\n- **Terceiro estado recomendado:** passados `2 × RITMO` da última sem pesquisa nova, \"pode\n sair a qualquer momento\" envelhece mal — trocar por \"sem pesquisa nova há {{DIAS_SEM}}\n dias — o ritmo antigo já não diz muito\". A elegibilidade pela janela já aposenta a linha\n sozinha; este estado só encurta a agonia.\n- **Ordem das linhas fixa e neutra** (`PREVISTA` crescente, desempate alfabético) — ordem\n que muda por critério editorial é o primo do §2.4 (R4, entre institutos).\n- **Intervalo zero é inalcançável** pela dedup `(instituto, campo_fim)` do\n `src/lib/updater.ts` — registrado para ninguém tratar a borda que não existe.\n- \"Intervalo\" aqui é o de calendário, não o banido \"intervalo de confiança\" (§5.1) — sem\n colisão.\n\n### Fecho do §15\n\nO bloco nasceu com os instintos certos — mediana em vez de média, \"estimativa, não\npromessa\", estado que muda quando a data passa, datas oficiais que somem sozinhas — e os\ndois defeitos graves eram invisíveis sem rodar a conta: a mediana da série inteira mistura\no regime de janeiro com o da campanha e publica uma \"próxima\" depois do 1º turno; e o\n\"vinha publicando\" pune a casa por um atraso que a própria mediana produz metade das vezes.\nA lição que fica: **estimador novo se audita como frase — renderizado com os dados de hoje,\nna tela, antes de ganhar chave.**\n\n— _data-scientist, 07/08/2026_

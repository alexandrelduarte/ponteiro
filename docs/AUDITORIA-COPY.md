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

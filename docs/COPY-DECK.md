# COPY DECK — o texto da superfície pública v2

**Fase 5 do redesign.** Este é o texto **pronto para colar** na Fase 6. As regras que geraram cada
frase estão em `docs/VOZ.md`; a estrutura visual em `docs/DESIGN-V2.md`; a paridade obrigatória em
`docs/INVENTARIO.md` (a cobertura item a item está no §W, no fim).

**O que este documento NÃO faz:** não altera nenhum número, não altera o modelo, e não substitui a
camada técnica — ela permanece íntegra em `/metodologia` (§U).

---

## Como usar

- **Chave estável** em negrito e monoespaçada: `hero.manchete`. A Fase 6 pode virar isto num módulo
  `src/components/ui/textos.ts` (ou vários, por seção) sem renomear nada.
- **Texto** em citação, logo abaixo da chave.
- **Placeholder** entre chaves duplas: `{{ELEITO_LULA}}`. Toda substituição vem do modelo — a
  tabela §A mapeia cada placeholder ao campo de origem, para o data-scientist auditar.
- **Exemplo:** quando ajuda, vem uma linha _"Hoje:"_ com os números publicados em `DESIGN-V2.md`
  (03/08/2026). São ilustração; o produto renderiza o valor real.
- **Nota:** restrições de honestidade ou de montagem, quando existirem.

Padrão de bloco (VOZ §7): **`titulo`** (pergunta) → **`resposta`** (frase que conclui, com o
número) → **`traduzindo`** (2–3 frases) → conteúdo.

---

## A. Placeholders e sua origem no modelo

| Placeholder                                                                  | Vem de (`rodarModelo` / dados)                        | Formato               |
| ---------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------- |
| `{{N_PESQUISAS}}`                                                            | `pesquisas.length`                                    | inteiro               |
| `{{DIAS_1T}}` · `{{DIAS_2T}}`                                                | `dias1T` · `dias2T`                                   | inteiro               |
| `{{ELEITO_LULA}}` · `{{ELEITO_FLAVIO}}`                                      | `eleito.dia.l` · `eleito.dia.f` (×100, inteiro)       | soma 100 (VOZ §2.3)   |
| `{{ELEITO_LULA_PCT}}`                                                        | idem, com `%`                                         | rótulo, nunca sozinho |
| `{{ELEITO_HOJE_LULA}}` · `{{ELEITO_HOJE_FLAVIO}}`                            | `eleito.hoje.l` · `eleito.hoje.f` (×100)              | soma 100              |
| `{{T2_LULA}}` · `{{T2_FLAVIO}}`                                              | `pL2dia` · `1 − pL2dia` (×100) — é o **enxame**       | soma 100              |
| `{{T2_HOJE_LULA}}`                                                           | `pL2hoje` (×100)                                      | inteiro               |
| `{{LIDER}}` · `{{SEGUNDO}}`                                                  | nome conforme `eleito.dia.l ≥ 0,5`                    | só onde a frase exige |
| `{{MEDIA_L2}}` · `{{MEDIA_F2}}`                                              | `mediaL2` · `mediaF2`                                 | 1 casa                |
| `{{MARGEM}}` · `{{MARGEM_AJ}}`                                               | `margem` · `margemAj`                                 | 1 casa, com sinal     |
| `{{VALIDO_L2}}` · `{{VALIDO_F2}}`                                            | `validoL2` · `100 − validoL2`                         | 1 casa                |
| `{{SIGMA_HOJE}}` · `{{SIGMA_DIA}}`                                           | `sigmaHoje` · `sigmaDia2`                             | 1 casa                |
| `{{SD_ENTRE}}`                                                               | `sdEntre`                                             | 1 casa                |
| `{{INT80_MIN}}` · `{{INT80_MAX}}`                                            | `int80[0]` · `int80[1]`                               | 1 casa, com sinal     |
| `{{P_2T}}`                                                                   | `p2Tacontece` (×100)                                  | inteiro               |
| `{{P_1T_DEF}}`                                                               | `p1.lulaDia + p1.flavioDia` (×100)                    | inteiro               |
| `{{T1_L}}` · `{{T1_F}}`                                                      | `t1raw.valor` · `t1rawF.valor`                        | 1 casa                |
| `{{T1_VAL_L}}`                                                               | `t1valL.valor`                                        | 1 casa                |
| `{{P1_L_HOJE}}` · `{{P1_L_DIA}}` · `{{P1_F_DIA}}`                            | `p1.lulaHoje` · `p1.lulaDia` · `p1.flavioDia` (×100)  | inteiro               |
| `{{QTD_EMPATE}}` · `{{QTD_RECENTES}}`                                        | `qtdEmpate` · `qtdRecentes`                           | inteiro               |
| `{{TEND_*}}`                                                                 | `tend1` / `tend2` (`delta`, `pares`)                  | 1 casa, com sinal     |
| `{{PLACAR_L}}` · `{{PLACAR_F}}`                                              | `cenBase.placarL` · `100 − placarL`                   | 1 casa                |
| `{{BANDA_MODAL}}` · `{{P_BANDA}}`                                            | `cenBase.modal.rot` · `modal.p` (×100)                | texto + inteiro       |
| `{{P_ELEI}}` · `{{P_CONTRA}}` · `{{UMA_EM}}`                                 | `cenBase.pElei` · `1 − pElei` · `round(1/(1−pElei))`  | inteiro               |
| `{{VIES}}` · `{{MEIA_VIDA}}` · `{{SIGMA_SYS}}` · `{{DERIVA_PT}}`             | `params.*` (deriva já convertida em pontos até 25/10) | 1 casa                |
| `{{SIM_LULA}}`                                                               | `eleito.dia.l` do estado de simulação (×100)          | inteiro               |
| `{{HORA_VERIF}}` · `{{DDMM_ULTIMA}}` · `{{DATA_BASE}}`                       | selo de frescor (`montarSelo`)                        | texto                 |
| `{{INSTITUTO}}` · `{{CAMPO}}` · `{{N}}` · `{{MOE}}` · `{{TSE}}` · `{{PESO}}` | linha da série                                        | texto/número          |
| `{{REPLAY_*}}`                                                               | `replay.*` (`calcReplay`)                             | tabela completa no §L |

### A.2 Placeholders derivados (calculados na apresentação, não no modelo)

| Placeholder                                            | Como se calcula                                                                                                       |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `{{ELEITO_FLAVIO_PCT}}`                                | `eleito.dia.f` com `%` — rótulo, nunca sozinho                                                                        |
| `{{MARGEM_ABS}}` · `{{MARGEM_AJ_ABS}}`                 | `                                                                                                                     | margem   | `·`                                               | margemAj | `, sem sinal (a frase já diz quem está na frente) |
| `{{MARGEM_PESSOAS}}`                                   | `round(                                                                                                               | margem   | )` — vira "pessoas a mais em cada 100" (VOZ §2.1) |
| `{{DIRECAO}}`                                          | `vies > 0 → "a favor de Lula"` · `vies < 0 → "a favor de Flávio"`                                                     |
| `{{N_INSTITUTOS}}`                                     | institutos distintos na série                                                                                         |
| `{{N_CANDIDATOS}}`                                     | `campoCompleto.linhas.length`                                                                                         |
| `{{GAP3}}` · `{{BN}}`                                  | `campoCompleto.gap3` · `campoCompleto.bn`                                                                             |
| `{{TOP2}}`                                             | `campoCompleto.top2.join(" × ")`                                                                                      |
| `{{T1_DIF}}`                                           | `t1valL.valor − t1valF.valor`, com sinal                                                                              |
| `{{P_L}}` · `{{P_F}}`                                  | `round(calcVies(v).elD × 100)` e `100 − P_L` (cartões de cenário)                                                     |
| `{{P_LULA_1}}` · `{{P_V2}}`                            | `cenBase.pLulaEm1` · `cenBase.pV2` (×100)                                                                             |
| `{{LIDER_1T}}`                                         | `cenBase.pLulaEm1 ≥ 0,5 ? "Lula" : "Flávio"`                                                                          |
| `{{APERTADA_OU_MEDIA}}`                                | `                                                                                                                     | margemAj | < 5 ? "apertada" : "média"`                       |
| `{{SIM_FLAVIO}}`                                       | `100 − SIM_LULA`                                                                                                      |
| `{{QUANDO}}` · `{{N_DIAS}}`                            | selo de frescor: `"hoje" / "ontem" / "em dd/mm"` · dias desde a verificação                                           |
| `{{HORA}}`                                             | hora da última resposta que chegou (estado de falha de rede)                                                          |
| `{{L}}` · `{{F}}` · `{{DDMM}}`                         | valores e data do ponto no tooltip do gráfico                                                                         |
| `{{TERMO}}`                                            | nome do termo no rótulo acessível do chip de glossário                                                                |
| `{{ANTES}}` · `{{DEPOIS}}` · `{{PARA_ONDE}}`           | chance antes/depois da inclusão (×100) e o lado para onde puxou (`/historico`, H10)                                   |
| `{{CAMPO_FALTANDO}}` (`{{CAMPO}}`)                     | nome do campo obrigatório não preenchido no formulário de simulação                                                   |
| `{{FECHO}}`                                            | slot da variante de fecho de `hero.enxame.legenda`: `fecho.lula` se `p1.lulaDia ≥ p1.flavioDia`, senão `fecho.flavio` |
| `{{VIES_ABS}}`                                         | `\|params.vies\|`, 1 casa — em toda frase que já diz a direção por extenso                                            |
| `{{P_V2_ABS}}`                                         | `round(p2Tacontece × cenBase.pV2 × 100)` = 75 — o caminho "vence na decisão" em base absoluta                         |
| `{{P_1T_DIRETO}}`                                      | `round(cenBase.pDireto × 100)` = 8                                                                                    |
| `{{REPLAY_V2_ABS}}`                                    | `round(p2Trep × pV2rep × 100)` = 68                                                                                   |
| `{{MARGEM_INICIO}}`                                    | `serie2[0].l − serie2[0].f`, 1 casa = 7,0                                                                             |
| `{{QTD_NAO_EMPATE}}`                                   | `qtdRecentes − qtdEmpate` = 4                                                                                         |
| `{{INSTITUTO_INVERTIDO}}` · `{{MARGEM_INVERTIDA_ABS}}` | instituto recente com `margem2 < 0` e `\|margem2\|` (hoje: Gerp · 1,0)                                                |
| `{{FALTA_50}}`                                         | `50 − t1valL.valor`, 1 casa = 4,0                                                                                     |
| `{{BN_T2}}`                                            | `100 − mediaL2 − mediaF2`, 1 casa = 10,8 (despacho AUDITORIA §9.4)                                                    |

### A.3 Regras de renderização (AUDITORIA §5c) — obrigatórias antes de implementar

**1. Piso e teto (H13 / `pctComPiso`).** Todo percentual de **chance** passa por `pctComPiso`, que
publica **"menos de 1 em 100"** e **"mais de 99 em 100"** nos extremos. Nunca "0 em 100" nem
"100 em 100" — improbabilidade não é impossibilidade, e a regra vale para os dois lados (R4).
Alcança: `{{P1_F_DIA}}` (que **hoje** já arredondaria para 0), `{{P1_L_DIA}}`, `{{P1_L_HOJE}}`,
`{{P_1T_DEF}}`, `{{P_BANDA}}`, `{{P_L}}`, `{{P_F}}`, `{{SIM_LULA}}` e **todo `{{REPLAY_*}}`
percentual** — hoje `{{REPLAY_P1_DIRETO}}` = 0,85 → "1" e `{{REPLAY_P2T}}` = 99,1 → "99", ambos a
um dado novo de estourar o limite.

**2. Complemento, nunca arredondamento duplo (H3 / VOZ §2.3).** Em todo par que deve somar 100,
arredonda-se **um** número e o outro é `100 − ele`. Alcança: `{{ELEITO_LULA}}`/`{{ELEITO_FLAVIO}}`,
`{{T2_LULA}}`/`{{T2_FLAVIO}}`, `{{ELEITO_HOJE_*}}`, `{{P_2T}}`/`{{P_1T_DEF}}`,
`{{VALIDO_L2}}`/`{{VALIDO_F2}}`, `{{P_L}}`/`{{P_F}}`, `{{SIM_LULA}}`/`{{SIM_FLAVIO}}`,
`{{PLACAR_L}}`/`{{PLACAR_F}}`, `{{REPLAY_EL_DIA}}`/`{{REPLAY_EL_DIA_F}}` e
`{{REPLAY_R2L_INT}}`/`{{REPLAY_R2F_INT}}`.

**Constantes de texto** (não são placeholders — são fatos fixos citados por extenso): erro de 2022
no 1º turno **6,3 pontos**; no 2º turno **3,1 pontos**; resultado real de 2022 **50,9 × 49,1**;
1º turno **04/10/2026**; 2º turno **25/10/2026**.

---

## B. Marca e cabeçalho

**`marca.wordmark`**

> PONTEIRO

**`marca.tagline`**

> Para onde apontam as pesquisas.

**`marca.taglineLonga`**

> Quem está na frente — e o quanto ainda pode mudar.

**`marca.tituloPagina`**

> Presidente 2026 · Lula (PT) × Flávio Bolsonaro (PL)

**`marca.descricao`** _(SEO / `alternateName` no JSON-LD — o nome antigo sobrevive aqui como
descrição, conforme `MARCA.md` §5.1. **Única ocorrência autorizada da palavra "agregador"**: ela é
banida em texto lido pelo público — VOZ §5.1 — e sobrevive só como termo de busca no metadado.)_

> Agregador de pesquisas presidenciais 2026

**`marca.metaDescricao`**

> Em 100 eleições parecidas com esta, Lula é eleito em {{ELEITO_LULA}} e Flávio em
> {{ELEITO_FLAVIO}}. Leitura das {{N_PESQUISAS}} pesquisas registradas no TSE — não é previsão.

**`marca.compartilhar.titulo`**

> PONTEIRO — Presidente 2026

**`marca.compartilhar.texto`**

> Em 100 eleições parecidas com esta, Lula é eleito em {{ELEITO_LULA}} e Flávio em
> {{ELEITO_FLAVIO}}. **Não é previsão** — veja de onde vem esse número.

**`marca.compartilhar.textoSimulacao`** _(quando o link leva réguas mexidas — H7)_

> Minha simulação no PONTEIRO: com as réguas que eu mexi, Lula é eleito em {{SIM_LULA}} de cada
> 100 cenários. Não é o número oficial do painel.

---

## C. Hero — a chance de ser eleito

**`hero.linhaTempo`**

> 2º turno · 25 de outubro · faltam {{DIAS_2T}} dias

**`hero.linhaTempo.primeiro`**

> 1º turno · 4 de outubro · faltam {{DIAS_1T}} dias

**`hero.manchete`** _(template — DESIGN-V2 §2.1)_

> Em 100 eleições parecidas com esta, Lula é eleito em **{{ELEITO_LULA}}** e Flávio em
> **{{ELEITO_FLAVIO}}**.
>
> _Hoje:_ Em 100 eleições parecidas com esta, Lula é eleito em **83** e Flávio em **17**.

_Nota:_ ordem fixa (Lula, Flávio), nunca "o líder primeiro" — VOZ §2.4. Os dois números somam 100.
"É eleito", nunca "vai ser eleito" (H1).

**`hero.manchete.rodape`** _(o percentual como rótulo do campo, nunca sozinho)_

> o mesmo que dizer {{ELEITO_LULA_PCT}} de chance para Lula e {{ELEITO_FLAVIO_PCT}} para Flávio

**`hero.enxame.legenda`** _(micro-legenda de reconciliação — mesma tela, nunca atrás de clique)_

> Cada bolinha é um resultado possível, e todas valem o mesmo. Aqui elas mostram **só a decisão de
> 25 de outubro**: {{T2_LULA}} caem do lado de Lula e {{T2_FLAVIO}} do lado de Flávio. A frase de
> cima conta outra coisa: quem termina eleito pelos dois caminhos juntos. Em {{P_1T_DEF}} de cada
> 100 cenários a eleição acaba já em 4 de outubro — nesses não existe 2º turno para a bolinha cair
> de um lado, e eles entram na frase de cima a favor de quem venceu no 1º turno. {{FECHO}}

`{{FECHO}}` é uma das duas variantes abaixo, escolhida pelo dado (`p1.lulaDia ≥ p1.flavioDia`).

**`hero.enxame.legenda.fecho.lula`**

> Hoje quase todos esses cenários terminam com Lula eleito — por isso na frase de cima ele fica com
> {{ELEITO_LULA}}, um pouco acima das {{T2_LULA}} bolinhas, e Flávio com {{ELEITO_FLAVIO}}, um
> pouco abaixo das {{T2_FLAVIO}} dele.

**`hero.enxame.legenda.fecho.flavio`**

> Hoje quase todos esses cenários terminam com Flávio eleito — por isso na frase de cima ele fica
> com {{ELEITO_FLAVIO}}, um pouco acima das {{T2_FLAVIO}} bolinhas, e Lula com {{ELEITO_LULA}}, um
> pouco abaixo das {{T2_LULA}} dele.

> _Hoje:_ "… Em 8 de cada 100 cenários a eleição acaba já em 4 de outubro … Hoje quase todos esses
> cenários terminam com Lula eleito — por isso na frase de cima ele fica com 83, um pouco acima das
> 82 bolinhas, e Flávio com 17, um pouco abaixo das 18 dele."

_Nota de montagem (AUDITORIA §2):_ 78 palavras — mais longa que o teto de `traduzindo` (VOZ §7), e
deve ser: `legenda` não é `traduzindo`, e DESIGN-V2 §2.1 proíbe encurtá-la até perder a explicação.
Se a Fase 6 precisar de versão curta a 390px, ela **corta a primeira frase** ("Cada bolinha…", que
se repete em `comoLer.passo2`), **nunca o fecho**. A explicação anterior ("são 83 porque soma a
chance de acabar no 1º turno") foi **vetada**: a diferença não é uma soma simétrica — contar o 1º
turno _subtrai_ de Flávio (18 bolinhas → 17 na manchete).

_Nota:_ esta é a frase que resolve os dois números-manchete concorrentes (DESIGN-V2 §2.1). Ela é
obrigatória e não pode ser encurtada até perder a explicação do 1 ponto de diferença.

**`hero.enxame.pontaEsquerda`**

> ← Flávio na frente

**`hero.enxame.pontaDireita`**

> Lula na frente →

**`hero.enxame.empate`**

> empate

**`hero.enxame.aria`**

> Cem bolinhas, uma por cenário da decisão de 25 de outubro: {{T2_LULA}} caem do lado de Lula e
> {{T2_FLAVIO}} do lado de Flávio.

**`hero.naoEPrevisao`** _(nunca some a 390px — H4)_

> Isto não é previsão. É o que as {{N_PESQUISAS}} pesquisas registradas no TSE dizem hoje, mais o
> tanto que a corrida ainda pode andar até outubro.

**`hero.procedencia`**

> {{N_PESQUISAS}} pesquisas de {{N_INSTITUTOS}} institutos, todas com registro no TSE. Cada uma
> tem link para a publicação original.

**`hero.hoje`** _(segunda linha — o retrato de hoje)_

> Se a votação fosse hoje: Lula seria eleito em {{ELEITO_HOJE_LULA}} de cada 100 cenários; Flávio,
> em {{ELEITO_HOJE_FLAVIO}}.

**`hero.hoje.porQueDifere`**

> A diferença entre as duas linhas é o tempo. O número de outubro soma o quanto a corrida ainda
> pode andar — propaganda na TV, debates, fato novo. Por isso o número de outubro carrega mais
> dúvida que o de hoje.

**`hero.traduzindo`**

> Chance não é resultado. O painel monta 100 cenários compatíveis com as pesquisas de hoje **e com
> o quanto a corrida ainda pode andar até outubro**, e conta em quantos deles cada um termina
> eleito. Um resultado que aparece em 17 de 100 cenários é pouco provável — não é impossível.

**`hero.avisoVies`** _(só quando a régua da puxada está fora do zero)_

> ⚠ Simulação: você está supondo que as pesquisas estão puxando {{VIES_ABS}} pontos {{DIRECAO}}. A
> diferença medida ({{MARGEM}}) vira {{MARGEM_AJ}} pontos nesta conta.

**`hero.avisoVies.direcao.lula`** → `a favor de Lula`
**`hero.avisoVies.direcao.flavio`** → `a favor de Flávio`

### Veredito — as quatro faixas do modelo

_Nota:_ a faixa vem de `pLider` (`eleito.dia`), exatamente como no protótipo. A cláusula de
ressalva é obrigatória e definida pela faixa (H2). Sem caixa alta (VOZ §5.3).

**`hero.veredito.empate.titulo`** _(< 60 em 100)_

> Está em aberto — dá para os dois lados

**`hero.veredito.empate.texto`**

> A diferença de {{MARGEM_AJ_ABS}} pontos na decisão é pequena diante da dúvida, que é de cerca de
> {{SIGMA_DIA}} pontos para cada lado. Pelos números de hoje, qualquer um dos dois pode ser eleito.

**`hero.veredito.leve.titulo`** _(60–75)_

> {{LIDER}} está na frente por pouco — e isso ainda pode mudar

**`hero.veredito.leve.texto`**

> A vantagem existe, mas cabe dentro do erro que as pesquisas já cometeram antes, somado aos
> {{DIAS_2T}} dias que ainda faltam. Virada segue possível.

**`hero.veredito.favorito.titulo`** _(75–90)_

> {{LIDER}} está na frente — provável, mas **ainda pode mudar**

**`hero.veredito.favorito.texto`**

> A vantagem de {{MARGEM_AJ_ABS}} pontos na decisão é grande diante da dúvida de hoje, que é de
> cerca de {{SIGMA_HOJE}} pontos para cada lado. Mesmo assim, um erro das pesquisas do tamanho do
> de 2022, ou a campanha na TV, ainda permitiriam a virada.

**`hero.veredito.amplo.titulo`** _(90+)_

> {{LIDER}} está bem na frente — mas não é garantia

**`hero.veredito.amplo.texto`**

> A vantagem aparece na maioria das pesquisas e resiste ao erro que elas já cometeram antes. Para
> virar, seria preciso um erro de pesquisa maior que os já vistos e uma mudança de opinião fora do
> padrão. Improvável não é impossível.

**`hero.veredito.sufixoVies`**

> Nesta conta você supôs uma puxada de {{VIES_ABS}} pontos {{DIRECAO}}: a diferença medida
> ({{MARGEM}}) virou {{MARGEM_AJ}}.

**`hero.caminho`**

> Como a eleição se decide: {{P_2T}} de cada 100 cenários terminam com decisão no 2º turno, em 25
> de outubro. Em {{P_1T_DEF}} de cada 100, a eleição acaba já no 1º turno.

_Nota (AUDITORIA §4):_ o prefixo "Caminho mais provável" só valeria com `{{P_2T}} > 50`; "Como a
eleição se decide" vale nos dois estados. Regra de renderização: arredondar `{{P_2T}}` e fazer
`{{P_1T_DEF}} = 100 − {{P_2T}}` (H3 / VOZ §2.3) — `p2Tacontece = 1 − p1L − p1F` exatamente, e
arredondar os dois em separado pode publicar 101.

---

## D. Faixa "Como ler esta página" (colapsável)

**`comoLer.titulo`**

> Como ler esta página

**`comoLer.chamada`**

> 3 passos · 20 segundos

**`comoLer.abrir`** → `Abrir` · **`comoLer.fechar`** → `Fechar`

**`comoLer.passo1`**

> **1. O número grande é uma chance, não um resultado.** Ele diz em quantas eleições parecidas com
> esta cada um termina eleito.

**`comoLer.passo2`**

> **2. As 100 bolinhas são 100 resultados possíveis.** Conte de que lado da régua elas caem. A
> régua do meio é o empate.

**`comoLer.passo3`**

> **3. Palavra difícil é para tocar.** Onde tiver um chip como <span>margem de erro</span>, toque:
> a explicação abre aqui mesmo.

**`comoLer.rodape`**

> **Ninguém aqui torce.** Os números saem de pesquisas registradas no TSE, com link para a fonte.
> O painel também faz quatro suposições para calcular a chance — elas ficam à vista, e você pode
> mexer em todas.

---

## E. "Quem está na frente?" — os cartões de 1º e 2º turno

**`secao.frente.titulo`**

> Quem está na frente?

**`secao.frente.resposta`**

> **Na média das pesquisas** do 2º turno, Lula tem {{MEDIA_L2}}% e Flávio {{MEDIA_F2}}% —
> diferença de {{MARGEM_ABS}} pontos, cerca de {{MARGEM_PESSOAS}} pessoas a mais em cada 100.

**`secao.frente.traduzindo`**

> Estes são os números das pesquisas, sem projeção: a média que o painel faz do que os institutos
> mediram até agora. A eleição tem dois dias: 4 de outubro e, se ninguém passar de metade dos votos
> válidos, 25 de outubro.

### 2º turno

**`secao.frente.t2.titulo`**

> 2º turno · 25 de outubro · é aqui que se decide

**`secao.frente.t2.numeros`**

> Lula {{MEDIA_L2}}% × Flávio {{MEDIA_F2}}%

**`secao.frente.t2.margem`**

> diferença de {{MARGEM_ABS}} pontos

**`secao.frente.t2.validos`**

> Em votos válidos — o bolo depois de tirar os {{BN_T2}}% de branco, nulo e quem não sabe, que é
> o que falta para 100 nos números acima — fica {{VALIDO_L2}}% × {{VALIDO_F2}}%.

_Despacho (AUDITORIA §9.4):_ placeholder novo `{{BN_T2}}` = `100 − mediaL2 − mediaF2`, 1 casa
(hoje 10,8) — décimo da lista do §5 da auditoria.

**`secao.frente.t2.empates`**

> {{QTD_EMPATE}} das {{QTD_RECENTES}} pesquisas dos últimos 35 dias estão em empate técnico:
> nelas, a diferença é menor que **o dobro** da folga da medida — é essa a folga que vale quando se
> comparam os dois números. Em {{INSTITUTO_INVERTIDO}}, quem aparece à frente é Flávio, por
> {{MARGEM_INVERTIDA_ABS}} ponto, ainda dentro dessa folga.

**`secao.frente.t2.dispersao`**

> Os institutos discordam entre si em cerca de {{SD_ENTRE}} pontos **na diferença entre os dois**.

**`secao.frente.t2.hoje`**

> Se a decisão fosse hoje, Lula ganharia em {{T2_HOJE_LULA}} de cada 100 cenários.

**`secao.frente.t2.dia`**

> No dia 25 de outubro, em {{T2_LULA}} de cada 100.

**`secao.frente.t2.faixa80`**

> Em 8 de cada 10 cenários, a diferença **medida nas pesquisas** fica entre {{INT80_MIN}} e
> {{INT80_MAX}} pontos.

**`secao.frente.t2.faixa80.incluiFlavio`** _(variante condicional — renderiza só se `int80[0] < 0`)_

> A ponta de baixo dessa faixa é uma vitória apertada de Flávio.

### 1º turno

**`secao.frente.t1.titulo`**

> 1º turno · 4 de outubro

**`secao.frente.t1.numeros`**

> Lula {{T1_L}}% × Flávio {{T1_F}}%

**`secao.frente.t1.comoFoiPerguntado`**

> É a média das pesquisas em que o entrevistador mostra a lista de nomes.

**`secao.frente.t1.validos`**

> Em votos válidos, Lula tem cerca de {{T1_VAL_L}}% — **faltam {{FALTA_50}} pontos** para a metade
> que evitaria o 2º turno.

**`secao.frente.t1.defHoje`**

> Lula ganhar já no 1º turno, se fosse hoje: {{P1_L_HOJE}} em 100

**`secao.frente.t1.defDia`**

> Lula ganhar já no 1º turno, em 4 de outubro: {{P1_L_DIA}} em 100

**`secao.frente.t1.flavio`**

> Flávio ganhar já no 1º turno acontece em **{{P1_F_DIA}}** de cada 100 cenários — precisaria de
> mais da metade dos votos válidos.

_Despacho (AUDITORIA §9.1):_ `{{P1_F_DIA}}` renderiza via `pctComPiso` — neste encaixe o piso
produz "menos de 1" e o teto espelhado "mais de 99" vale para o mesmo campo.

_Nota (AUDITORIA §3.5):_ `p1.flavioDia` = 0,0004% e `Math.round(×100)` = **0** — publicar "0 de
cada 100" viola H13 e é assimétrico com Lula. A redação aprovada é a acima. Implementação: renderiza
`{{P1_F_DIA}}` **por `pctComPiso`**, que hoje produz exatamente "menos de 1" e mantém a frase
verdadeira se o valor crescer.

### Tendência

**`secao.frente.tendencia.titulo`**

> Subiu ou desceu desde a pesquisa anterior?

**`secao.frente.tendencia.sobe`** → `subiu {{TEND_DELTA}} ponto(s)`
**`secao.frente.tendencia.desce`** → `caiu {{TEND_DELTA}} ponto(s)`
**`secao.frente.tendencia.estavel`** → `praticamente igual ({{TEND_DELTA}})`
**`secao.frente.tendencia.semBase`** → `ainda não dá para comparar`
**`secao.frente.tendencia.pares`** → `comparando {{TEND_PARES}} instituto(s) com eles mesmos`

**`secao.frente.tendencia.oQueE`**

> Para não confundir método com movimento, o painel compara cada instituto com ele mesmo: a
> pesquisa nova contra a anterior da mesma casa. Subir agora não quer dizer que vai continuar
> subindo.

---

## F. "Isso ainda pode virar?" — o espaço de virada

**`secao.virar.titulo`**

> Isso ainda pode virar?

**`secao.virar.resposta`**

> Pode. Em {{T2_FLAVIO}} de cada 100 cenários para 25 de outubro, é Flávio quem ganha a decisão — e
> em {{ELEITO_FLAVIO}} de cada 100 ele termina eleito, contando os dois caminhos.

**`secao.virar.traduzindo`**

> Cada bolinha é um resultado possível para a diferença no dia da votação, e todas valem o mesmo.
> As que caem à direita da régua são cenários em que Lula ganha; à esquerda, cenários em que
> Flávio ganha. Quanto mais espalhadas, menos fechada está a disputa.

**`secao.virar.legenda`**

> A régua do meio é o empate: ali os dois teriam o mesmo tanto de voto.

**`secao.virar.espacoVirada`**

> Tudo o que está do lado esquerdo da régua é o espaço de virada que os dados de hoje ainda
> comportam.

**`secao.virar.faixa80`**

> Em 8 de cada 10 cenários, a diferença **medida nas pesquisas** fica entre {{INT80_MIN}} e
> {{INT80_MAX}} pontos.

**`secao.virar.aria`**

> Gráfico dos cenários da diferença no dia da votação: {{T2_LULA}} em 100 do lado de Lula,
> {{T2_FLAVIO}} em 100 do lado de Flávio.

**`secao.virar.oQueDerruba`**

> Três coisas mudariam este quadro. Pesquisas novas trazendo a diferença para baixo de 2 pontos.
> Três institutos seguidos com Flávio na frente, fora da folga. Ou uma puxada das pesquisas a favor
> de Lula maior que {{MARGEM_ABS}} pontos — menos que os 6,3 do 1º turno de 2022.

---

## G. "Como a diferença mudou com o tempo?" — evolução

**`secao.evolucao.titulo`**

> Como a diferença mudou com o tempo?

**`secao.evolucao.resposta`**

> Desde janeiro a diferença encolheu: era de cerca de {{MARGEM_INICIO}} pontos e hoje está em
> {{MARGEM_ABS}}. No caminho ela subiu e desceu — não foi uma queda em linha reta.

**`secao.evolucao.traduzindo`**

> Cada ponto é uma pesquisa. A linha é a média do painel, que dá mais peso às pesquisas mais novas
> e maiores. A faixa em volta da linha é a dúvida: quanto mais larga, menos se sabe.

**`secao.evolucao.eixoEmpate`**

> empate

**`secao.evolucao.eixoEmpate.explica`**

> Nesta altura os dois teriam o mesmo tanto de voto.

**`secao.evolucao.rotuloLula`** → `Lula na frente ↑`
**`secao.evolucao.rotuloFlavio`** → `Flávio na frente ↓`

**`secao.evolucao.aba1`** → `1º turno` · **`secao.evolucao.aba2`** → `2º turno`

**`secao.evolucao.notaSerieCurta`**

> No 1º turno a linha é mais curta: nem todo instituto divulgou esse cenário nas pesquisas mais
> antigas.

**`secao.evolucao.faixaProjetada`**

> Depois de hoje a faixa fica tracejada: dali para a frente é projeção, não pesquisa.

**`secao.evolucao.legenda`**

> Vermelho: Lula. Azul: Flávio. Pontos: cada pesquisa. Linha: a média do painel.

**`secao.evolucao.tooltip.instituto`**

> {{INSTITUTO}} · pesquisa feita de {{CAMPO}}

**`secao.evolucao.tooltip.valores`**

> Lula {{L}}% · Flávio {{F}}%

**`secao.evolucao.tooltip.media`**

> média do painel em {{DDMM}}

---

## H. "O que dizem as {{N_PESQUISAS}} pesquisas?" — a série

**`secao.pesquisas.titulo`**

> O que dizem as {{N_PESQUISAS}} pesquisas?

**`secao.pesquisas.resposta`**

> {{QTD_EMPATE}} das {{QTD_RECENTES}} pesquisas dos últimos 35 dias estão em empate técnico; nas
> outras {{QTD_NAO_EMPATE}}, Lula aparece na frente.

**`secao.pesquisas.traduzindo`**

> Cada linha é uma pesquisa registrada no TSE, da mais nova para a mais antiga. O peso diz o
> quanto ela conta na média: mais nova e com mais gente ouvida pesa mais. A barra mostra **o dobro**
> da folga da medida — é essa a folga da diferença entre os dois. Quando a barra cruza a régua do
> empate, não dá para dizer quem está na frente.

**`secao.pesquisas.ordem`**

> Da mais nova para a mais antiga.

**`secao.pesquisas.tabela.caption`**

> As {{N_PESQUISAS}} pesquisas que alimentam o painel, da mais nova para a mais antiga.

### Colunas / rótulos de cartão

**`secao.pesquisas.col.instituto`** → `Instituto`
**`secao.pesquisas.col.campo`** → `Quando foi feita`
**`secao.pesquisas.col.n`** → `Pessoas ouvidas`
**`secao.pesquisas.col.moe`** → `Folga da medida`
**`secao.pesquisas.col.t1`** → `1º turno · Lula × Flávio`
**`secao.pesquisas.col.t2`** → `2º turno · Lula × Flávio`
**`secao.pesquisas.col.leitura`** → `O que essa pesquisa diz`
**`secao.pesquisas.col.peso`** → `Peso na média`
**`secao.pesquisas.col.tse`** → `Registro no TSE`
**`secao.pesquisas.col.remover`** → `Tirar da simulação`

**`secao.pesquisas.chip.empate`** → `empate técnico`
**`secao.pesquisas.chip.lula`** → `Lula na frente`
**`secao.pesquisas.chip.flavio`** → `Flávio na frente`

**`secao.pesquisas.chip.empate.explica`**

> A diferença é menor que **o dobro** da folga da medida — é o tamanho da folga quando se comparam
> os dois números, não só um. Não dá para dizer quem está na frente; não quer dizer que os dois
> estão iguais.

**`secao.pesquisas.peso.explica`**

> Peso é o quanto esta pesquisa conta na média. Pesquisa mais nova e com mais gente ouvida conta
> mais. Pesquisa antiga vai perdendo peso, mas continua na lista para mostrar o movimento.

**`secao.pesquisas.pesoBaixo`**

> Esta pesquisa já está velha: conta pouco na média de hoje.

**`secao.pesquisas.badge.usuario`** → `você adicionou nesta simulação`
**`secao.pesquisas.badge.auto`** → `encontrada automaticamente — confira a fonte`

**`secao.pesquisas.verRegistro`** → `Ver o registro completo`
**`secao.pesquisas.verFonte`** → `Ver a publicação original`

**`secao.pesquisas.registro.titulo`**

> {{INSTITUTO}} · pesquisa de {{CAMPO}}

**`secao.pesquisas.registro.corpo`**

> {{N}} pessoas ouvidas · folga da medida de {{MOE}} pontos · registro no TSE {{TSE}} · peso na
> média de hoje: {{PESO}}.

**`secao.pesquisas.rodapeTse`**

> Toda pesquisa eleitoral precisa ser registrada na Justiça Eleitoral antes de ser divulgada. Sem
> registro, ela não entra aqui.

---

## I. "E os outros candidatos?"

**`secao.outros.titulo`**

> E os outros candidatos?

**`secao.outros.resposta`**

> O terceiro colocado está {{GAP3}} pontos atrás do segundo — por isso o painel faz a conta do 2º
> turno só entre os dois primeiros.

**`secao.outros.traduzindo`**

> Aqui estão todos os nomes testados no 1º turno, com a média de cada um. O par principal não é
> escolha nossa: são os dois primeiros da própria lista. Se o ranking mudar, o painel avisa.

**`secao.outros.aba.principal`** → `Lula × Flávio`
**`secao.outros.aba.todos`** → `Candidatos testados nas pesquisas ({{N_CANDIDATOS}})`

**`secao.outros.marcaPrincipal`** → `● disputa principal`

**`secao.outros.bnns`**

> Branco, nulo e quem ainda não sabe somam {{BN}}% na média.

**`secao.outros.nomesPequenos`**

> Outros nomes testados em alguma pesquisa ficam em 1% ou menos e não entram no ranking.

_Nota (AUDITORIA §3.6):_ a lista de nomes escrita à mão foi **vetada** — nenhum dos quatro nomes
citados existe em `pesquisas.seed.json`, e Aécio Neves, que _está_ nos `outros1`, ficava de fora.
Se a Fase 6 quiser nomear, os nomes têm de sair de `outros1`, nunca de constante no componente
(procedência é R4/H12).

**`secao.outros.porQueDois`**

> Enquanto essa distância valer, a eleição se decide entre os dois primeiros — e é para esse par
> que os institutos perguntam sobre o 2º turno.

**`secao.outros.tabelaNd`**

> "–" quer dizer que o instituto não testou esse nome naquela pesquisa, ou não divulgou o número.

**`secao.outros.avisoParMudou`**

> ⚠ Os dois primeiros mudaram: agora são {{TOP2}}. As contas de 2º turno continuam em Lula ×
> Flávio até existirem pesquisas do novo confronto.

---

## J. "Por que a disputa está assim?" — contexto social

**`secao.contexto.titulo`**

> Por que a disputa está assim?

**`secao.contexto.resposta`**

> Os dois lados têm voto fechado e rejeição alta. Por isso a diferença anda devagar, e quase
> sempre dentro da mesma faixa.

**`secao.contexto.traduzindo`**

> Estes cartões não são opinião: são números medidos por institutos, com a fonte em cada um. Eles
> não entram na conta da probabilidade — servem para entender por que ela se mexe tão pouco.

**`secao.contexto.card1.titulo`** → `Quanta gente aprova o governo`
**`secao.contexto.card2.titulo`** → `Quanta gente diz que não votaria de jeito nenhum`
**`secao.contexto.card3.titulo`** → `Quanta gente já está decidida`
**`secao.contexto.card4.titulo`** → `O que ainda vai acontecer até a votação`
**`secao.contexto.card5.titulo`** → `O que está por trás desta disputa`

_Nota:_ os campos `dado`, `leitura` e `fonte` dos 5 cartões permanecem como estão em
`src/data/constantes.ts` (são dados medidos). O que muda é só o título, que passa a ser a pergunta
do leitor.

**`secao.contexto.sintese.titulo`**

> Juntando tudo

**`secao.contexto.sintese.texto`**

> Os dois lados têm eleitorado fechado e rejeição alta. Sobra pouca gente para conquistar — por
> isso a diferença se move devagar. O que ainda pode mexer: os cerca de 10% que estão em cima do
> muro, a propaganda na TV a partir do fim de agosto e fato novo na economia ou na Justiça.

**`secao.contexto.fonte`** → `Ver a fonte deste número`

---

## K. "Quer mexer nos números você mesmo?" — simulação e réguas

_Nota de decisão:_ o briefing sugeria "Quer mexer nas premissas?". "Premissa" foi trocada por
palavra do dia a dia (VOZ §10.7); o sentido — testar a sua própria suposição — fica inteiro.

**`secao.simulacao.titulo`**

> Quer mexer nos números você mesmo?

**`secao.simulacao.resposta`**

> Estas quatro réguas são as suposições que o painel usa. Mexa nelas e o número muda na hora.

**`secao.simulacao.traduzindo`**

> É teste seu: nada aqui altera os dados oficiais, e ninguém mais vê o que você mexeu. O botão de
> voltar ao oficial fica sempre à vista. Se você mexer em alguma régua, o painel inteiro passa a
> mostrar "simulação".

### Régua 1 — peso das pesquisas antigas

**`secao.simulacao.slider1.rotulo`**

> Quanto tempo uma pesquisa continua valendo

**`secao.simulacao.slider1.valor`** → `{{MEIA_VIDA}} dias`

**`secao.simulacao.slider1.dica`**

> Pesquisa mais nova conta mais na média. Aqui você diz em quantos dias uma pesquisa passa a valer
> a metade. Diminuindo, o painel reage mais rápido às pesquisas novas. As antigas não somem da
> lista: elas continuam contando para mostrar se a diferença subiu ou desceu.

**`secao.simulacao.slider1.aria`** → `Uma pesquisa passa a valer metade depois de {{MEIA_VIDA}} dias`

### Régua 2 — erro que todas podem cometer juntas

**`secao.simulacao.slider2.rotulo`**

> O quanto as pesquisas podem errar todas juntas

**`secao.simulacao.slider2.valor`** → `{{SIGMA_SYS}} pontos`

**`secao.simulacao.slider2.dica`**

> Às vezes o erro não é de uma pesquisa só: todas erram para o mesmo lado. Em 2022 esse erro foi de
> 6,3 pontos **na diferença entre os dois** no 1º turno e de 3,1 no 2º. A diferença é que, entre
> um turno e outro, os
> institutos corrigiram o método usando o resultado real do 1º turno. As pesquisas de hoje ainda
> não passaram por essa correção — por isso o padrão fica em 4,0, entre os dois números. Parte
> daqueles 6,3 foi gente mudando de ideia na última hora, e isso já entra na régua de baixo.

**`secao.simulacao.slider2.aria`** → `Erro que todas as pesquisas podem cometer juntas: {{SIGMA_SYS}} pontos`

### Régua 3 — o quanto a corrida ainda pode andar

**`secao.simulacao.slider3.rotulo`**

> O quanto a corrida ainda pode andar

**`secao.simulacao.slider3.valor`** → `cerca de {{DERIVA_PT}} pontos para cada lado, até 25 de outubro`

**`secao.simulacao.slider3.dica`**

> Até a votação ainda tem propaganda na TV, debate e fato novo. Esta régua diz o quanto a corrida
> ainda pode se mexer até lá. Ela muda só o número projetado para o dia da votação — o retrato de
> hoje fica igual. É ela que faz as duas linhas do topo serem diferentes.

**`secao.simulacao.slider3.aria`** → `A corrida ainda pode andar cerca de {{DERIVA_PT}} pontos até 25 de outubro`

_Nota:_ o valor exibido é o **efeito em pontos**, não o coeficiente `×√dias` (VOZ §10.9). A fórmula
continua inteira em `/metodologia`.

### Régua 4 — e se as pesquisas estiverem puxando para um lado?

**`secao.simulacao.slider4.rotulo`**

> E se as pesquisas estiverem puxando para um lado?

**`secao.simulacao.slider4.valor.zero`** → `nenhuma puxada`
**`secao.simulacao.slider4.valor.lula`** → `{{VIES_ABS}} pontos a favor de Lula`
**`secao.simulacao.slider4.valor.flavio`** → `{{VIES_ABS}} pontos a favor de Flávio`

**`secao.simulacao.slider4.dica`**

> Aqui você supõe que todas as pesquisas estão puxando para o mesmo lado, e diz o tamanho da
> puxada. Para um lado, as pesquisas estariam dando a Lula mais do que ele tem; para o outro,
> dando a Flávio mais do que ele tem. Em 2022 a puxada medida foi de 6,3 pontos **na diferença
> entre os dois** no 1º turno e de 3,1 no 2º — e elas não se somam: a do 2º turno já foi medida em pesquisas refeitas depois do 1º.
> Isto é um teste, não uma acusação.

**`secao.simulacao.slider4.aria`** → `Puxada suposta: {{VIES_ABS}} pontos {{DIRECAO}}`

### Resultado, contas e volta

**`secao.simulacao.resultado`**

> Nesta simulação, Lula é eleito em **{{SIM_LULA}}** de cada 100 cenários.

**`secao.simulacao.resultado.aria`**

> Resultado da sua simulação: {{SIM_LULA}} em 100 para Lula, {{SIM_FLAVIO}} em 100 para Flávio.

**`secao.simulacao.contas.titulo`**

> As contas, em uma linha cada

**`secao.simulacao.contas.linha1`**

> Diferença nas pesquisas: {{MARGEM}} menos a puxada suposta ({{VIES}}) = **{{MARGEM_AJ}} pontos**.

**`secao.simulacao.contas.linha2`**

> Dúvida de hoje: o quanto a média das pesquisas ainda pode variar, combinado com o erro que todas
> podem cometer juntas — dá **± {{SIGMA_HOJE}} pontos**. As duas dúvidas não se somam: juntas dão
> menos que a soma.

**`secao.simulacao.contas.linha3`**

> Dúvida no dia da votação: a dúvida de hoje combinada com o quanto a corrida ainda pode andar —
> dá **± {{SIGMA_DIA}} pontos**. Aqui também não se somam: {{SIGMA_HOJE}} e {{DERIVA_PT}} juntos
> dão {{SIGMA_DIA}}, não a soma dos dois.

**`secao.simulacao.contas.link`**

> Ver a fórmula exata na metodologia

**`secao.simulacao.restaurar`** → `Voltar as réguas para o padrão`
**`secao.simulacao.restaurar.detalhe`** → `21 dias · 4,0 pontos · corrida pode andar {{DERIVA_PT}} pontos · sem puxada`
**`secao.simulacao.restaurar.jaPadrao`** → `As réguas já estão no padrão`

**`secao.simulacao.compartilhar`** → `Compartilhar o que estou vendo`

---

## L. "E se as pesquisas errarem como em 2022?"

**`secao.erro2022.titulo`**

> E se as pesquisas errarem como em 2022?

**`secao.erro2022.resposta`**

> Se o erro do 2º turno de 2022 se repetisse igual, Lula continuaria à frente — eleito em
> {{REPLAY_EL_DIA}} de cada 100 cenários, e por pouco, como em 2022.

**`secao.erro2022.traduzindo`**

> Esta seção compara o que as pesquisas de véspera diziam com o resultado real, em cinco eleições.
> Serve para dar tamanho ao erro possível. Não é uma previsão de que ele vai acontecer de novo.

### Tabela dos cinco pleitos

**`secao.erro2022.tabela.caption`**

> O que as pesquisas de véspera diziam e qual foi o resultado real, em cinco eleições.

**`secao.erro2022.col.pleito`** → `Eleição`
**`secao.erro2022.col.resultado`** → `O resultado real`
**`secao.erro2022.col.pesquisas`** → `O que as pesquisas de véspera diziam`
**`secao.erro2022.col.erro`** → `De quanto foi o erro`

_Nota:_ o conteúdo das cinco linhas (`HISTORICO_ERROS`) é dado e permanece como está.

### Os dois lados da conta

**`secao.erro2022.podeRepetir.titulo`**

> Por que pode acontecer de novo

**`secao.erro2022.podeRepetir.texto`**

> O erro não foi acidente de uma eleição. Em 2018 e em 2022 as pesquisas subestimaram a direita —
> parte desse eleitor não responde, parte decide na última hora. O país continua dividido do mesmo
> jeito e os métodos das casas continuam parecidos. Nada garante que a correção já veio.

**`secao.erro2022.podeSerMenor.titulo`**

> Por que pode ser menor

**`secao.erro2022.podeSerMenor.texto`**

> A eleição se decide no 2º turno, e é ali que o erro histórico é bem menor: de 0,4 a 6,2 pontos em
> 2022, quase zero em 2018. Além disso, o candidato da direita agora é outro: Flávio, não Jair. Não
> se sabe quanto do voto se transfere, e a direção do erro não é regra.

### Por que o erro do 1º turno importa agora

**`secao.erro2022.porQue1T.titulo`**

> Por que o erro do 1º turno importa agora, se o do 2º é menor

**`secao.erro2022.porQue1T.p1`**

> O erro pequeno da decisão de 2022 (3,1 pontos) só foi possível porque, entre um turno e outro,
> os institutos ganharam um gabarito perfeito: o resultado real do 1º turno. Com ele na mão, eles
> corrigiram o método. **As pesquisas que alimentam este painel ainda não passaram por essa
> correção** — são o mesmo tipo de instrumento que produziu o erro de 6,3.

**`secao.erro2022.porQue1T.p2`**

> Por isso o erro do 1º turno entra três vezes na conta. Ele dá o tamanho da dúvida de hoje (o
> padrão de 4,0 fica entre os dois números). Ele muda a cara do 1º turno projetado: uma folga de
> cerca de 9 pontos vira uma chegada de cerca de 2,5. E ele define o teto do erro já visto no
> setor, usado no cartão de teste-limite. O 3,1 só vira a referência certa depois de 4 de outubro,
> quando o gabarito voltar a existir.

**`secao.erro2022.porQue1T.p3`**

> **E as correções duram de uma eleição para a outra?** Só em parte. Ajustes de método (peso de
> escolaridade, religião, forma de sortear quem responde) ficam. Mas a arma que salvou o 2º turno
> de 2022 — refazer a conta com o voto real recém-apurado — não é portátil: o gabarito envelhece e
> quem não responde muda. Existem dois testes. De 2018 para 2022, o erro do 1º turno voltou, no
> mesmo sentido e de tamanho parecido. Em São Paulo, em 2024, dois anos depois da correção,
> Datafolha e Quaest ficaram 4,7 e 8,7 pontos abaixo da diferença real de Nunes — a Futura acertou.
> Correção parcial e desigual: nem cura, nem volta à estaca zero.

**`secao.erro2022.porQue1T.p4`**

> Traduzindo em número, sempre falando da chance de Lula no dia da votação: se a correção se
> manteve (régua em 3,0), cerca de 86 em 100. Se veio só em parte — o padrão do painel, 4,0 — cerca
> de 83 em 100. Se o erro voltar para perto do tamanho do 1º turno (6,0, o topo da régua), cerca de
> 79 em 100. Escolha a sua suposição na régua de erro, logo acima.

### Curva de sensibilidade

**`secao.erro2022.curva.titulo`**

> E se a puxada fosse maior ou menor?

**`secao.erro2022.curva.instrucao`**

> Toque em qualquer ponto do gráfico para aplicar aquela puxada ao painel inteiro.

**`secao.erro2022.curva.traduzindo`**

> Esta linha responde a uma pergunta só: se todas as pesquisas estiverem puxando para o lado de
> Lula, quanto muda a chance de cada um? Quanto mais para a direita, maior a puxada que você está
> supondo.

**`secao.erro2022.curva.eixoX`** → `tamanho da puxada suposta, em pontos`
**`secao.erro2022.curva.eixoY`** → `chance de ser eleito, em cada 100`
**`secao.erro2022.curva.meio`** → `metade a metade`
**`secao.erro2022.curva.atual`** → `◆ onde você está`

**`secao.erro2022.curva.virada`**

> ponto de virada: perto de {{MARGEM}}

**`secao.erro2022.curva.legenda`**

> O ponto preto é a virada: as duas linhas se cruzam quando a puxada suposta fica **perto do
> tamanho** da diferença medida ({{MARGEM}} pontos). Puxada maior que isso a favor de Lula inverte
> quem está na frente.

**`secao.erro2022.curva.aria`**

> Gráfico: chance de cada candidato ser eleito conforme o tamanho da puxada suposta, de −3 a +10
> pontos. A virada acontece em {{MARGEM}} pontos.

### Os três cenários (cartões clicáveis)

**`secao.erro2022.cenario1.titulo`** → `As pesquisas estão certas`
**`secao.erro2022.cenario1.chances`** → `Lula {{P_L}} em 100 × Flávio {{P_F}} em 100`
**`secao.erro2022.cenario1.texto`**

> **Nesta hipótese** a média acerta, e a diferença de {{MARGEM}} pontos é a real. É assim que o
> painel calcula por padrão.

**`secao.erro2022.cenario2.titulo`** → `Igual a 2022`
**`secao.erro2022.cenario2.chances`** → `Lula {{P_L}} em 100 × Flávio {{P_F}} em 100`
**`secao.erro2022.cenario2.texto`**

> As pesquisas da decisão erram 3,1 pontos a favor de Lula — o mesmo tamanho do erro do 2º turno
> de 2022. A diferença medida cairia para cerca de 1,6 ponto, e Lula seria eleito em {{P_L}} de
> cada 100 cenários: apertado, como em 2022.

**`secao.erro2022.cenario3.titulo`** → `Teste-limite: 6,3`
**`secao.erro2022.cenario3.chances`** → `Lula {{P_L}} em 100 × Flávio {{P_F}} em 100`
**`secao.erro2022.cenario3.texto`**

> Uma hipótese que **não** aconteceu em 2022: o erro grande do 1º turno chegar inteiro até a
> decisão, sem a correção que os institutos fizeram entre os turnos. Como 6,3 passa do ponto de
> virada, quem fica na frente é Flávio — Lula é eleito em {{P_L}} de cada 100 cenários.

**`secao.erro2022.cenario.aplicado`** → `▶ aplicado ao painel`

_Nota (AUDITORIA §3.2):_ os **três** cartões publicam `.chances` — sem isso um deles carregaria a
dúvida e dois anunciariam desfecho sem número (H9). Com os números de hoje: 83/17 · **63/37** ·
**38/62**.

### Replay 2022

**Mapeamento dos `{{REPLAY_*}}`** (AUDITORIA §5a) — contra `calcReplay` (`derivados.ts` L124–163).
Valores entre parênteses são os de hoje (03/08/2026), calculados, não estimados.

| Placeholder                                 | Campo                          | Formato                                         |
| ------------------------------------------- | ------------------------------ | ----------------------------------------------- |
| `{{REPLAY_R1L}}` · `{{REPLAY_R1F}}`         | `replay.r1L` · `r1F`           | 1 casa (45,0 · 42,5)                            |
| `{{REPLAY_R2L}}` · `{{REPLAY_R2F}}`         | `replay.r2L` · `r2F`           | 1 casa (51,0 · 49,0)                            |
| `{{REPLAY_R2L_INT}}` · `{{REPLAY_R2F_INT}}` | `round(r2L)` · `round(r2F)`    | inteiro; **devem somar 100**                    |
| `{{REPLAY_M1}}`                             | `r1L − r1F`                    | 1 casa (+2,6)                                   |
| `{{REPLAY_M2}}`                             | `r2L − r2F`                    | 1 casa (+2,1)                                   |
| `{{REPLAY_P2T}}`                            | `p2Trep × 100`                 | inteiro, com piso (99)                          |
| `{{REPLAY_PV2}}`                            | `pV2rep × 100`                 | inteiro (69) — **condicional a haver 2º turno** |
| `{{REPLAY_PLIDER}}`                         | `pLider1 × 100`                | inteiro (73)                                    |
| `{{REPLAY_P1_DIRETO}}`                      | `p1Ld × 100`                   | inteiro, com piso (1)                           |
| `{{REPLAY_EL_DIA}}` · `{{REPLAY_EL_DIA_F}}` | `elRepD × 100` · `100 −`       | inteiros, soma 100 (69 · 31)                    |
| `{{REPLAY_EL_HOJE}}`                        | `elRepH × 100`                 | inteiro, com teto (98)                          |
| `{{REPLAY_P_PAINEL}}`                       | `pPainel × 100`                | inteiro (63)                                    |
| `{{REPLAY_V2_ABS}}`                         | `round(p2Trep × pV2rep × 100)` | inteiro (68) — ver §A.2                         |

**`secao.erro2022.replay.titulo`**

> E se o erro de 2022 se repetisse do mesmo tamanho?

**`secao.erro2022.replay.aviso`** _(obrigatório, mesma tela — H6)_

> Isto não diz que o erro vai se repetir. É uma conta de "e se": pegamos o erro exato das pesquisas
> de véspera de 2022 e aplicamos nos números de hoje. Em 2026 o candidato da direita é outro e o
> contexto é outro.

**`secao.erro2022.replay.card1.titulo`**

> 1º turno, com o erro de 2022 aplicado

**`secao.erro2022.replay.card1.badge`** → `vai a 2º turno em {{REPLAY_P2T}} de cada 100`

**`secao.erro2022.replay.card1.texto`**

> Lula {{REPLAY_R1L}}% × Flávio {{REPLAY_R1F}}% dos votos válidos. Pelos números centrais, ninguém
> chega à metade: em {{REPLAY_P2T}} de cada 100 cenários dessa hipótese haveria 2º turno, com uma
> chegada apertada de {{REPLAY_M1}} pontos, em vez dos {{T1_DIF}} das pesquisas. Lula chegar em 1º
> lugar acontece em {{REPLAY_PLIDER}} de cada 100.

**`secao.erro2022.replay.card2.titulo`**

> 2º turno, com o erro de 2022 aplicado

**`secao.erro2022.replay.card2.badge`** → `Lula ganha em {{REPLAY_PV2}} de cada 100`

**`secao.erro2022.replay.card2.texto`**

> Lula {{REPLAY_R2L}}% × Flávio {{REPLAY_R2F}}% dos votos válidos: vitória apertada de Lula por
> {{REPLAY_M2}} pontos — quase o resultado real de 2022, que foi 50,9 × 49,1.

**`secao.erro2022.replay.card3.titulo`**

> Somando os dois turnos nesta hipótese

**`secao.erro2022.replay.card3.numero`**

> Lula {{REPLAY_EL_DIA}} em 100 × Flávio {{REPLAY_EL_DIA_F}} em 100

**`secao.erro2022.replay.card3.conta`**

> De cada 100 cenários desta hipótese: **{{REPLAY_P1_DIRETO}}** terminam com Lula eleito já no 1º
> turno. Os outros **{{REPLAY_P2T}}** vão à decisão, e Lula ganha em {{REPLAY_PV2}} de cada 100
> deles — o que dá **{{REPLAY_V2_ABS}}** em 100. Somando os dois caminhos: **{{REPLAY_EL_DIA}}** em 100.

_Nota (AUDITORIA §3.2):_ a forma antiga renderizava "= 1 em 100 + 99 × 69" — quem fizesse a conta
na tela obtinha 6.832. Com os números de hoje a redação acima fecha: 1 + 68 = 69.

**`secao.erro2022.replay.card3.texto`**

> Nesta hipótese o erro vira suposição fixa, turno a turno, como aconteceu em 2022. A única dúvida
> que sobra é o quanto a opinião ainda pode andar até outubro. Se a votação fosse hoje sob essa
> hipótese, a dúvida quase desapareceria: a diferença ficaria perto de {{REPLAY_R2L_INT}} ×
> {{REPLAY_R2F_INT}} e Lula seria eleito em {{REPLAY_EL_HOJE}} de cada 100 cenários. É a distância
> até outubro que derruba esse número para {{REPLAY_EL_DIA}}.

**`secao.erro2022.replay.botao`**

> Aplicar esta hipótese ao painel (puxada de 3,1)

**`secao.erro2022.replay.calibracao`**

> De onde saem esses números: em 2022, as pesquisas de véspera do 1º turno davam a Lula uma
> vantagem de 7,1 a 14 pontos (média de 11,6), e o resultado real foi 5,2. No 2º turno davam de 0,8
> a 8 pontos (média de 4,9), e o resultado real foi 1,8. Os dois erros não se somam: as do 2º turno
> foram refeitas depois do susto do 1º, e o que sobrou de erro na decisão foi 3,1. Por isso a
> repetição fiel de 2022 **ainda deixa Lula na frente: eleito em {{REPLAY_EL_DIA}} de cada 100
> cenários, por pouco.** No painel principal essa mesma hipótese
> aparece como cerca de {{REPLAY_P_PAINEL}} em 100, porque lá a dúvida sobre o tamanho da puxada
> continua na conta. Para a corrida se inverter seria preciso algo que **não** aconteceu em 2022: o
> erro do 1º turno chegar inteiro à decisão — é o cartão de teste-limite, acima.

**`secao.erro2022.fontes.titulo`**

> De onde vieram os números de erro

---

## M. "O que é mais provável acontecer em outubro?" — cenário-base

**`secao.cenarioBase.titulo`**

> O que é mais provável acontecer em outubro?

**`secao.cenarioBase.resposta`** _(template dinâmico)_

> {{LIDER}} eleito, com a definição saindo em 25 de outubro e por diferença
> {{APERTADA_OU_MEDIA}}: é o caminho que aparece em {{P_V2_ABS}} de cada 100 cenários. Somando com
> o caminho de vitória já em 4 de outubro, {{LIDER}} termina eleito em {{P_ELEI}} de cada 100.

**`secao.cenarioBase.resposta.apertada`** → `apertada` (|margem ajustada| < 5)
**`secao.cenarioBase.resposta.moderada`** → `média` (|margem ajustada| ≥ 5)

**`secao.cenarioBase.traduzindo`**

> De todos os caminhos que o painel calcula, este é o que aparece em mais cenários. "Mais provável"
> não é "certo": os outros caminhos continuam existindo, com as chances mostradas ao lado.

**`secao.cenarioBase.passo1.titulo`** → `4 de outubro · 1º turno`
**`secao.cenarioBase.passo1.texto`**

> Na maioria dos cenários ninguém passa da metade: vai para o 2º turno em {{P_2T}} de cada 100.
> Lula chega em 1º lugar em {{P_LULA_1}} de cada 100.

**`secao.cenarioBase.passo2.titulo`** → `25 de outubro · 2º turno`
**`secao.cenarioBase.passo2.texto`**

> Havendo 2º turno, {{LIDER}} ganha a decisão em {{P_V2}} de cada 100 desses cenários — como o 2º
> turno acontece em {{P_2T}} de cada 100, esse caminho vale {{P_V2_ABS}} em 100. Some os
> {{P_1T_DIRETO}} em 100 em que {{LIDER}} já ganha em 4 de outubro: {{P_ELEI}} em 100.

**`secao.cenarioBase.passo3.titulo`** → `Divisão de votos mais provável`
**`secao.cenarioBase.passo3.texto`**

> Lula {{PLACAR_L}}% × Flávio {{PLACAR_F}}% dos votos válidos. Em 8 de cada 10 cenários, a
> diferença **medida nas pesquisas** fica entre {{INT80_MIN}} e {{INT80_MAX}} pontos.

**`secao.cenarioBase.bandas.titulo`**

> De quanto pode ser a diferença no fim, do jeito que as pesquisas medem

**`secao.cenarioBase.bandas.flavio`** → `Flávio na frente`
**`secao.cenarioBase.bandas.ate5`** → `Lula por até 5 pontos`
**`secao.cenarioBase.bandas.5a10`** → `Lula por 5 a 10`
**`secao.cenarioBase.bandas.mais10`** → `Lula por mais de 10`

_Despacho (AUDITORIA §9.3 — canônico):_ a base "do jeito que as pesquisas medem" é dita UMA vez
no título; CONDIÇÃO: o título fica na MESMA dobra dos chips, nunca colapsado — se algum layout
os separar, os chips voltam a carregar "nas pesquisas".
**`secao.cenarioBase.bandas.modal`** → `● o mais provável`
**`secao.cenarioBase.bandas.legenda`**

> Cada pedaço é uma faixa de diferença, e o tamanho dele é a chance daquela faixa acontecer.

**`secao.cenarioBase.porQue.titulo`**

> Por que este é o caminho mais provável

**`secao.cenarioBase.porQue.texto`**

> Quatro motivos. **Um:** a vantagem é constante — 6 dos 7 institutos de julho mostram Lula à
> frente, e no sétimo os dois estão em empate técnico; a comparação de cada instituto com ele mesmo
> está estável. **Dois:** o contexto medido não desfavorece quem está no governo: aprovação e
> desaprovação próximas, rejeição alta dos dois lados e mais gente aberta a votar em Lula (47%
> contra 38%). **Três:** com dois terços de cada lado já decididos, a diferença anda devagar. Virar
> exige movimento fora do padrão de 2026. **Quatro:** mesmo assim a diferença fica apertada. Quando
> as pesquisas erraram em 2018 e em 2022, o erro foi na mesma direção — subestimando a direita — e a
> repetição fiel de 2022 dá algo perto de 51 × 49.

**`secao.cenarioBase.oQueDerruba`**

> Três coisas derrubariam este caminho. Pesquisas novas levando a diferença para baixo de 2 pontos.
> Três institutos seguidos com Flávio na frente, fora da folga. Ou um erro de pesquisa maior que o
> já visto quando os institutos tinham o gabarito na mão.

**`secao.cenarioBase.comoFoiFeito.titulo`**

> Como este caminho foi escolhido

**`secao.cenarioBase.comoFoiFeito.texto`**

> O painel vai perguntando, uma coisa de cada vez, e fica sempre com a resposta mais provável.
> Cada resposta é a mais provável da sua pergunta — juntas elas descrevem o caminho mais comum, não
> o único. Acaba no 1º turno? Não, em {{P_2T}} de cada 100 cenários vai para o 2º. Quem chega na frente?
> {{LIDER_1T}}. Quem ganha a decisão? {{LIDER}}. Por quanto? A faixa em destaque acima. Nada disso é
> opinião fixa: mude a régua da puxada para 6,3 e esta seção passa a descrever, sozinha, a vitória
> de Flávio.

**`secao.cenarioBase.notaFrequencia`**

> Leitura das pesquisas, não previsão nem torcida. Um resultado que aparece em {{P_CONTRA}} de
> cada 100 cenários acontece, no longo prazo, 1 vez a cada {{UMA_EM}} eleições parecidas.

---

## N. "De onde vêm esses números?" — resumo do método

**`secao.metodo.titulo`**

> De onde vêm esses números?

**`secao.metodo.resposta`**

> De {{N_PESQUISAS}} pesquisas registradas no TSE, misturadas numa média que dá mais peso às mais
> novas e às que ouviram mais gente.

**`secao.metodo.traduzindo`**

> Depois da média, o painel calcula duas chances: uma se a votação fosse hoje e outra para o dia da
> votação. A segunda carrega mais dúvida, porque até lá a corrida ainda pode andar. Nada aqui é
> torcida: as contas estão abertas e as quatro suposições do painel ficam à vista.

**`secao.metodo.item1`**

> **O peso de cada pesquisa** vem de duas coisas: quando ela foi feita e quantas pessoas ouviu.

**`secao.metodo.item2`**

> **A tendência** compara cada instituto com ele mesmo, para que diferença de método não vire
> movimento falso.

**`secao.metodo.item3`**

> **As faixas:** de 50 a 60 em 100 **está em aberto**; de 60 a 75, na frente por pouco; de 75 a 90,
> na frente; acima de 90, bem na frente — e nem aí é garantia.

**`secao.metodo.item4`**

> **Empate técnico**, em uma pesquisa isolada, é quando a diferença é menor que o dobro da folga da
> medida.

**`secao.metodo.link`**

> Ler a metodologia completa, com as limitações e as fontes →

---

## O. Glossário (chips tocáveis)

**`glossario.titulo`** → `O que é isso?`
**`glossario.abrir.aria`** → `o que é {{TERMO}}`
**`glossario.fechar`** → `Fechar`
**`glossario.verTodos`** → `Ver todas as palavras explicadas`

**`glossario.margemErro`** — _margem de erro_

> É a folga da medida. A pesquisa ouviu uma parte das pessoas, não todas — então o número real pode
> estar um pouco para cima ou um pouco para baixo. Exemplo: folga de 2 pontos com Lula em 47%
> quer dizer que o número real está, provavelmente, entre 45% e 49%.

**`glossario.segundoTurno`** — _2º turno_

> Se ninguém passar da metade dos votos válidos no 1º turno, os dois mais votados disputam de novo,
> três semanas depois. Em 2026: 4 de outubro e 25 de outubro.

**`glossario.votosValidos`** — _votos válidos_

> É o bolo de votos depois de tirar os brancos e os nulos. Nas pesquisas também se tira quem ainda
> não sabe, porque essa pessoa ainda não escolheu. É esse bolo que decide se alguém passou da
> metade e ganhou já no 1º turno.

**`glossario.tendencia`** — _tendência_

> É a comparação de cada instituto com ele mesmo: a pesquisa nova contra a anterior da mesma casa.
> Mostra se a diferença subiu ou desceu. Não diz que vai continuar subindo.

**`glossario.vies`** — _viés_

> É a pergunta "e se todas as pesquisas estiverem puxando para o mesmo lado?". Você diz o tamanho
> da puxada e o painel refaz a conta. É um teste, não uma acusação.

**`glossario.empateTecnico`** — _empate técnico_

> É quando a diferença entre os dois é menor que **o dobro** da folga da medida — a folga de cada
> número vale em dobro quando se comparam os dois. Não quer dizer que estão iguais: quer dizer que
> a pesquisa não consegue dizer quem está na frente.

**`glossario.projecao`** — _projeção_

> É o número calculado para o dia da votação, não para hoje. Ele junta o retrato de hoje com o
> quanto a corrida ainda pode andar até lá.

**`glossario.peso`** — _peso da pesquisa_

> É o quanto cada pesquisa conta na média. Mais nova e com mais gente ouvida conta mais. A antiga
> vai perdendo peso, mas continua na lista para mostrar o movimento.

**`glossario.pontos`** — _ponto_

> Ponto é a unidade da diferença. Uma diferença de 5 pontos quer dizer cerca de 5 pessoas a mais em
> cada 100.

**`glossario.chance`** — _chance_

> Chance é quantas vezes uma coisa acontece em 100 situações parecidas. 10 em 100 é o mesmo que 1
> em 10: pouco, mas não impossível.

**`glossario.amostra`** — _quantas pessoas foram ouvidas_

> É o tamanho da pesquisa. Quanto mais gente ouvida, menor a folga da medida — mas ouvir mais gente
> não conserta erro de método.

**`glossario.deriva`** — _o quanto a corrida ainda pode andar_

> É o espaço que sobra para a opinião mudar até a votação, por causa da propaganda na TV, dos
> debates e de fatos novos. Quanto mais longe o dia da votação, maior esse espaço.

**`glossario.registroTse`** — _registro no TSE_

> Toda pesquisa eleitoral precisa ser registrada na Justiça Eleitoral antes de ser divulgada, com
> um número que fica público. Pesquisa sem registro não entra aqui.

---

## P. Botões, ações e microcopy

**`acoes.verPesquisas`** → `Ver as {{N_PESQUISAS}} pesquisas`
**`acoes.verRegistro`** → `Ver o registro completo`
**`acoes.verFonte`** → `Ver a publicação original`
**`acoes.comoContaFeita`** → `Como esta conta é feita`
**`acoes.verMetodologia`** → `Ler a metodologia completa`
**`acoes.verHistorico`** → `Ver o que já mudou na lista`
**`acoes.compartilhar`** → `Compartilhar o que estou vendo`
**`acoes.compartilhar.copiado`** → `✓ Link copiado — ele reabre a página do jeito que você deixou`
**`acoes.compartilhar.erro`** → `Não deu para copiar. Selecione o endereço lá em cima e copie.`
**`acoes.restaurarOficial`** → `Trazer as pesquisas oficiais de volta`
**`acoes.restaurarParametros`** → `Voltar as réguas para o padrão`
**`acoes.voltarOficial`** → `↺ Voltar ao oficial`
**`acoes.abrirComoLer`** → `Como ler esta página`
**`acoes.abrirGlossario`** → `O que é isso?`
**`acoes.fecharFolha`** → `Fechar`
**`acoes.adicionarPesquisa`** → `Adicionar uma pesquisa (só na minha simulação)`
**`acoes.removerPesquisa`** → `Tirar {{INSTITUTO}} da minha simulação`
**`acoes.incluirPesquisa`** → `Incluir na minha simulação`
**`acoes.fecharFormulario`** → `Fechar`
**`acoes.aplicarCenario`** → `Aplicar este cenário ao painel`
**`acoes.trocarTurno`** → `Ver o 1º turno` / `Ver o 2º turno`

---

## Q. Selo de frescor

**`frescor.ok`**

> verificado automaticamente {{QUANDO}} às {{HORA_VERIF}}h · última pesquisa incluída em
> {{DDMM_ULTIMA}}

**`frescor.alerta`**

> última verificação automática há {{N_DIAS}} dias · última pesquisa incluída em {{DDMM_ULTIMA}}

**`frescor.semBanco`**

> lista guardada aqui no site, de {{DATA_BASE}} · última pesquisa incluída em {{DDMM_ULTIMA}}

**`frescor.explica`**

> Todo dia um robô procura pesquisas novas. Nada entra sem uma pessoa conferir e aprovar, e tudo
> o que entra fica registrado numa lista pública.

_Nota:_ o selo é informativo — não é botão e não tem cara de clicável (R3).

---

## R. Modo simulação (R5)

**`simulacao.faixa`**

> ⚠ Modo de teste — não muda os dados oficiais

**`simulacao.faixa.detalheSerie`** → `· lista alterada por você ({{N_PESQUISAS}} pesquisas)`
**`simulacao.faixa.detalheReguas`** → `· réguas alteradas por você`
**`simulacao.faixa.voltar`** → `↺ Voltar ao oficial`

**`simulacao.aviso`**

> Você está mexendo nos números. Isto vale só no seu celular, nesta visita: a lista oficial de
> pesquisas continua igual para todo mundo.

**`simulacao.formulario.titulo`**

> Adicionar uma pesquisa à minha simulação

**`simulacao.formulario.aviso`**

> Só entra pesquisa com registro no TSE. O que você adicionar aqui vale só nesta tela e some quando
> você voltar ao oficial. Para a pesquisa entrar de verdade na lista, ela passa pela conferência de
> uma pessoa.

**`simulacao.formulario.campo.instituto`** → `Instituto *`
**`simulacao.formulario.campo.fim`** → `Último dia da pesquisa *`
**`simulacao.formulario.campo.n`** → `Quantas pessoas foram ouvidas`
**`simulacao.formulario.campo.moe`** → `Folga da medida, em pontos`
**`simulacao.formulario.campo.tse`** → `Número do registro no TSE`
**`simulacao.formulario.campo.l2`** → `2º turno · Lula % *`
**`simulacao.formulario.campo.f2`** → `2º turno · Flávio % *`
**`simulacao.formulario.campo.l1`** → `1º turno · Lula %`
**`simulacao.formulario.campo.f1`** → `1º turno · Flávio %`
**`simulacao.formulario.campo.bnns1`** → `1º turno · branco, nulo e não sabe %`
**`simulacao.formulario.obrigatorios`** → `* precisa preencher. Pode usar vírgula nos decimais.`
**`simulacao.formulario.erro`** → `Faltou preencher {{CAMPO}}. Sem isso não dá para calcular.`

**`simulacao.resultado.rotulo`**

> nesta simulação

**`simulacao.naoOficial`**

> Este número é da sua simulação. O número oficial do painel está no topo da página.

---

## S. Estados vazios e de erro

**`estados.serieVazia.titulo`**

> Sem pesquisa nenhuma, não há o que calcular.

**`estados.serieVazia.texto`**

> Você tirou todas as pesquisas da sua simulação. Sem pesquisa não existe média, nem diferença, nem
> chance — então o painel prefere não mostrar nada a mostrar zeros. A lista oficial continua
> intacta.

**`estados.serieVazia.acao`** → `Trazer as pesquisas oficiais de volta`

**`estados.semBanco`**

> Estamos mostrando a lista guardada aqui no site, de {{DATA_BASE}}. A conexão com o banco de
> pesquisas falhou agora — nenhum número foi inventado, só pode estar faltando pesquisa nova.

**`estados.falhaRede`**

> Este bloco não conseguiu atualizar agora. O que você está vendo é a última informação que chegou,
> de {{HORA}}.

**`estados.semTendencia`**

> Ainda não dá para comparar: este instituto só publicou uma pesquisa até agora.

**`estados.semDado`**

> "–" quer dizer que o instituto não perguntou isso, ou não divulgou o número.

**`estados.graficoCarregando.aria`**

> Carregando o gráfico.

**`estados.semHistorico`**

> Ainda não há pesquisas suficientes para desenhar uma linha do tempo. Assim que houver, ela
> aparece aqui.

**`estados.semAlteracoes`**

> Nenhuma mudança registrada até agora.

**`estados.naoEncontrada.titulo`**

> Esta página não existe (ou mudou de lugar).

**`estados.naoEncontrada.acao`** → `Voltar para o painel`

**`estados.erroServidor.titulo`**

> Alguma coisa quebrou do nosso lado.

**`estados.erroServidor.texto`**

> Os números não sumiram. Tente de novo daqui a um minuto.

---

## T. Rodapé

_Despacho da Fase 7/iteração 2 (MAJOR do aviso legal 3×): as chaves `rodape.simples.p1..p4` estão
**DESCONTINUADAS** — cada afirmação delas já existia dentro do bloco jurídico, e a tela dizia o
mesmo três vezes. O rodapé passa a ter UMA fonte: o bloco jurídico íntegro, com o parágrafo da
chance promovido a primeiro e liderado por "**Isto não é previsão.**" em negrito. Título:_

**`rodape.titulo`**

> Antes de sair

**`rodape.datas`**

**`rodape.datas`**

> Eleições: 1º turno **04/10/2026** · 2º turno **25/10/2026**.

**`rodape.nav.painel`** → `Painel`
**`rodape.nav.metodologia`** → `Metodologia`
**`rodape.nav.historico`** → `O que já mudou`

**`rodape.legalCompleta`** _(permanece — texto atual de `src/components/site/rodape.tsx`, sem
corte; a versão simples acima fica ACIMA dela, não no lugar dela)_

> Aviso: ferramenta estatística e educacional, sem vínculo com candidatos, partidos, institutos de
> pesquisa ou veículos de imprensa. […texto integral preservado…]

---

## U. `/metodologia` — só o seletor e as aberturas simples

**A camada técnica permanece INTACTA.** O que entra aqui é (1) o seletor e (2) uma abertura em
linguagem simples para cada bloco, acima do texto técnico existente.

**`metodologia.seletor.rotulo`**

> Como você quer ler esta página?

**`metodologia.seletor.simples`** → `Explicação simples`
**`metodologia.seletor.tecnica`** → `Explicação técnica`

**`metodologia.seletor.dica`**

> A explicação técnica é a mesma que sempre esteve aqui, palavra por palavra. A simples não tira
> nada: só troca as palavras difíceis.

**`metodologia.titulo`**

> De onde vêm os números desta página?

**`metodologia.medias.simples`**

> Cada pesquisa entra na média com um peso: mais nova e com mais gente ouvida pesa mais. Depois o
> painel calcula duas chances — uma se a votação fosse hoje e outra para o dia da votação. A
> segunda carrega mais dúvida, porque até lá a corrida ainda pode andar. A chance final soma os
> dois caminhos: ganhar já no 1º turno, ou ganhar no 2º.

**`metodologia.tendencia.simples`**

> Para saber se a diferença subiu ou desceu, o painel compara cada instituto com ele mesmo: a
> pesquisa nova contra a anterior da mesma casa, até 75 dias de distância. Assim, diferença de
> método entre institutos não vira movimento falso. Mudança menor que 0,8 ponto é tratada como
> "ficou igual".

**`metodologia.classificacao.simples`**

> São quatro faixas para descrever a chance: de 50 a 60 em 100 **está em aberto**; de 60 a 75, na
> frente por pouco; de 75 a 90, na frente; acima de 90, bem na frente — e nem aí é garantia. Numa pesquisa
> isolada, empate técnico é quando a diferença é menor que o dobro da folga da medida.

**`metodologia.limitacoes.simples`**

> Pesquisa é uma foto do momento, e foto sai errada às vezes. Aqui estão, sem maquiagem, os pontos
> em que este painel pode errar — inclusive os que a gente não tem como consertar.

**`metodologia.atualizacao.simples`**

> Pesquisa nova não entra sozinha. Um robô procura todo dia, e uma pessoa precisa conferir a fonte
> e aprovar. Tudo o que entra ou sai fica registrado numa lista pública. Não existe botão de
> atualizar nesta página, de propósito.

**`metodologia.fontesSerie.simples`**

> Estas são as {{N_PESQUISAS}} pesquisas que alimentam o painel, com o número do registro no TSE e
> o link da publicação original de cada uma.

**`metodologia.fontesErros.simples`**

> Estas são as reportagens e os registros de onde saíram os números de erro de 2018, 2022 e 2024.

**`metodologia.avisoTecnico`**

> Abaixo, o texto técnico completo — é ele que vale para quem quiser conferir a conta.

---

## V. `/historico` — o que já mudou

_Fora do INVENTÁRIO (superfície criada na produção), incluída para não ficar sem voz._

**`historico.titulo`**

> O que já mudou nesta página?

**`historico.resposta`**

> Toda pesquisa que entrou ou saiu da lista está registrada aqui, com data.

**`historico.traduzindo`**

> Este é o histórico do próprio painel. Ele existe para você poder conferir se algum número mudou
> de um dia para o outro — e por quê. Quem fez a alteração não aparece; o que aparece é o ato.

**`historico.grafico.titulo`**

> Como a chance mudou com o tempo

**`historico.grafico.traduzindo`**

> Cada ponto é a chance calculada naquele dia, projetada para o dia da votação. A faixa em volta é
> a dúvida daquele dia.

**`historico.linhaTempo.titulo`**

> O que entrou e o que saiu da lista

**`historico.linhaTempo.entrou`** → `entrou: {{INSTITUTO}}, pesquisa de {{CAMPO}}`
**`historico.linhaTempo.saiu`** → `saiu: {{INSTITUTO}}, pesquisa de {{CAMPO}}`

**`historico.mudouPorQue`** _(P2 / H10 — narrar o movimento)_

> Quando entrou a pesquisa do {{INSTITUTO}}, que puxou a diferença {{PARA_ONDE}}, a chance passou
> de {{ANTES}} para {{DEPOIS}} em 100. Parte do movimento de um dia para o outro também vem do
> calendário: quanto menos tempo falta, menos a corrida ainda pode andar.

---

## W. Cobertura do INVENTÁRIO — nada sumiu

Verificação item a item de `docs/INVENTARIO.md` §3 e §4. "Chave" aponta onde o texto vive agora.

| Item do INVENTÁRIO                        | Onde ficou                                                                                                                                         |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 sobretítulo "Apuração de pesquisas…"  | **substituído** por `marca.wordmark` + `marca.tagline` (VOZ §10.8)                                                                                 |
| 3.1 título "PRESIDENTE 2026"              | `marca.tituloPagina` (sem caixa alta)                                                                                                              |
| 3.1 subtítulo (N pesquisas, base)         | `hero.procedencia` + `frescor.*`                                                                                                                   |
| 3.1 botão "Atualizar agora" (R3)          | `frescor.ok/alerta/semBanco` + `frescor.explica`                                                                                                   |
| 3.1 contadores de dias                    | `hero.linhaTempo`, `hero.linhaTempo.primeiro`                                                                                                      |
| 3.2 cabeçalho da tela / "não é previsão"  | `hero.manchete`, `hero.naoEPrevisao`                                                                                                               |
| 3.2 linha principal (projetada)           | `hero.manchete` + `hero.manchete.rodape`                                                                                                           |
| 3.2 linha secundária (hoje)               | `hero.hoje`                                                                                                                                        |
| 3.2 aviso âmbar de viés                   | `hero.avisoVies` (+ `.direcao.*`)                                                                                                                  |
| 3.2 veredito (4 faixas + sufixo)          | `hero.veredito.*` (4 títulos + 4 textos + sufixo)                                                                                                  |
| 3.2 caminho mais provável                 | `hero.caminho`                                                                                                                                     |
| 3.2 nota externa (as duas linhas)         | `hero.hoje.porQueDifere` + `hero.traduzindo`                                                                                                       |
| 3.3 abas + par definido pelos dados       | `secao.outros.aba.*`, `secao.outros.resposta`, `secao.outros.porQueDois`                                                                           |
| 3.3 aviso de par líder mudado             | `secao.outros.avisoParMudou`                                                                                                                       |
| 3.3 barras, bn, nomes ≤1%, tabela, gap3   | `secao.outros.marcaPrincipal`, `.bnns`, `.nomesPequenos`, `.tabelaNd`                                                                              |
| 3.4 cartão 1º turno (todos os campos)     | `secao.frente.t1.*` + `secao.frente.tendencia.*`                                                                                                   |
| 3.4 cartão 2º turno (todos os campos)     | `secao.frente.t2.*`                                                                                                                                |
| 3.5 evolução (toggle, tooltip, nota)      | `secao.evolucao.*`                                                                                                                                 |
| 3.5 distribuição / espaço de virada       | `secao.virar.*`                                                                                                                                    |
| 3.6 contexto social (5 cartões + síntese) | `secao.contexto.*` — síntese SUPRIMIDA por corte de repetição (AUDITORIA §11 H1: as 4 ideias vivem nos cartões 2–5); vira "O que ainda pode mexer" |
| 3.7 4 sliders com dica completa           | `secao.simulacao.slider1..4.*`                                                                                                                     |
| 3.7 caixa de fórmulas                     | `secao.simulacao.contas.linha1..3` + `.link`                                                                                                       |
| 3.7 botão restaurar padrão                | `secao.simulacao.restaurar*`                                                                                                                       |
| 3.7 estado na URL / compartilhar          | `acoes.compartilhar*`, `marca.compartilhar.textoSimulacao`                                                                                         |
| 3.8 tabela dos 5 pleitos                  | `secao.erro2022.tabela.caption` + `.col.*`                                                                                                         |
| 3.8 "pode se repetir" / "pode ser menor"  | `secao.erro2022.podeRepetir.*`, `.podeSerMenor.*`                                                                                                  |
| 3.8 bloco "erro do 1ºT importa agora"     | `secao.erro2022.porQue1T.p1..p4` (inclui 86 / 83 / 79)                                                                                             |
| 3.8 curva de sensibilidade + clique       | `secao.erro2022.curva.*`                                                                                                                           |
| 3.8 3 cartões de cenário                  | `secao.erro2022.cenario1..3.*`                                                                                                                     |
| 3.8 legenda do ponto de virada            | `secao.erro2022.curva.legenda`                                                                                                                     |
| 3.8 Replay 2022 (3 cartões + botão)       | `secao.erro2022.replay.*`                                                                                                                          |
| 3.8 parágrafo de calibração               | `secao.erro2022.replay.calibracao`                                                                                                                 |
| 3.8 fontes do histórico                   | `secao.erro2022.fontes.titulo`                                                                                                                     |
| 3.9 título dinâmico do cenário-base       | `secao.cenarioBase.resposta` (+ `.apertada` / `.moderada`)                                                                                         |
| 3.9 3 cartões da linha do tempo           | `secao.cenarioBase.passo1..3.*`                                                                                                                    |
| 3.9 bandas de margem + modal              | `secao.cenarioBase.bandas.*`                                                                                                                       |
| 3.9 "por que este é o cenário-base"       | `secao.cenarioBase.porQue.*` + `.oQueDerruba`                                                                                                      |
| 3.9 metodologia da seção                  | `secao.cenarioBase.comoFoiFeito.*`                                                                                                                 |
| 3.9 nota "1 vez a cada N eleições"        | `secao.cenarioBase.notaFrequencia`                                                                                                                 |
| 3.10 colunas da tabela + chips + peso     | `secao.pesquisas.col.*`, `.chip.*`, `.peso.explica`                                                                                                |
| 3.10 badges usuário/auto, linhas fracas   | `secao.pesquisas.badge.*`, `.pesoBaixo`                                                                                                            |
| 3.10 formulário (R5) e restaurar          | `simulacao.formulario.*`, `acoes.restaurarOficial`                                                                                                 |
| 3.10 cartões abaixo de md                 | `secao.pesquisas.registro.*`, `.verRegistro`                                                                                                       |
| 3.11 metodologia (6 blocos)               | `metodologia.*` (abertura simples; técnico intacto)                                                                                                |
| 3.12 aviso legal                          | `rodape.simples.p1..p4` + `rodape.legalCompleta` (integral)                                                                                        |
| 4 estado vazio                            | `estados.serieVazia.*`                                                                                                                             |
| 4 focus, fontes, formatos                 | regras em `VOZ.md` §8 (não são texto)                                                                                                              |
| — degradação sem banco (R8)               | `estados.semBanco`, `estados.falhaRede`                                                                                                            |
| — faixa "Como ler esta página" (novo)     | `comoLer.*`                                                                                                                                        |
| — glossário tocável (novo, P3)            | `glossario.*` (13 termos)                                                                                                                          |

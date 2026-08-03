# INVENTÁRIO DO PROTÓTIPO — `agregador-presidencial-2026.jsx`

Checklist de paridade: **nada daqui pode sumir** no produto final (Fase 4 risca item a item).
Onde a arquitetura de produção muda o comportamento (ex.: botão público de atualização → selo de
frescor + gatilho no /admin), a mudança está anotada como **[MUDA: …]** conforme as regras R1–R8.

## 1. Dados e constantes (migram byte a byte — Fase 0)

- [x] `PESQUISAS_OFICIAIS` — 13 pesquisas (jan–jul/2026), campos: id, instituto, contratante,
      inicio, fim, n, moe, tse, t1 {lula, flavio, bnns}, outros1 (por candidato), t2 {lula,
      flavio, bnns}, fonte (URL). Valores `null` = não divulgado.
- [x] `CONTEXTO` — 5 cartões (aprovação do governo; rejeição e teto; piso firme; calendário;
      pano de fundo), cada um com titulo, dado, leitura, fonte.
- [x] `HISTORICO_ERROS` — 5 pleitos (2018 1ºT/2ºT, 2022 1ºT/2ºT, 2024 SP) com urna, pesq, erro.
- [x] `ERRO_2022` — t1 {lula −1.0, flavio +5.3, margem 6.3}, t2 {lula −1.6, flavio +1.6,
      margem 3.1} + comentário metodológico "os erros NÃO se somam".
- [x] `CENARIOS_VIES` — 3 cenários (0 "sem viés", 3.1 "réplica 2022", 6.3 "teste-limite").
- [x] `FONTES_ERROS` — 6 fontes com nome e URL (Metrópoles, CNN, Congresso em Foco, Estado de
      Minas, Gazeta, Wikipédia).
- [x] `CANDIDATOS` — 9 candidatos com nome, partido, cor.
- [x] `PARAMS_PADRAO` — meiaVida 21 · sigmaSys 4.0 · coefDeriva 0.35 · vies 0.
- [x] `CORES` — papel #E8E8DF, cartao #F6F6F0, tela #0E241A, telaBorda #1E3A2C, fosforo
      #A7EFBB, fosforoForte #D8FBE2, tinta #181C18, cinza #63685F, linha #C6C6B8, lula #C4122F,
      flavio #16418C, alerta #D96A1B, confirma #1E7A46. (Vira token na Fase 1.)
- [x] `ELEICAO_1T` = 2026-10-04T12:00-03:00 · `ELEICAO_2T` = 2026-10-25T12:00-03:00.
- [x] `ULTIMA_ATUALIZACAO` = "03/08/2026" **[MUDA: passa a vir do banco/audit — selo de frescor]**.
- [x] `montarPromptBusca(desde)` — prompt do coletor de pesquisas **[MUDA: vai para o updater
      server-side]**.

## 2. Modelo estatístico (paridade numérica exata — Fase 3)

- [x] `normCdf(z)` — aproximação de Abramowitz-Stegun com os coeficientes exatos.
- [x] `meioCampo(p)` — ponto médio do campo em ms (meio-dia −03:00).
- [x] `mediaEm(t, polls, metric, meiaVida)` — média ponderada por recência (decaimento
      exponencial meia-vida) × √(n/2000) com teto 1,5; ignora pesquisas com mid > t; retorna
      {valor, k}.
- [x] `tendenciaPareada(polls, metric)` — última − penúltima rodada do MESMO instituto (≤75
      dias); média dos deltas; retorna {delta, pares}.
- [x] `rodarModelo(pesquisas, params, hojeMs)` — saída completa: linhas (com idadeDias, w,
      margem2, empate2), seAgora (piso 0,8), sdEntre, kEff, mediaL2/F2, margem, margemAj,
      validoL2, t1raw/t1rawF/t1valL/t1valF, p1 {lulaHoje, flavioHoje, lulaDia, flavioDia} com
      sigShare = √((base/2)² + 1,5²) e viés dividido ±vies/2, sigmaHoje/sigmaDia1/sigmaDia2,
      deriva1/deriva2 (coef×√dias), pL2hoje, pL2dia, int80 (z=1,2816), p2Tacontece,
      eleito {hoje, dia} (combinada: 1ºT direto + P(2ºT)×P(vitória 2ºT)), tend1/tend2 (l, f, m),
      serie1/serie2 (passo de 6 dias + ponto final em hojeMs), dias1T/dias2T (ceil), veredito
      (titulo + texto por faixas <60/<75/<90/≥90 + sufixo de viés), qtdEmpate/qtdRecentes (<35 dias).
- [x] `calcVies(vies)` — recalcula elD/elH para um viés dado (usado pela curva de sensibilidade
      e cartões de cenário).
- [x] `serieSens` — curva de −3 a +10 em passos de 0,25 (v arredondado a 2 casas).
- [x] `replay` — réplica 2022: r1L/r1F (erro 1ºT sobre válidos do 1ºT), r2L/r2F (erro 2ºT sobre
      validoL2), estimativa condicional (erro vira premissa fixa; resta deriva + ruído amostral,
      sem sigmaSys): sD1c/sD2c = hypot(seAgora, deriva), mRep = margem − 3,1, p2d/p2h, p1Ld/p1Fd/
      p1Lh/p1Fh, elRepD/elRepH, p2Trep, sM1 = hypot(sD1c, 3.0), pLider1, pV2rep, pPainel
      (= calcVies(3.1).elD).
- [x] `cenBase` — cenário modal: lider, pElei, pDireto, pV2, pLulaEm1 (m1 = margem válidos 1ºT −
      viés; sM1 = hypot(sigmaDia1, 3)), bandas de margem (Flávio vence / Lula 0–5 / 5–10 / 10+)
      sobre N(margemAj, sigmaDia2), banda modal, margemValid, placarL.
- [x] `campoCompleto` — ranking dos 9 candidatos por mediaEm sobre t1/outros1, bn médio, top2,
      parPadrao, gap3, pollsCampo (7 mais recentes com t1).
- [x] `dadosDist` — 121 pontos da densidade normal da margem (±4σ), split lula (x>0) / flavio (x≤0).
- [x] `pontosGrafico` — scatter por pesquisa conforme turno selecionado.
- [x] Formatadores: `fmt` (vírgula decimal, "–" p/ null), `fmtSinal` (+/−), `fmtData` (dd/mm),
      `pct` (arredonda p/ %).

## 3. Seções da página (paridade funcional — Fase 4)

### 3.1 Cabeçalho

- [x] Sobretítulo "Apuração de pesquisas · registro obrigatório no TSE".
- [x] Título "PRESIDENTE 2026" (Archivo black).
- [x] Subtítulo: "Lula (PT) × Flávio Bolsonaro (PL) · N pesquisas na série · base editorial de dd/mm/aaaa".
- [x] Botão "▶ Atualizar agora" com estados buscando/ok/erro e mensagens **[MUDA R3: sai da
      página pública; vira selo de frescor "verificado automaticamente hoje às 09h · última
      pesquisa incluída em dd/mm"; gatilho manual só no /admin]**.
- [x] Contadores "dias p/ 1º turno 04/10" e "dias p/ 2º turno 25/10".

### 3.2 Tela da urna (elemento-assinatura)

- [x] Moldura verde-escura com sombra interna; cabeçalho fósforo "CHANCE DE SER ELEITO · LULA
      (esq.) × FLÁVIO (dir.)" + "LEITURA DOS DADOS · NÃO É PREVISÃO" + cursor piscante ▊
      (com prefers-reduced-motion).
- [x] Linha principal (grande): "Projetado para o dia da votação (04–25/10, incerteza ±σ p.p.)"
      — pct Lula × barra bicolor × pct Flávio.
- [x] Linha secundária: "No cenário atual — se a votação fosse hoje (incerteza ±σ p.p.)".
- [x] Aviso âmbar quando viés ≠ 0 (média bruta → margem efetiva).
- [x] Veredito: título em caixa alta (por faixa de probabilidade) + texto explicativo + caminho
      mais provável (P(2ºT), P(definição no 1ºT)).
- [x] Nota externa: "A diferença entre as duas linhas é o tempo… Probabilidade não é previsão…".

### 3.3 Abas Disputa principal × Todos os candidatos

- [x] Toggle com contagem dinâmica; par principal DEFINIDO PELOS DADOS (top2 do 1ºT).
- [x] Aviso âmbar se o par líder mudar (parPadrao false).
- [x] Aba "todos": barras horizontais por candidato (cor própria, % média, nº de pesquisas,
      marca "● disputa principal" nos 2 primeiros), bn médio, nota sobre nomes ≤1% (Hertz Dias,
      Rui C. Pimenta, Edmilson Costa, Heró Bezerra), tabela candidato × 7 pesquisas recentes ×
      média, texto "Por que o painel modela só o confronto líder" (gap3).

### 3.4 Cartões 1ºT / 2ºT

- [x] 1ºT: médias estimuladas L×F, três tendências pareadas (Lula/Flávio/Margem com ▲▼▬ e nº de
      pares), válidos de Lula, mini-cartões "definição no 1ºT hoje/04-10", chance de Flávio no 1ºT.
- [x] 2ºT: médias L×F, margem + válidos, tendências, "N de M pesquisas recentes apontam empate
      técnico; a Gerp chega a mostrar Flávio à frente", dispersão ±sdEntre, mini-cartões "vitória
      de Lula no 2ºT hoje/25-10", faixa 80% da margem.

### 3.5 Gráficos

- [x] Evolução: ComposedChart com toggle 1ºT/2ºT, linhas de média ponderada + scatter por
      pesquisa, tooltip customizado (instituto, campo, valores), domínio Y [30,55]/[20,50],
      nota sobre série mais curta no 1ºT.
- [x] Distribuição da margem: AreaChart com áreas vermelha (x>0) e azul (x≤0), linha de
      referência em 0, legenda "espaço de virada".

### 3.6 Contexto social

- [x] 5 cartões de CONTEXTO (titulo, dado em mono, leitura, link fonte) + 6º cartão
      "Síntese do contexto" em tela verde.

### 3.7 Parâmetros do modelo

- [x] 4 sliders (Deslizador): meia-vida 7–45 passo 1; erro sistemático 0–6 passo 0,5; deriva
      0,1–0,7 passo 0,05; viés −3–+10 passo 0,1 — cada um com valor formatado e dica completa
      (textos preservados).
- [x] Caixa de fórmulas: margem bruta − viés = efetiva; √(seAgora² + sigmaSys²) = ±hoje;
      √(hoje² + deriva²) = ±dia.
- [x] Botão "↺ Restaurar parâmetros padrão (…)" / "✓ Parâmetros no padrão" (desabilitado no padrão).
- [x] **[MUDA: estado dos parâmetros serializado na URL `?vies=…&sys=…` — links compartilháveis]**

### 3.8 Histórico de erros

- [x] Tabela dos 5 pleitos (urna × véspera × erro).
- [x] Cartões "Por que pode se repetir" (âmbar) / "Por que pode ser menor" (verde).
- [x] Bloco "Por que o erro do 1º turno importa AGORA" (2 parágrafos completos, incl. crenças →
      números: σ≈3 → ~86% · σ=4 → ~83% · σ≈6 → ~79%).
- [x] Curva de sensibilidade: linhas L/F por viés −3..+10, ReferenceLine em 50%, linhas dos 3
      cenários rotuladas, ponto de virada em x=margem, linha "◆ atual", CLIQUE aplica o viés.
- [x] 3 cartões de cenário clicáveis (aria-pressed, borda ativa, placar recalculado por calcVies).
- [x] Legenda: ponto preto = virada; explicação do cruzamento em 50%.
- [x] Replay 2022 (tela verde): 3 cartões — 1ºT com erro aplicado (placar, badge "vai a 2ºT: N%",
      pLider1), 2ºT com erro aplicado (placar, badge "Lula vence: N%"), estimativa condicional
      (elRepD, decomposição direto+2ºT, elRepH, botão "aplicar réplica (viés +3,1) ao painel").
- [x] Parágrafo de calibração completo (margens +7,1 a +14 média +11,6 × +5,2 real; +0,8 a +8
      média +4,9 × +1,8; por que não se somam; diferença p/ pPainel).
- [x] `<details>` Fontes do histórico de erros (6 links).

### 3.9 Cenário-base

- [x] Título dinâmico (reeleição/vitória, margem apertada/moderada, probabilidade combinada).
- [x] 3 cartões da linha do tempo: 04/10 (P ir a 2ºT, Lula em 1º), 25/10 (P vitória na decisão,
      decomposição combinada), placar central projetado (placarL, faixa 80%).
- [x] Barra de bandas de margem com banda modal "● mais provável" e legenda.
- [x] Texto "Por que este é o cenário-base" (4 razões + o que derrubaria o cenário).
- [x] `<details>` "Metodologia desta seção" (caminho modal da árvore).
- [x] Nota de rodapé: "1 vez a cada N eleições parecidas".

### 3.10 Tabela de pesquisas

- [x] Colunas: Instituto (link p/ fonte, badges "(usuário)"/"(auto — confira a fonte)"), Campo
      (dd/mm–dd/mm), n (pt-BR), ±MoE, 1ºT L×F, 2ºT L×F, chip Leitura 2ºT (empate técnico /
      Lula à frente / Flávio à frente), Peso, Registro TSE, botão × remover (aria-label).
- [x] Linhas com w<0,15 esmaecidas; ordem da mais recente para a mais antiga.
- [x] Botão "+ Adicionar nova pesquisa" com formulário (instituto*, data final*, n, moe, tse,
      l2*, f2*, l1, f1, bnns1; vírgula decimal aceita) **[MUDA R5: vira MODO SIMULAÇÃO local,
      rotulado "simulação — não altera a base oficial"; inclusão real só no /admin]**.
- [x] Botão "↺ Restaurar dados oficiais" (também na tela de fallback quando a série esvazia).
- [x] **[MUDA R4/md: abaixo de md a tabela vira cartões empilhados]**

### 3.11 Metodologia (vira página /metodologia — conteúdo preservado)

- [x] `<details>`: Média, pesos e as duas probabilidades · Como a tendência é calculada ·
      Classificação dos cenários (50–60/60–75/75–90/90+) · Limitações que você deve conhecer ·
      Botão «Atualizar agora» e o viés histórico **[MUDA: texto adaptado ao fluxo com aprovação]** ·
      Fontes da série (13 links com campo e TSE).

### 3.12 Rodapé

- [x] Aviso legal completo (ferramenta estatística e educacional, sem vínculo…, datas das
      eleições) **[MUDA: ampliado; instrução "digite atualizar no chat" removida]**.

## 4. Comportamentos globais

- [x] Recharts com isAnimationActive={false} nos gráficos; tooltips custom em mono.
- [x] Focus-visible com outline verde em inputs/botões/links.
- [x] Fontes Archivo (400/600/700/900) e IBM Plex Mono (400/500/600) **[MUDA: self-host via
      next/font]**.
- [x] Todos os números em formato brasileiro (vírgula); datas dd/mm; timezone −03:00.
- [x] Estado vazio (0 pesquisas): tela com botão "↺ Restaurar dados oficiais".
- [x] Recálculo instantâneo no cliente ao mexer em sliders/simulação.

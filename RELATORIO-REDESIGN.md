# RELATÓRIO DO REDESIGN — v1 "boletim de urna" → v2 PONTEIRO

Transformação completa de identidade, interface e linguagem executada na branch `redesign/v2`
(v1 preservada na tag `v1-urna`). Protocolo: orquestrador (Fable 5) + 7 especialistas (Opus),
fases 0 → [1‖2] → 3 → [4‖5] → 6 → 7 (loop) → 8. **Sem fallback do Higgsfield** — o MCP estava
autenticado e a marca saiu dele.

## O nome: PONTEIRO

Escolhido entre 5 finalistas verificados na web (colisões com institutos/órgãos/mídia
descartadas por busca real). Triplo significado nativo: "ponteiro da tabela" (líder, vocabulário
popular do futebol), agulha do medidor (instrumento), ponteiro do relógio (o tempo até 04/10).
Tagline: **"Para onde apontam as pesquisas."** Domínios livres na checagem (RDAP):
oponteiro.com.br e ponteiro.org.br. Descartados: Pêndulo (SEO dominado por esoterismo), Palmo
(mudo sem tagline), Páreo (vizinhança de apostas), Em Miúdos (não vira marca). Salvaguarda
registrada: a agulha é marca ESTÁTICA — jamais um "needle" animado de probabilidade (o
contraexemplo do NYT 2016 governa).

## O conceito visual: B·ENXAME (e os 2 descartados)

Três conceitos divergentes foram MATERIALIZADOS em style tiles reais com números do modelo
(`/design-lab`, prints em `.qa/design-lab/` local):

- **A·LATÃO** (régua de instrumento, Bricolage/Public Sans, ocre) — descartado: os 100 traços
  da régua somem a 390px; a assinatura não sobrevive à tela barata.
- **B·ENXAME** (quantile dotplot de 100 bolinhas, Instrument Serif + Lexend, identidade ameixa)
  — **vencedor** pelos 4 critérios de peso igual: o mais bonito/moderno, a metáfora mais
  intuitiva ("cada bolinha é uma eleição possível"), neutralidade por POSIÇÃO (não cor),
  fraquezas corrigíveis (viraram requisitos: manchete = número de SER ELEITO com reconciliação
  assinada; bolinhas ≥8px).
- **C·CHUMBO** (grade 10×10 acromática, Schibsted/Atkinson) — descartado: o melhor em 5
  segundos, mas frio e com o campo vermelho gigante gritando. Seu gráfico "cada pesquisa contra
  a linha do empate" foi ABSORVIDO adaptado (barra monocromática lilás) — o empate técnico
  passou a ser visto, não lido.

Sistema tokenizado do zero (101 tokens, 47 pares de contraste calculados, motion com
`prefers-reduced-motion`); paleta ameixa como cor terceira de marca; carmim/naval recalibrados
exclusivos dos candidatos; "dúvida = lilás" em todo o produto.

## A marca

Símbolo gerado no Higgsfield (4 variantes em 1 chamada; escolhido S0 — agulha rompendo o anel;
S2 descartado por ser um velocímetro literal) → remove_background → upscale 2K → o design-lead
reconstruiu o mestre em VETOR analítico ajustado por mínimos quadrados (RMS 0,34px, IoU 0,970)
— a família inteira (horizontal, empilhada, monocromáticas, wordmark em paths) sai de uma
verdade vetorial de 457 bytes. Ícones como variante ótica (não redução). OG base. 4 ilustrações
SVG no idioma do enxame. Total Higgsfield: 7 operações (teto era ~10).

## A linguagem

`docs/VOZ.md` + `docs/COPY-DECK.md` com 372 chaves cobrindo 100% do inventário — títulos são as
perguntas do usuário; número nunca sozinho ("83 em 100" junto de "83%"); glossário tocável;
palavras banidas com substitutas ("folga da medida" para margem de erro, "puxada" para viés).
**Toda frase passou pelo veto do data-scientist com o modelo RODADO**: 25 vetos + 43 emendas na
1ª auditoria (probabilidade condicional tratada como absoluta era o padrão; o fator 2× do
empate técnico tinha se perdido; a reconciliação 83↔82 estava falsa para um dos lados), mais 3
vetos + 4 emendas na 2ª ("décimo em décimo" era falso contra a própria série; o exemplo dos
5.000 colidia com a AtlasIntel da mesma página). 3 testes anti-deriva fazem o fallback
silencioso das camadas de tradução virar vermelho.

## A reconstrução (Fase 6)

79 arquivos: tokens v1 deletados, camada de apresentação inteira reescrita mobile-first sob o
ENXAME, `motion` como única lib nova, enxame de 100 em SVG autoral NO HTML DO SERVIDOR (aparece
sem JavaScript), cartões-conversa (pergunta → resposta que conclui → Traduzindo), rename
completo para PONTEIRO. Paridade funcional 100% com o inventário; golden tests intocados.

## O loop (Fase 7) — 8 iterações, terminou NO LIMITE, e a história é esta

| Iter | Placar            | Nota                                                                                                                                                                                                                                            |
| ---- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 2 B · 12 M · 13 m | Anti-regressão PASSOU (zero pixel da v1); teste do leigo 1/4 — a dobra dava o placar sem a dúvida                                                                                                                                               |
| 2    | 0 · 4 · 8         | Leigo 3/4; cores de candidatos e contexto ganharam camadas de apresentação                                                                                                                                                                      |
| 3    | 0 · 0 · 1         | Leigo 4/4; altura da home aceita por arbitragem escrita                                                                                                                                                                                         |
| 4    | 0 · 0 · 0         | 1ª limpa — mas um defeito existia sem foto                                                                                                                                                                                                      |
| 5    | 0 · 0 · 1         | A evidência nova (pedida pelo próprio crítico) achou máscara de data truncada; contador voltou a 0                                                                                                                                              |
| 6    | 0 · 1 · 1         | Cobertura cresceu de novo → popover estourava 101px a 768 (defeito antigo)                                                                                                                                                                      |
| 7    | 0 · 1 · 2         | O conserto prescrito na 6 era um NO-OP SEMÂNTICO (transform:none ≡ translateY(0) no quadro final) — o próprio crítico provou o erro da própria prescrição; o teste de TOQUE achou a pior manifestação: a definição fechava na mão de quem a lia |
| 8    | 0 · 1 · 1         | LIMITE. O crítico recusou assinar "é bonito" com o gesto-assinatura quebrado — e recusou também o próprio atalho que havia prometido                                                                                                            |

**Contador de iterações limpas consecutivas: terminou em ZERO.** O critério (b) da parada nunca
foi cumprido. Aprendizado de método, nas palavras do crítico: "o defeito sobreviveu seis
iterações porque a evidência era volumosa em vez de dirigida — e a pior manifestação não estava
em print nenhum, apareceu quando testei o toque".

## Pós-loop (Fase 8, hardening declarado — não é iteração)

- **Portal do glossário** (o conserto-raiz que o crítico recomendou): mata as 3 manifestações
  do MAJOR. Verificado por gesto real nos 3 viewports + 3 testes e2e novos (63 no total),
  incluindo o teste do toque como trava de regressão.
- Nome acessível DERIVADO do rótulo visível (WCAG 2.5.3 virou invariante de API); `wcag21a` no
  gate do axe.
- O mistério dos flakes resolvido: servidores `next start` ZUMBIS serviam build velho — o
  capturador agora RECUSA porta ocupada e SAI COM ERRO quando falta print (evidência ausente
  não parece mais evidência limpa).

## O veredito a quatro mãos (pós-loop, sobre `.qa/iter-v2-final/`)

**qa-critic — ASSINOU** (adendo em `.qa/iter-v2-8/critica.md`), após verificar a procedência
pelo BUILD_ID e reproduzir os gestos ao vivo no build exato:

- **"É outro produto"**: interseção de paleta VAZIA nas 7 cores dominantes da dobra; nenhum
  caractere monoespaçado onde a v1 era mono em tudo; a v1 nem marca tinha.
- **"É bonito"**: um elemento domina a dobra (contra cinco gritando na v1); a incerteza que a
  v1 imprimia como parêntese a v2 DESENHA; folha nativa com véu que sobrevive ao toque.
- **"Um leigo entende"**: as 4 perguntas da rubrica respondidas só com a dobra de 390; o
  percentual rebaixado a linha secundária; a linguagem simples vale até para leitor de tela.
- Delimitação explícita: **assina o produto, não o processo** — o loop terminou em zero
  leituras limpas e o MAJOR atravessou oito iterações, uma delas por prescrição errada dele
  mesmo. E fechou com a declaração anti-desperdício: "não consigo mais apontar melhoria que um
  usuário real perceberia nesta pasta".

**design-lead — ASSINOU** (`.qa/iter-v2-final/veredito-design-lead.md`), com evidências
independentes (travessia de borda sem filete; enxame batendo com a aritmética do spec ao pixel;
neutralidade do placar confirmada por medição) e um "parágrafo franco" que fica registrado: o
1440 não tem composição própria (é a coluna de 390 esticada — limite do briefing que ele mesmo
assinou, não da execução), o mobiliário do gráfico não escala com a marca no desktop, e §8.3
não é obedecido ao pé da letra na ordem líder/liderado. "Sem essas duas coisas, ainda é a
melhor peça de visualização editorial que já saiu deste repositório, por larga margem."

Síntese das duas metades: **docs/VEREDITO-V2.md**.

## Gates finais

142 unit (inclusive TODOS os golden — paridade numérica intacta de ponta a ponta) · 63 e2e com
console limpo · axe zero serious/critical (wcag2a/2aa/**21a**/21aa/22aa) · Lighthouse mobile
92–97/100/100/100 (variância provada como ruído de máquina com baseline) · CLS 0 · 60fps provado
por trace CDP (maior tarefa 13,76ms; zero quadros perdidos por trabalho da página).

## Pendências honestas

1. **LCP 3,3s simulado** (piso 90 de performance cumprido com folga; o elemento é a micro-legenda
   do enxame). Alavanca conhecida: subset/preload mais agressivo das serifas.
2. O travessão do wordmark no logo dispara `label-content-name-mismatch` no Lighthouse (peso 0;
   o axe não fila; decisão de marca).
3. Os 3 prints `home-*-popover` duplicam `chip-chance` (o 1º chip É o chance); trocar o
   genérico pelo pior-caso por viewport é melhoria de ferramenta, não de produto.
4. O viewport 390 não está no laço do Playwright e2e (projeto único 1280); o toque a 390 foi
   verificado manualmente e por captura — mover para o laço é hardening de CI futuro.
5. `.qa/design-lab/` (style tiles da decisão) permanece apenas local.
6. Do parágrafo franco do design-lead (limites do briefing, não da execução): o 1440 merece uma
   composição própria de desktop (hoje é a coluna de 390 esticada) e o mobiliário do gráfico
   (rótulos/régua) deveria escalar com a bolinha — ambos são as issues de design de v2.1.

## Ações que sobram para o humano

1. **Registrar o domínio** (oponteiro.com.br / ponteiro.org.br estavam livres na checagem).
2. Fazer o push da `main` + tag `v1-urna` para o remoto (o merge local está feito).
3. Se quiser o OG dinâmico com revalidação ao vivo e o 390 no laço do e2e: são as duas
   primeiras issues de v2.1 sugeridas.

## Custo de geração (Higgsfield)

7 operações na v2 (4 variantes de símbolo + 2 remove_bg + 1 upscale) + 1 tentativa falha na v1
(filtro). Créditos restantes na conta: consultáveis via `balance`; nenhuma geração desperdiçada
em loop.

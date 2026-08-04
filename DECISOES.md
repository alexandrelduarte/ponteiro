# DECISÕES

Registro de decisões ambíguas (R6): contexto → decisão → porquê. Uma linha por decisão.

- Scaffold em diretório não-vazio → `create-next-app` rodou em pasta temporária e o resultado
  foi movido para a raiz (excluindo stubs de README/CLAUDE/AGENTS) → o CLI recusa diretórios com
  arquivos; o protótipo .jsx precisa permanecer na raiz como fonte da verdade.
- R8 cita `src/data/seed.json` → o seed local canônico são os arquivos
  `src/data/pesquisas.seed.json` + `institutos.seed.json` (nomes da Fase 0.2, mais específicos)
  → evita duplicar a mesma informação em dois arquivos; `dados.ts` importa direto deles.
- Protótipo lista "Aécio Neves 2%" em `outros1` da Quaest-jun, mas Aécio não está em
  `CANDIDATOS` → preservado exatamente como está (o ranking "todos os candidatos" só consulta
  nomes de CANDIDATOS, como no protótipo) → fidelidade ao comportamento original; não é bug do
  modelo, é dado bruto além do ranking.
- `server-only` instalado como dependência de runtime (não dev) → o pacote é importado por
  módulos bundlados em produção; em devDependencies quebraria `pnpm install --prod`.
- Prototipo usa `.jsx` com fontes via Google CSS import → produção usa `next/font` self-host
  (exigência da Fase 1; sem request a terceiros em runtime).

## Janela paralela (Fases 1 ‖ 2 ‖ 3)

### Fase 3 — modelo (data-scientist)

- Derivados eram closures sobre `M`/`params` no protótipo → API pura mínima (`calcVies(m, vies)`,
  `calcCenarioBase(m, vies)`, `calcCampoCompleto(pesquisas, meiaVida, hojeMs)`…) com gabarito
  verbatim ligado pelos golden tests → paridade numérica sem carregar React.
- `tests/reference/original.mjs` gerado por script a partir das linhas exatas do `.jsx` → elimina
  erro de transcrição no gabarito.
- Tolerância dos golden tests: 1e-9 absoluta OU relativa → timestamps ~1,8e12 ms tornam 1e-9
  absoluto menor que o ULP do double.
- Esquisitices do protótipo PRESERVADAS (paridade manda), documentadas para a UI:
  (1) `tend1.m`/`tend2.m` fazem aritmética com `null` se um lado do 1ºT faltar — inalcançável em
  produção porque `dados.ts` só constrói `t1` com os DOIS valores presentes e o seed é completo;
  (2) séries podem ter ponto final duplicado (cosmético); (3) `fazSerie` usa a pesquisa de 2ºT
  mais antiga como t0 também para o 1ºT; (4) `fmtSinal(null)`→"+0,0", `pct(NaN)`→"NaN%" — a UI
  nunca deve passar valor possivelmente nulo a `fmtSinal`/`pct`; (5) `normCdf` descontínua em
  z=0 por ~3e-7 (aproximação A&S); (6) `calcVies` parte da margem BRUTA por desenho (curva de
  sensibilidade absoluta).

### Fase 1 — design (design-lead; detalhes e números em docs/DESIGN.md)

- `#C4122F`/`#16418C` não têm peso perceptual equivalente → cores-base viram _marca_
  (barras/linhas), e o par derivado `lula-escuro #B30026`/`flavio-escuro #2A55A2` (contraste
  5,79×5,84 sobre papel) é usado para todo glifo colorido → R4 mensurável sem tocar nos dados.
- `#D96A1B`/`#1E7A46` falham AA como texto → tokens `alerta-texto #8A4510` e
  `confirma-texto #155A34`; originais só como preenchimento/borda.
- Bandas de margem ganham espelhos azuis (`#648FE7`, `#9EBAEE`) no mesmo L/croma → simetria se o
  líder virar (R4); rótulo dentro da banda comuta tinta/papel conforme a clareza da banda.
- Nome de candidato sempre em tinta (cor só na barra com contorno) → Zema #E8791D falhava até 3:1.
- "NÃO É PREVISÃO" deixa de sumir em 390px → disclaimer central não pode ser responsivo-opcional.
- Piso tipográfico 12px (ticks de gráfico sobem de 11px) · breakpoints em rem (40/48/71.25) ·
  `@theme static` (Recharts consome `var()` fora do scanner do Tailwind) · peso `w<0,15` ganha o
  texto "peso baixo" (opacidade não é canal acessível).

### Fase 2 — backend (backend-security)

- Chaves extras na resposta da IA são descartadas (não rejeitam o item) → nada fora do schema
  chega ao banco; sobrevive só no `bruto` forense.
- Números como string ("2000", "2,19") aceitos apenas se casarem `^-?\d+(\.\d+)?$` → robustez sem
  abrir notação exótica.
- Byte NUL (U+0000) removido antes do `jsonb` → nega DoS barato (NUL derruba INSERT jsonb).
- `outros1`/`id_prototipo` do `bruto` só são lidos de `origem in ('seed','admin')` → IA não
  escolhe chave de React nem conteúdo do ranking.
- `amostra`/`moe` nulos → padrões do próprio modelo (1000/2) na reconstrução → no-op numérico.
- Inclusão manual do admin: regra "fim ≥ última da série" relaxada (ato consciente auditado);
  `fonte` obrigatória (R4). Cooldown de 60 s no gatilho manual; cron com guarda 409.
- `web_search_20250305` mantido (compatível com qualquer `ANTHROPIC_MODEL`).

### Integração (orquestrador)

- Achado de segurança da Fase 2: policy literal `audit_transparencia` expunha o e-mail do admin
  (`ator`) à anon key → migração `0003_audit_publico.sql` remove a policy e cria a view
  `audit_publico` sem `ator`; `getFeedTransparencia` lê a view; testes de RLS atualizados →
  o schema da Seção 8 era literal, mas A7 (sequestro/exposição de admin) manda; corrigido em
  migração posterior, jamais silenciosamente.
- Recomendação do estatístico (rejeitar t1 parcial no updater) não exigiu mudança: `dados.ts` já
  só constrói `t1` com ambos os lados presentes — bug inalcançável; registrado aqui como prova.

## Fase 4 — frontend (frontend-dev)

- Linhas com peso `w<0,15`: a opacidade 55% do protótipo derrubava o contraste a ~4,2:1 (axe
  reprovava 35 nós) → sinalização por fundo `mini` + texto "peso baixo", sem opacidade → o
  objetivo de §7.5 (dois canais de sinal) fica atendido sem violar o piso AA de §9/§11.
- OG image: `fetch(new URL(...))` de asset local falha sob Turbopack → `force-static` lendo os
  .ttf do disco no prerender (Archivo 900 + Plex Mono 600 versionadas em `src/app/_og/fontes/`,
  245 KB) → zero request externo em runtime; tradeoff: o OG congela até o próximo build/deploy
  (a probabilidade se move ~1 p.p. por rodada — aceitável; revalidação ao vivo fica como v2 com
  `outputFileTracingIncludes`).
- Sem barra de navegação no topo → links para /historico e /metodologia no rodapé e no corpo →
  a dobra de 390px do DESIGN §6.3 tem orçamento vertical fixo; a manchete não desce.
- `enviarMagicLink` só envia para e-mails de `ADMIN_EMAILS` com resposta idêntica para qualquer
  entrada → o form de login não vira oráculo de quem é admin nem porta de signup.
- Estado do leitor (sliders/simulação) num `PainelProvider` client que NASCE com a base oficial
  e params padrão; `hojeMs` calculado uma vez no servidor e passado por prop; URL aplicada
  pós-montagem via Suspense → manchete no HTML estático (provado com e2e sem JS) e zero
  mismatch de hidratação.
- Confirmações do /admin em 2 passos inline (não `window.confirm`) → estilizável, testável,
  não some no mobile.
- JSON-LD é o único `dangerouslySetInnerHTML` do produto (conteúdo 100% gerado por nós,
  `<` escapado) → o React escaparia aspas do JSON em filhos de `<script>`.

## Fase 5 — assets (orquestrador)

- Higgsfield disponível: tentada 1 geração da textura de papel (2 créditos) → filtro de conteúdo
  do serviço reprovou com falso positivo (estado terminal `nsfw`) em textura abstrata → fallback
  previsto no plano: SVG puro com `feTurbulence` (mais leve, determinístico, sem custo) — sem
  segunda tentativa (anti-desperdício R7).
- Marca/favicon: desenhada em SVG geométrico (cursor ▊ + "26" em dígitos pixel estilo urna
  eletrônica) em vez de gerada por IA → modelos de imagem deformam glifos; geometria pura é
  nítida em 16px e não depende de fonte; rasterizações (apple-icon 180px, favicon 32px) feitas
  com o Chromium do Playwright já instalado.

## Fase 6 — loop de qualidade (iteração 1: 2 BLOCKER · 7 MAJOR · 15 MINOR · 5 NIT)

- Gráficos vazios nos prints e LCP simulado 4,8s tinham a mesma origem (montagem/peso do
  Recharts) → gate de viewport via IntersectionObserver nos 4 gráficos + script de screenshots
  rola a página antes do fullPage e espera os `<path>` do SVG → perf mobile 82→94 e prints
  auditáveis.
- Série a 768px: mesmo com colunas corrigidas a tabela pede 808px → rolagem DENTRO do wrapper
  com afordância de sombra/tampão (`.rolagem-x`, background-attachment local/scroll) → é o
  padrão prescrito pelo DESIGN §7.5; encolher a 12px violaria o piso tipográfico §4.2. A causa
  do estouro da PÁGINA era um `sr-only` com position:absolute escapando de wrapper não
  posicionado (canvas 858px) — corrigida com `relative`.
- Thumb dos sliders media 19–20px apesar dos 24px declarados → o UA desconta a `border` do
  diâmetro → anel por `box-shadow` de blur zero (pintado fora da caixa) + `border: 0` →
  `--spacing-thumb` volta a ser o diâmetro visível literal (medido 24,0px em Chromium/Firefox).
- Alfa necessário na sombra de rolagem sem token novo → `color-mix(in srgb,
var(--color-linha-forte) 55%, transparent)` → mantém "zero hex em componente".
- Etiquetas de cartão carregavam frases inteiras em caixa alta → prop `Cartao.descricao`
  (texto em caixa normal abaixo da etiqueta; `aria-labelledby` continua na etiqueta curta).
- "0%" absoluto em prosa → helper de UI `pctComPiso` ("<1%"/">99%") APENAS na prosa; `pct` do
  modelo intocado (paridade) e manchete da urna continua com `pct` puro.
- Números recalculáveis em prosa (92%, 17%, "1 vez a cada 6") → todos em IBM Plex Mono
  (direção do DESIGN §4.1); números fixos editoriais (erros de 2022, datas) ficam em Archivo.

## Fase 6 — loop de qualidade (iteração 2: 0 BLOCKER · 4 MAJOR · 4 MINOR · 3 NIT)

- Institutos fatiados em 7 chars vinham do `.slice(0,7)` do protótipo → abreviações intencionais
  ("PoderD.", "Atlas", "Datafol.") abaixo de md e nome completo em md+ → a UI é livre (§2.4);
  fatiar no meio mutila a procedência (P9). "Genial/Quaest" sai inteiro em md+ (não
  `split("/")[0]` = "GENIAL"): Quaest é o instituto de campo, Genial o contratante — a coluna não
  pode nomear duas casas diferentes conforme o viewport.
- Anotações da curva de sensibilidade colidiam a 390 → escalonamento em 2 fileiras com os textos
  INTEIROS (não encurtamento): medido que, em mono, mesmo rótulos curtos ainda colidiriam −8px.
- Rótulos de anotação de gráfico ganham halo `paint-order: stroke` na cor do cartão → linhas não
  atravessam glifos; anotação de gráfico é dado → mono (§4.1).
- Tabela da série entre md e lg: colunas `n` e `±MoE` ocultas (continuam nos cartões <md e em
  lg+) → o registro TSE inteiro fica visível sem gesto a 768 (antes: cortado em todas as linhas).
- Verificação adversarial de mão dupla: o corretor provou por CDP (fonte rasterizada) que 4
  subpontos da crítica de mono/Archivo estavam errados (mini-cartões, contadores e 92%/8% já eram
  mono); os pontos verdadeiros (83%, anotações, 25/10) foram corrigidos.

## Fase 7 — hardening (backend-security + integração)

- CSP com nonce descartada → as páginas são ISR atrás do CDN (nonce único iria a milhares de
  leitores; dinamizar mataria o cache, que é a mitigação de A5) → CSP estática: `script-src
'self' 'unsafe-inline'` (payload RSC inline muda a cada revalidação — hash inviável), SEM
  `unsafe-eval` em produção, `style-src 'unsafe-inline'` (inline styles do React/Recharts;
  `style-src-elem` descartado empiricamente — 404/global-error do Next embutem `<style>` e o
  suporte não é uniforme), `frame-ancestors 'none'` + `X-Frame-Options DENY`, connect-src
  derivado de `NEXT_PUBLIC_SUPABASE_URL` no build.
- `pnpm audit`: 5 vulns transitivas (4× postcss 8.4.31 pinado pelo Next — exigem CSS controlado
  pelo atacante, inexistente; 1× sharp opcional — next/image não é usado) → SEM overrides →
  forçar versões não declaradas pelo Next trocaria risco inalcançável por risco real de quebra;
  gatilho de reavaliação documentado em SECURITY.md.
- CI sem passo de `pnpm audit` (reprovaria por falhas inalcançáveis; Dependabot cobre) e COM
  grep de segredo em `.next/static/` como gate → serve o R1 diretamente.
- Rota do cron exportava só POST → renomeada para GET (405 nos demais verbos) → o Vercel Cron
  invoca por GET; com POST o updater diário nunca dispararia em produção.
- Probe JIT do Zod 4 (`Function("")`) violava a CSP no cliente → `z.config({ jitless: true })`
  no único módulo cliente que importa Zod → validação idêntica, violação 1→0 (provado).
- Custo do cron corrigido no README: ~US$ 5–20/mês (não "centavos") → o que domina são os
  tokens das páginas re-cobrados na resposta com web_search, não a taxa de busca; botões para
  reduzir documentados (`max_uses`, versão 2026-02 da tool).

# REDESIGN v2 (branch redesign/v2; v1 preservada na tag v1-urna)

## Fases 1–2 — pesquisa e naming

- Nome escolhido pelo orquestrador entre 5 finalistas verificados: **PONTEIRO** → triplo
  significado nativo ("ponteiro da tabela" = líder no vocabulário popular do futebol; agulha de
  medidor = instrumento; ponteiro de relógio = tempo até a eleição), 3 sílabas, teste do rádio
  perfeito, neutro, oponteiro.com.br/ponteiro.org.br livres (RDAP) → descartados: Pêndulo (SEO
  dominado por esoterismo), Palmo (mudo sem tagline), Páreo (bairro das apostas), Em Miúdos
  (não vira marca). Tagline: "Para onde apontam as pesquisas."
- Salvaguarda anti-needle: a agulha do PONTEIRO é MARCA estática (logo/ícone) — proibido virar
  medidor animado de probabilidade no hero → o "needle" do NYT 2016 é o contraexemplo canônico
  (TENDENCIAS-2026 P1); o hero comunica probabilidade pelo campo contável de 100 unidades
  (quantile dotplot, melhor evidência para baixa numeracia).

## Fase 3 — direção visual

- Três conceitos materializados em style tiles reais (/design-lab) com números do modelo:
  A·LATÃO (régua de instrumento), B·ENXAME (quantile dotplot, serifa display + violeta),
  C·CHUMBO (grade 10×10 acromática) → vencedor **B·ENXAME** pelos 4 critérios de peso igual →
  o mais bonito/moderno com folga, metáfora mais intuitiva ("cada bolinha é uma eleição
  possível"), neutralidade por POSIÇÃO (não cor); fraquezas corrigíveis viram requisitos:
  (1) manchete usa o número de SER ELEITO (83/17) e o enxame vira visual da diferença do 2ºT
  com micro-legenda (veto do data-scientist pendente na Fase 5/6); (2) bolinhas ≥8px a 390.
  Descartes: A falha na própria assinatura a 390; C é frio e o campo vermelho grita.
- Integração sem quebrar a v1 durante a transição: o design-lead escreve `tokens-v2.css` como
  arquivo NOVO; a Fase 6 troca o tokens.css e deleta os tokens v1 → todo commit da branch
  permanece com gates verdes (a regra "reescrever do zero" se cumpre na troca, não na criação).
- Tokenização do ENXAME (detalhes em docs/DESIGN-V2.md §10–11): gráfico do conceito C adotado
  ADAPTADO (barra monocromática lilás — isocromia dos fundos de candidato exigida por R4
  tornaria a divisão bicolor invisível; a régua de tinta mostra o cruzamento) → "dúvida =
  lilás" vale no produto inteiro e fecha as 3 escalas de P12; domínio do enxame passa a ser
  derivado dos 100 quantis (piso de 8px vira consequência, não constante); faixa de incerteza
  com borda obrigatória (1.4.11 sem escurecer o campo); sem verde-sucesso/vermelho-perigo em
  lugar nenhum (inclusive /admin) — só âmbar e ameixa; sombra proibida em bloco parado; mono
  NÃO volta nem para dados (tabular-nums da própria Lexend); reduced-motion zera
  duração/deslocamento/stagger mas nunca `transform` (também posiciona); stagger por coluna
  (o bin é o acúmulo), teto 260ms.
- Fase 4 executada pelo orquestrador no MCP (sessão autenticada): 4 variantes de símbolo em 1
  chamada → escolhido S0 (agulha rompendo o anel — relógio+medidor sem virar velocímetro;
  S2 descartado por ser um velocímetro literal) → remove_background → upscale 2K → novo
  remove_background (o upscaler achata alfa) → PNG 2160² RGBA. 7 operações no total,
  abaixo do teto de ~10.

## Fase 4 — composição da marca (design-lead; detalhes em docs/MARCA.md §6)

- O mestre da marca virou VETOR: geometria ajustada por mínimos quadrados sobre o raster do
  Higgsfield (RMS 0,34px, IoU 0,970) → nítido em qualquer tamanho, 457 B vs 1,1 MB, família
  inteira sai de uma verdade só; fidelidade medida, não opinada.
- Ícone do app é variante ÓTICA (anel mais grosso, vão maior, sem vazado) — reduzir o mestre a
  16px fecharia o vazado; wordmark em paths extraídos do TTF (opentype.js só no scratchpad;
  serializador reescrito à mão por bug do toPathData) → SVG autossuficiente, zero dependência
  de fonte instalada.
- PNGs recomprimidos por otimizador próprio sobre node:zlib (sips PIORAVA; zopfli/pngquant não
  existem na máquina e dependência nova violaria R7): símbolo 2K 118→42 KB, OG 50→36,5 KB, sem
  perder um pixel (identidade dos dados crus conferida).
- PNG bruto de procedência (1,1 MB) movido pelo orquestrador de public/ para
  docs/marca-origem/ → não é referenciado por nenhuma superfície; em public/ iria ao CDN.

## Fase 7 — loop v2 (iteração 1: 2 BLOCKER · 12 MAJOR · 13 MINOR · 6 NIT; anti-regressão PASSOU

com zero pixel da v1; teste do leigo 1/4 na dobra)

- Cores de candidatos e traduções do histórico vivem na APRESENTAÇÃO (`cores-candidatos.ts`,
  `copia-erros.ts`, keyed pelo dado, com fallback ao original) → `src/data/**` é intocável pela
  paridade golden (campoCompleto carrega `cor`); rampa neutra de 7 degraus OKLCH com pior par
  3,13:1 e ΔEok mínimo 0,0596 entre cores e 0,0556 contra a marca.
- "Colisão de cor" definida como ΔE em OKLab, não razão de contraste → com luminância pura, 7
  neutros ≥3:1 contra o nicho seriam matematicamente impossíveis (demonstrado no comentário).
- Simulação: estados excludentes com condição DUPLA (réguas padrão E série oficial) e legenda
  do mini-enxame com o número do DESENHO (redações assinadas, AUDITORIA §10); fechos
  condicionais do hero APOSENTADOS (duas fontes para o mesmo fato foi como o 83↔82 nasceu).
- Legenda do hero: 55 palavras com DUAS marcas de dúvida — a dobra de 390 sempre carrega dúvida
  (medido: "ainda pode mudar" em y 647–693; e2e trava por varredura de texto até y=844).
- Barras dos 9 candidatos: régua FIXA 0–50% rotulada (normalizar pelo líder é a barra 83/17
  pela porta dos fundos); e2e trava razão <0,95 do trilho.
- Breakpoint das tabelas subiu para lg (série e erros) → única saída que mantém o registro TSE
  legível sem gesto a 768; cartões em 2 colunas na faixa md.
- Altura da home: −35,6% a 390 (27.841→17.936px) por DEDUPLICAÇÃO + disclosure (nada saiu do
  produto; 8 pesquisas antigas e aprofundamentos a um toque).
- Motion auditável: evidências gravadas em .qa/motion-evidencias/ (frames da queda via
  Animation.setPlaybackRate no CDP, reduced-motion com medições, rastro de slider,
  pulso da celebração medido em px).

## Fase 7 — loop v2 (iteração 2: 0 BLOCKER · 4 MAJOR · 8 MINOR · 5 NIT; leigo 3/4)

- Cartões de CONTEXTO traduzidos em camada de apresentação (`copia-contexto.ts`, fallback ao
  original) → mesmo precedente de cores/erros; o × ambíguo de aprova×desaprova virou texto.
- Aviso legal: UMA fonte por página (bloco jurídico íntegro liderado por "Isto não é previsão.");
  `rodape.simples.p1..p4` descontinuadas no deck (§T atualizado pelo orquestrador) → a tela dizia
  o mesmo 3× e em /historico o rodapé era 43,5% da página.
- Meta de altura da home (≤20.000px) NÃO renegociada nem forçada: 23.276px aceitos pelo
  orquestrador → o que sobra é conteúdo, não repetição (medido bloco a bloco); esconder mais
  atrás de disclosure violaria a regra que o próprio crítico validou; o crítico arbitra na
  iteração 3.
- 60fps provado por trace CDP (maior tarefa 13,76ms; zero quadros perdidos por trabalho da
  página; "perdidos" do arraste são custo do robô de teste, testemunha rAF concorda).
- Enxame com API de escala (hero > media > mini por construção); hero voltou a ocupar a placa
  inteira (as 2 colunas de lg travavam a instância-manchete como a menor das três).

## Fase 6 — reescrita da camada de apresentação (frontend-dev)

### Fundação

- `tokens-v2.css` virou `tokens.css` e o arquivo v1 foi APAGADO (não adaptado); `globals.css`
  reescrito: body = bruma-ameixa + Lexend, grão de papel e CSS da tela da urna removidos,
  `public/grao-papel.svg` deletado. Deslizador e rolagem-x foram RETOKENIZADOS (ameixa/grade/
  placa/contorno), não reaproveitados.
- Fontes: `Instrument_Serif` (400) + `Lexend` (variável, sem `weight`: um arquivo cobre
  400/500/600/700). Archivo e IBM Plex Mono saíram do layout; os `.ttf` do OG foram trocados
  por InstrumentSerif-400/Lexend-400/Lexend-600.
- Token NOVO `--text-wordmark` (30→36px, MARCA §8.2): é o único corpo display abaixo de 32px
  que o sistema autoriza, porque é a marca, não texto.
- `pctComPiso` virou `emCem`/`parEmCem` em `ui/textos.ts`: a v2 publica FREQUÊNCIA ("83"),
  não percentual ("83%"), e o par sempre fecha 100 por complemento (COPY-DECK §A.3).

### Verificações de aceitação da Fase 6 (DESIGN-V2 §9.6)

- **`tnum` da Lexend: REPROVOU.** Medido no Chromium a 40px, com `.numeros` aplicada e a fonte
  carregada, os dez dígitos têm larguras diferentes (20,00 a 24,81px); forçar
  `font-feature-settings:"tnum"` inline dá o mesmo resultado — a Lexend não tem a tabela.
  Remédio prescrito pelo §3.2 aplicado: utilitário `coluna-numerica` (alinhamento à direita +
  largura reservada em `ch`) nas colunas numéricas das duas tabelas. `numeros` FICA (funciona no
  fallback de sistema e passa a valer sozinha se a Lexend publicar a feature); mono NÃO volta.
- **Bolinha a 390: APROVOU.** Medido no artefato de produção: 28 colunas de 1 ponto, 100
  bolinhas, diâmetro 9,36px, folga 2,0px (horizontal e vertical), pilha de 96,8px.
- **Teto de colunas é 31, não 33.** Com bolinha = `min(0,84 × passo, passo − 2)`, 33 colunas em
  318px dão 7,9px — abaixo do piso duro. 31 é o maior número que satisfaz os DOIS pisos
  (≥8px de bolinha E ≥2px de folga) ao mesmo tempo; acima disso a coluna dobra para 2 pontos.
- `probit` (inversa da normal, algoritmo de Acklam) vive na APRESENTAÇÃO
  (`enxame-nucleo.ts`), não no modelo: ela não altera número publicado nenhum, só decide onde
  cada bolinha cai. `src/lib/modelo/**` continua intocado.
- O enxame CONTA as próprias bolinhas e publica essa contagem; o escrito e o desenhado são o
  mesmo inteiro por construção (H3), em vez de dois arredondamentos independentes.

### Movimento — onde o despacho e o DESIGN-V2 §7.2 se cruzam

- **Count-up:** §7.2 proíbe ("número que sobe sugere tendência que o modelo não afirmou"), o
  despacho pede. Meio-termo implementado: `Contagem` NUNCA anima na primeira pintura — o número
  que aparece é o do servidor — e só conta quando MUDA por ação do leitor (régua, cenário).
  É feedback de interação, não espetáculo de carregamento, e some em reduced-motion (a duração
  vem do token, que zera).
- **Entrada orquestrada:** §7.2 proíbe reveal-on-scroll e a manchete é o LCP. Então a entrada é
  (1) a queda do enxame, por COLUNA, uma vez por visita à seção, e (2) `.entra` em CSS puro nos
  elementos de apoio do hero. A manchete e as bolinhas nascem visíveis: com JavaScript desligado
  nada fica escondido.
- **Micro-celebração:** classe `celebra` (só `scale`, 200ms) aplicada por estado DEPOIS do toque;
  nunca existe no HTML do servidor.
- Motion (12.43) é usado onde o gesto é do leitor: folha do glossário/registro (AnimatePresence),
  faixa de simulação, troca 1º⇄2º turno (`initial={false}`) e a contagem.

### Forma dos gráficos

- **Distribuição (AreaChart da v1) → ENXAME.** A seção "Isso ainda pode virar?" passa a mostrar
  a MESMA distribuição contada em 100 bolinhas (DESIGN-V2 §4, segunda escala). Mesma informação
  (forma da incerteza, onde está o zero, o espaço de virada), zero Recharts, e o deck já
  descrevia a seção com "cada bolinha". `calcDadosDist` continua no modelo (golden tests).
- **Evolução passa a plotar a DIFERENÇA**, não os dois níveis: só assim "empate" é uma ALTURA
  ("nesta altura os dois teriam o mesmo tanto de voto", COPY-DECK §G) e "Lula na frente ↑" é
  verdade geométrica. Os dados são os mesmos do inventário (média ponderada ponto a ponto,
  scatter por pesquisa, toggle 1º/2º, tooltip com instituto/campo/valores, nota da série curta).
  A faixa da dúvida é ±`sigmaHoje` no observado e cresce até o dia da votação pela MESMA fórmula
  do modelo (`hypot(sigmaHoje, coefDeriva·√dias)`), com borda tracejada depois de hoje — nenhum
  número novo é inventado.
- **/historico continua sem faixa lilás.** `getSerieRuns` (em `src/lib/dados.ts`, arquivo
  congelado nesta fase) expõe só as duas chances do dia, sem a dúvida daquele dia; desenhar uma
  faixa a partir de um número que o modelo não publicou seria fabricar precisão (H11/H14). A
  frase do deck que promete a faixa fica pendente para quem puder mexer na camada de dados.
- **Bandas do cenário-base monocromáticas**: lilás da dúvida + banda modal em ameixa + régua de
  tinta na fronteira "Flávio na frente"/"Lula por até 5". As quatro cores do protótipo
  (`CORES.lula`, `#D96A7A`…) não entram na superfície; cada pedaço leva rótulo e número ao lado.
- **Ranking de candidatos**: Lula e Flávio nos tokens v2 (é a cor própria deles no sistema); os
  demais mantêm a cor de `src/data/constantes.ts`, que é dado do protótipo. A "cor própria por
  candidato" do INVENTÁRIO 3.3 sobrevive sem reintroduzir a paleta v1 nos dois protagonistas.

### Interface

- Chip de glossário SEM margem negativa: a margem negativa devolve o alvo de toque sem gastar
  altura de linha, e um `inline-flex` só empurra a linha pela caixa de margem — o chip passava a
  ser pintado por cima das linhas vizinhas. Sem ela, a linha cresce e nada é coberto.
- Cabeçalho da marca e rodapé subiram para o layout raiz (uma instância, todas as páginas);
  as páginas deixaram de renderizar o rodapé por conta própria.
- A navegação vive SÓ no rodapé; o cabeçalho é a marca e leva ao painel. Dois conjuntos de links
  com o mesmo rótulo seriam ambiguidade para leitor de tela e para o teste.
- Ilustrações de `public/ilustracoes/` aplicadas onde ELAS ensinam (MARCA §6.8 define o "para
  quê" de cada uma): `explicando-incerteza` em "Como ler esta página", `explicando-empate` na
  série, `vazio-sem-dados` nos estados vazios, `vazio-sem-conexao` no /historico. O bloco de
  contexto social ficou sem ilustração — nenhuma das quatro fala de contexto social, e ornamento
  ali seria enfeite.
- `/admin`: sem verde de sucesso e sem vermelho de perigo. Ação primária ameixa, ação destrutiva
  em botão-fantasma âmbar, chips "pendente" (âmbar) e "publicada" (ameixa).

### Renomeação (MARCA §5)

- Executados: `_lib/site.ts` (NOME_SITE, TITULO_PADRAO, DESCRICAO_PADRAO, NOME_DESCRITIVO,
  TAGLINE), metadata e JSON-LD do layout (`alternateName` = "Agregador de pesquisas
  presidenciais 2026"), JSON-LD da home, `keywords`, OG (arte e `alt`), cabeçalho/`<h1>`,
  compartilhamento, `package.json` → `ponteiro`, README, CLAUDE.md, `.env.example`, e o teste
  e2e do `<h1>`.
- **NÃO executados, por decisão explícita**: os headers `x-application-name` de
  `src/lib/supabase/{publico,admin}.ts` (itens 14–15) — os arquivos estão na lista de "não
  tocar" do despacho desta fase, e a string não aparece para o usuário. Ficam como pendência.
- `docs/DESIGN.md` e `RELATORIO.md` preservados com o título antigo: são registro histórico da
  v1 (o primeiro é o contraexemplo citado pelo próprio DESIGN-V2); renomeá-los seria churn sem
  efeito perceptível (R7).

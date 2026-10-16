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

# MISSÃO v2.1 — "ENCAIXE" (branch encaixe/v2.1; plano aprovado pelo dono)

- Feedback do dono a olho nu, confirmado por medição: 440px do monitor 1440 sem uso; 38,8% da
  altura do documento sem tinta à direita; tabela rolando 7px em qualquer monitor; "?" a 95%
  da prosa; 5 regras de hover no CSS inteiro → recomposição de desktop (container 1200 = duas
  medidas de leitura na placa), dieta de texto MODERADA e motion EXPRESSIVO.
- A trava "não esconder mais texto atrás de disclosure" (arbitragem de altura da Fase 7) CAI
  por ordem expressa do dono → a dieta moderada move o secundário para a 2ª camada
  (Revelador: folha no toque, popover no ponteiro fino — nunca title nativo), sempre com o
  texto completo preservado (sr-only/balão) e 1ª camada como PREFIXO literal da 2ª (teste
  trava isso).
- Registro no TSE passa a ser "a um toque" TAMBÉM no desktop (o número vira o gatilho do
  balão da linha) → mesmo padrão que o cartão mobile já usava; R4/H12 seguem honrados
  (instituto, registro e fonte sempre alcançáveis).
- contexto-social NÃO ganha gráfico: `CONTEXTO[].dado` é string livre — parsear seria
  fabricar dado; o visual da seção é o grid 3×2 de cartões curtos (escolha, não omissão).
- Motion: emenda consciente ao DESIGN-V2 §7 — "tudo que é interativo responde ao ponteiro";
  exceção nomeada para sublinhado animado (repintura de 1 linha); activeDot é ESTADO
  (isAnimationActive=false fica); reveal-on-scroll SEGUE banido; sombra só em interativo+hover.
- Breakpoints xl/2xl do Tailwind vazavam do tema base sem terem sido desenhados → desligados;
  acima de lg a coluna satura em 1200 e a composição não muda (passo que não muda nada é
  dívida).

## v2.1 — rodada 2 (feedback pixel a pixel do dono)

- Pílula de glossário com "?" sobrescrito REPROVADA pelo dono ("botão visualmente quebrado")
  → termo em SUBLINHADO PONTILHADO âmbar no fluxo da prosa (padrão editorial
  Wikipedia/FT/MDN), cursor-help, hover sólido + fundo suave; o "?" morre no Termo e o selo
  redondo MaisSobre perde o anel → a afordância deixa de gritar mais que o conteúdo; nomes
  acessíveis e testes intactos (o rótulo visível é o próprio termo).
- Chips de leitura (empate técnico/na frente) sem anel → campo macio do próprio lado
  (fundos suaves, contrastes ≥4,5 documentados) → fadiga de contorno apontada pelo dono.
- Cabeçalho da série em TRÊS colunas (pergunta+resposta | traduzindo | exemplo) → a ilustração
  empilhada criava ~350px de buraco sob o título; em terços as alturas casam.
- "folga de N pontos" 13× sob as barras REMOVIDA da tabela → o número vive no balão da própria
  barra (hover) e no registro da linha; linhas de andar único, ruído morto.

## Go-live — troca de fornecedor do coletor (ordem do dono, 2026-08-05)

- Coletor migrado de Anthropic (claude) para OpenAI Responses API com ferramenta
  `web_search`, a pedido do dono (créditos disponíveis lá). Modelo padrão
  `gpt-5.6-luna` — o degrau barato da geração vigente (US$ 0,20/M entrada),
  validado ao vivo antes da troca: executou buscas reais e localizou pesquisa
  recente com registro TSE correto.
- A troca é SÓ na função `buscarNaWeb` + checagem de env (`OPENAI_API_KEY`,
  `OPENAI_MODEL`): todo o funil hostil (Zod estrito, sanidade 20–70, dedup,
  `pendente`, bruto forense) é agnóstico de fornecedor e ficou intacto — o
  contrato continua "texto com um array JSON dentro".
- Sem SDK da OpenAI: é um POST único; `fetch` nativo com timeout de 240s e uma
  retentativa em falha transitória reproduz o comportamento do cliente antigo
  sem a dependência (R7). `@anthropic-ai/sdk` removido.
- `max_output_tokens: 8000` (era 2000): em modelo com raciocínio o teto inclui
  os tokens de pensamento; apertado, a resposta chegaria truncada sem o JSON.
- `textoDaResposta` exportada e tratando a resposta como `unknown` nível a
  nível — a forma vem da rede, não do nosso tipo.
- Pós-revisão adversarial da migração (3 lentes, 8 achados confirmados):
  timeout por tentativa 240s→130s — a rota do cron tem `maxDuration=300` e
  2×240s estourava o teto, matando a função ANTES do snapshot diário (o pior
  modo de falha: buraco silencioso na série); agora 2×130s + folga cabem.
  `status !== "completed"` da Responses API vira erro explícito (antes,
  resposta truncada por max_output_tokens viraria um falso "não há pesquisa
  nova"). Tripwire do CI atualizado para `sk-proj|OPENAI_API_KEY` (varria só
  os padrões da Anthropic — SECURITY.md prometia o que o CI não fazia).
  `textoDaResposta` ganhou testes (formas hostis inclusas). Custos e runbooks
  do README reescritos para a OpenAI.

## Branding 2026 — logo novo, Newsreader, paleta rebaseada, cabeçalho sticky (ordem do dono)

- **Logo**: 3 rodadas de estudos no Higgsfield (27 propostas, 5 engines; Recraft V4.1
  vetorial venceu por entregar SVG nativo). Escolha do dono: estudo 3.1 — P didone de
  alto contraste com AGULHA âmbar estourando do bojo, respondendo à crítica de que o
  mostrador pequeno sumiria em favicon/avatar. Masters regenerados em `public/brand/`
  (símbolo, monos, horizontal, empilhado, wordmark em contornos reais da Newsreader via
  fontTools, com kerning do GPOS); `icon.svg`/`favicon.ico` (1,4 KB, PNG-in-ICO)/
  `apple-icon.png` novos; og-base.png recomposto com a marca nova.
- **Display**: Instrument Serif → **Newsreader variável com eixo óptico** (`axes:
["opsz"]`). Motivo medido (relatório de pesquisa, fontTools): dígito 0,386→0,600 em
  (+55%) exatamente onde mora a queixa "muito narrow"; `tnum` de brinde; DNA de notícia
  em tela casa com a didone do logo (Besley morreu com o 3.2 slab que não foi escolhido).
  Lexend fica (par de redação; R7). Recalibragens: manchete 36→66 (piso desceu de 40 —
  fonte 43% mais larga estourava a dobra de 390, trava de e2e), leading 1,05, tracking
  −0,005em; wordmark 26→32 peso 500; OG com TTF estático opsz-72 e placar 84px.
- **Paleta**: rampa ameixa REBASEADA na tinta do logo — `ameixa-forte` #3a2144 É o hex
  da letra; identidade #5a3a66→#4a2e55; pressa #2a1733; foco acompanha. Todos os pares
  recalculados (WCAG + OKLCH 314–316°): nenhum cai, todos sobem. Novo token
  `--color-agulha` #c2570b (âmbar da marca, uso GRÁFICO ≥3:1 em toda superfície; texto
  âmbar continua em `--color-atencao`). Vermelho/azul dos candidatos INTOCADOS (R4).
- **Cabeçalho**: duas camadas (proposta da pesquisa §2.2) — marca generosa que rola
  embora + `BarraNav` sticky de 48px (`--spacing-barra`), fundo bruma chapado, filete
  sempre e `--shadow-flutua` só descolada (sentinela+IO, transição só de opacity; sem
  JS fica o filete). SEM hambúrguer (3 rótulos = ~295px numa linha a 390, medido);
  "Painel" entrou na nav (a volta à home era só o logo); `aria-current="page"` como
  pílula ameixa-bruma; skip-link primeiro focável; faixa de simulação reancorada
  (top = barra+8px, z 30→20). E2e novos: sticky, aria-current por rota, uma linha a
  390, skip-link. Testes atualizados: nav virou landmark irmão do banner; viewBox novo
  do símbolo; dobra de 390 verificada de volta ao verde.
- Pós-verificação adversarial do branding (4 lentes, 11 confirmados): âncoras sob a barra
  → `scroll-padding-top` global ancorado em `--spacing-barra` (skip-link e
  #explicacao-tecnica aterrissavam escondidos); popover do Revelador ganhou `md:z-10`
  (ancorado ao documento, rolava POR CIMA da barra; o z-50 é do sheet mobile); caps da
  manchete do hero recalibrados 22/26ch→15/17ch (o ch da Newsreader é 55% maior — viraram
  no-op); wordmark.svg com viewBox pelo bbox MEDIDO (cortava o topo do T/E); ícones com
  placa bruma #EFECF1 (espelho de token, não off-white órfão); DESIGN-V2 §10 e MARCA
  §6.2/6.3 reescritos com os contrastes novos; anotações residuais da ameixa velha
  corrigidas em tokens.css.
- Símbolo na barra sticky (pedido do dono): o "bastão da marca" — o símbolo aparece na
  barra APENAS quando ela descola (o cabeçalho de marca já rolou embora), com transição
  só de opacity, aria-hidden/tabIndex −1 enquanto invisível, e link de volta ao início.
  §6.6.10 preservado no que importa: nunca dois símbolos VISÍVEIS — o e2e da regra foi
  reescrito para medir visibilidade real (viewport + opacity computada), não contagem de
  DOM. `Simbolo` extraído para `simbolo.tsx` (evita ciclo marca ⇄ barra-nav).

## Série retroativa no /historico (missão aprovada em plano; cadência DIÁRIA por decisão do dono)

- **O que é**: pontos reconstituídos no gráfico "Como a chance mudou com o tempo" — o modelo
  determinístico rodado de novo para cada data passada (09:00 BRT, a hora do cron), usando
  APENAS pesquisas com `campo_fim <= data`. O filtro é OBRIGATÓRIO: o agregado 2ºT não exclui
  pesquisa futura sozinho (idadeDias tem `Math.max(0,…)` — entraria com peso máximo).
- **Honestidade**: `gatilho='retroativo'` no banco; TRACEJADO no gráfico (padrão espelho do
  observado×projetado da home) + ReferenceLine dinâmica no 1º registro ao vivo + tooltip e
  legenda declarando a origem; "conhecida" = campo encerrado (a divulgação real veio dias
  depois — ressalva na copy). Nunca se apresenta como registro (H11/H14; precedente
  DECISOES "sem faixa lilás").
- **Mecânica**: migration 0004 (CHECKs de gatilho/acao + índice único parcial por
  executado_em WHERE retroativo — corrida vira 23505, não duplicata); `reconstituir.ts` com
  núcleo puro (gerarDatasAlvo/reconstituirSerie) + orquestração idempotente (delete dos
  retroativos → insert em lotes de 50 → auditoria `reconstituicao`); helper
  `getPesquisasPublicadasDoBanco` SEM fallback de seed (gravar snapshot derivado do seed numa
  falha de rede reconstituiria uma série que não é a oficial); `getSerieRuns` com select
  magro `resultado->eleito->dia` + gatilho, limite 500 (diária ≈ 206 retro + ~82 cron até
  out < 500).
- **Gatilhos**: rota POST `/api/cron/reconstituir` (Bearer CRON_SECRET, mesmas guardas do
  cron; fora do vercel.json — disparo deliberado) e botão "Reconstituir histórico" no /admin
  (exigirAdmin; sem cooldown — idempotente e sem custo de IA). Pesquisa ANTIGA aprovada
  depois deixa o tracejado desatualizado até re-rodar — o texto do botão avisa.
- **Costura**: o 1º ponto registrado é duplicado nas séries tracejada e cheia
  (`connectNulls={false}`) para a emenda ser exata na fronteira; tudo-retroativo (estado
  transitório) → sem ReferenceLine, tudo tracejado.

## Auditoria de conformidade eleitoral/legal (3 frentes + 16 alegações verificadas em fonte oficial)

- **Veredito**: a operação atual NÃO configura crime nem infração eleitoral. Registro (Lei
  9.504 art. 33) é dever de quem REALIZA a pesquisa; republicar pesquisa registrada citando
  o registro não exige registro próprio; o crime do §4º é divulgação FRAUDULENTA (dolo);
  a multa do §3º (até R$ 106 mil) alcança o divulgador de pesquisa SEM registro — por isso o
  gate humano confere o registro antes de publicar (R3 é também blindagem legal). Norma
  vigente 2026: Res.-TSE 23.600/2019 com Res. 23.747/2026; sem regra específica para
  agregadores/modelos. ADI 3.741/STF: divulgação livre até o dia da eleição (boca de urna só
  após 17h — o coletor nunca incorpora coleta do próprio dia).
- **Correções de conformidade aplicadas**: contratante agora VISÍVEL na folha de detalhe de
  cada pesquisa e na lista da /metodologia (art. 10: item obrigatório de divulgação; o dado
  sempre existiu, faltava renderizar) + link "conferir o registro no site do TSE" em cada
  folha. Pendências registradas: nível de confiança por pesquisa (art. 10) exige coleta
  manual no PesqEle — item aberto; completar o nº de registro da dataf-mar; trocar fontes
  Yahoo/AOL por publicação original.
- **Open source como blindagem**: repo público + LICENSE **AGPL-3.0** (fork que rodar
  modificado é obrigado a publicar o fonte — §13 — adulteração silenciosa do modelo é
  impossível de esconder) + TRADEMARKS.md (nome/logo/domínio NÃO licenciados, AGPL §7e).
  MIT rejeitada (silente sobre marca, sem copyleft de rede).
- **Decisão estrutural permanente: o site NUNCA terá comentários/UGC** — evita por
  construção o regime de responsabilidade por conteúdo de terceiros pós-Tema 987/STF.
- **Pendências institucionais (dependem dos donos)**: /quem-somos + /privacidade + política
  de correções (conteúdo pessoal: nomes como querem ser exibidos, e-mail de contato
  dedicado); depósito da marca no INPI (sistema atributivo — sem INPI o TRADEMARKS é aviso
  moral); revisão por advogado(a) eleitoralista antes do período crítico.

## Redesenho das bandas do cenário-base (cor = direção + magnitude)

- **Contexto**: o dono do produto reprovou o infográfico "De quanto pode ser a diferença no
  fim" ("muito ruim, melhorar cores ou pensar outro modelo") — quatro bandas no mesmo lilás
  indistinguíveis, contorno de tinta preta na banda modal, rótulo "empate" flutuando solto e
  legenda numa linha corrida sem ligação com as faixas.
- **Decisão**: a barra 100% empilhada FICA; a cor passa a ser do DADO — direção pela família
  do candidato (naval à esquerda da régua, carmim à direita), magnitude por degrau de rampa
  de fundo. Dois tokens novos em `tokens.css` §4 (`--color-lula-fundo-2` #f8bcc0 e
  `--color-lula-fundo-3` #f4a0a7): matiz do carmim (h ≈ 14°), ΔL adjacente 0,068/0,060,
  contrastes calculados e anotados no arquivo. O teto de escuridão da rampa é o ANEL da
  banda modal — contorno de 2px na cor do candidato, que precisa de ≥3:1 de objeto gráfico
  sobre qualquer degrau em que a modal caia (pior caso 3,07:1, fundo-3 × carmim). Modal =
  anel + chip "o mais provável" ancorado no centro dela (clamp em rem contra vazamento a
  390); "empate" vira traço de 3px contínuo com a régua de tinta + rótulo encostado (troca
  de lado se a fronteira passar de 70%); legenda ancorada por grid proporcional às bandas em
  sm+, lista vertical com amostra de cor abaixo disso. Vão entre bandas: 2px de placa; fio
  `--color-contorno` desenha o limite da barra (fundos claros não seguram a forma sozinhos).
- **Porquê assim**: opacidade composta é banida e não existia degrau intermediário; criar
  rampa com contraste calculado é o caminho que o próprio tokens.css prevê ("par novo só
  entra com o número calculado junto"). Não é ênfase editorial num desfecho (R4/H9): é rampa
  sequencial do dado, e ela só tem degraus do lado que o modelo bina — rampa naval NÃO foi
  criada porque nenhuma banda de magnitude existe do lado Flávio hoje (token sem uso
  violaria R7; a condição de entrada está anotada no token). Nenhuma string auditada foi
  reescrita — apenas reorganizada (o chip usa as mesmas palavras "o mais provável"; o
  sufixo " — o mais provável" continua na legenda, que é o que o leitor de tela recebe).
- Missão one-shot (divulgação): manchete do hero SOLTA da medida (ordem do dono — ocupa a
  largura do bloco; o teto de 15/17ch criado na verificação do branding caiu por decisão
  expressa). Hero ganhou ABAS no gráfico: "cenários" (enxame, padrão e SSR — e2e do hero sem
  JS intacto) × "ponteiro" (Medidor semicircular, ideia do Pedro): seletor SOBREPOSTO no
  canto (zero altura nova a 390 — a dobra travada não se move), medidor com lados
  naval/carmim, zona central lilás "metade a metade", agulha em TINTA NEUTRA e estática
  (nada anima dado). SALVAGUARDA §6.6.3 preservada: o medidor é linguagem de gráfico, não
  reutiliza o glifo da marca; nenhum número novo (aria reusa a frase carimbada da manchete).
  Vercel Web Analytics ligado (agregado, sem cookie, first-party) — renderizado SÓ na infra
  da Vercel (em next start local o script 404va e derrubava a suíte e2e inteira).
- Recomposição desktop das páginas institucionais (/metodologia, /quem-somos, /privacidade —
  ordem do dono: "diagramação péssima, margens estranhas"): o desenho "coluna única de 512px
  sem placa" (§5.7 original) foi REVOGADO. As três páginas agora falam a gramática do painel:
  Secao→Bloco (placas), cabeçalho em 2 colunas (34rem | intro) a partir de lg, e a prosa em
  DUAS colunas de leitura dentro da placa (multicol com `break-inside-avoid-column`; cada
  coluna ≈508px ≤ medida). O hack `lg:-mx-64` das listas do glossário/fontes morreu com a
  causa. Trava de e2e atualizada: placas ≥2 + parágrafos ≤520 (títulos podem ter a coluna do
  cabeçalho). Responsáveis do /quem-somos viraram 2 Nichos lado a lado.

## Missão SEO/GEO (plano aprovado; decisões do dono: bots de IA liberados + widget embed)

- **On-page**: og:url/title/description POR página (antes todas as rotas declaravam a home);
  title da home ganhou o termo de busca ("Pesquisas Presidente 2026: …"); canonical/sitemap/
  JSON-LD unificados numa grafia; meta keywords removida (morta desde 2009); `<time datetime>`
  no selo de frescor e no feed do /historico; Organization autônoma no JSON-LD (logo, sameAs
  GitHub) + WebSite.publisher + Dataset com license CC-BY-4.0 e citation.
- **robots.ts**: política "aberto de verdade" DECLARADA — 16 bots de IA nomeados (busca e
  treino), decisão expressa do dono; /api/resumo aberto dentro do /api/ fechado (regra mais
  longa vence).
- **/pesquisas/[slug]**: slug = instituto_id + campo_fim (espelho da UNIQUE do banco; TSE
  descartado — nullable e com "/"); as 13 do seed usam a MESMA regra (id humano continua
  interno); fichas com procedência completa, 1ºT com outros candidatos por extenso, posição
  na média e comparação pareada com a anterior do mesmo instituto (link entre irmãs). Copy
  nova carimbada (AUDITORIA §14: 1 veto — o fator 2 do empate pela 3ª vez — e mapeamento
  vinculante {{DIF_MEDIA}}→margem, nunca margemAj). ClaimReview rejeitado de propósito (não
  somos fact-checker; rich result enganoso).
- **Descoberta**: sitemap async com lastmod REAL (publicado_em; seed = fim do campo);
  IndexNow (chave em env, fire-and-forget) disparado por serieMudou, que agora também
  revalida /metodologia, /pesquisas, as fichas e o sitemap.
- **GEO**: llms.txt (fatos estáveis + como citar) e /api/resumo (JSON público com a MESMA
  leitura do painel, mesma cadência — verdade mecânica exigida pelo carimbo §14.5.5).
- **/embed**: route handler puro (HTML autocontido ~2 KB, zero JS), frequência via parEmCem,
  atribuição-ressalva inseparável do número (§14.5.4); é a ÚNICA rota emoldurável — o header
  global (X-Frame-Options DENY) passou a excluir só ela.

## Bloco "Quando saem as próximas pesquisas?" (home, ordem do dono)

- Duas fontes que o bloco NUNCA mistura: ritmo por instituto (estimativa da nossa própria
  base) e calendário oficial (datas de lei — art. 11 e 36 da 9.504 + turnos), com contagem
  de dias em America/Sao_Paulo e linhas que somem sozinhas quando a data passa.
- **Veto de cálculo do carimbo (§15.1) acatado**: a mediana da série inteira publicava
  "Quaest — próxima 13/10" (depois do 1º turno) porque o intervalo de 148 dias de janeiro
  envenenava a conta. Regra vigente: mediana dos intervalos iniciados na JANELA DE 120 DIAS;
  elegível = 2+ pesquisas na janela; com 1 intervalo entra a variante "a anterior saiu N
  dias antes" (padrão de um dado não é padrão); estimativa depois de 25/10 não é publicada.
- **Tradução registrada (VOZ §3)**: "ritmo" = mediana dos intervalos na janela. O que
  "ritmo" NÃO pode dizer: que existe compromisso, agenda ou regularidade garantida. A
  palavra "mediana" é banida em superfície (§5.1) — a conta completa vive na /metodologia
  (entrada técnica nova).
- Passar da estimada NÃO é anomalia (é o esperado em metade das esperas, por definição de
  mediana) — por isso a copy diz "pelo ritmo, uma nova pode sair a qualquer momento", nunca
  "vinha publicando" (imperfeito que insinua quebra).
- Automação: puro sobre (pesquisas, hojeMs) + ISR 300 — o bloco envelhece sozinho; pesquisa
  nova aprovada → serieMudou já revalida a home → ritmos recalculam.

## 2º turno — o modelo passa a saber que o 1º turno já aconteceu (out/2026)

- **Contexto**: em 16/10/2026 (entre turnos) o painel ainda somava à manchete a chance de
  "Lula ganhar já no 1º turno" (~6 em 100, congelada desde 04/10, porque `dias1T` é
  truncado em 0 e `p1` continuava calculado com as pesquisas antigas de 1º turno). O hero
  dizia "1º turno · faltam 0 dias" e a "ponte 84×82" afirmava que em ~6 de cada 100
  cenários "não há 2º turno" — falso depois de 04/10. É **bug real**: o protótipo
  (`agregador-presidencial-2026.jsx`) foi escrito em agosto e não modelava o pós-1ºT.
- **Decisão**: `faseEleitoral(hojeMs)` (`src/lib/modelo/fase.ts`: `pre1T` → `entreTurnos`
  em `ELEICAO_1T` → `encerrada` em `ELEICAO_2T`). No núcleo, `p1` só é calculado na fase
  `pre1T`; daí `p2Tacontece = 1` e `eleito = pL2` sem tocar em nenhuma outra fórmula. Os
  derivados seguem a mesma guarda via `dias1T === 0`: `calcVies` vira 2º turno puro;
  `calcReplay` mantém só o ramo do 2º turno (campos do 1ºT = `null`, `p2Trep = 1`);
  `calcCenarioBase` passa a existir sem dados de 1ºT (`pDireto = 0`, `pLulaEm1 = null`).
  As médias `t1*`, `serie1` e `tend1` continuam calculadas (servem ao histórico). O
  veredito não diz mais "0 dias até a decisão".
- **Golden tests**: a paridade 1e-9 com o protótipo continua valendo ANTES de 04/10 (agora
  até 04/10 11:59) e só sobre as 13 rodadas originais (`IDS_PROTOTIPO` — o seed vai crescer
  com o 2º turno). Depois de 04/10, o gabarito é o protótipo COM a única troca aplicada
  (`p1 = null`): todo o resto segue idêntico a 1e-9. A "ponte 84×82" vira identidade
  (manchete = enxame) — travada em `tests/coerencia-superficies.test.ts`.
- **sigmaSys continua 4,0**: o argumento antigo ("as pesquisas ainda não passaram pela
  calibragem do 1º turno") perdeu a premissa, mas o 1º turno de 2026 mostrou erro
  grande de novo — não há base para apertar a incerteza a 9 dias da decisão.

## 2º turno — superfícies, dados e fluxo de coleta (out/2026)

### Diagnóstico (corrigido depois do acesso ao banco)

- O primeiro diagnóstico ("a série parou em 02/08") veio da URL interna do deploy da
  Vercel, que ninguém visita e por isso nunca regenerava. Lido o banco: o robô coletou
  bem até 03/10 (36 rodadas publicadas pelo admin; 41 de 51 linhas automáticas idênticas
  à verificação independente), mas (a) 14 rodadas de outubro ficaram PENDENTES desde
  08/10; (b) o mesmo instituto entrou com nomes diferentes e duplicou rodadas (BTG/Nexus ×
  Nexus, PoderData/Aya × PoderData, CNT/MDA × MDA, três grafias de Futura); (c) duas
  rodadas vieram em votos VÁLIDOS (AtlasIntel 02/10 publicada 50,1 × 49,9; Futura 10/10);
  (d) três com a data de divulgação no lugar do fim do campo. A migração 0005 limpa isso
  com auditoria (48 remoções `remocao`, todas reinseridas pela carga verificada, exceto
  duplicatas e válidos). O id da Vox Brasil ficou `vox-brasil` (o do banco) para não
  quebrar links; links de ids-apelido (btg-nexus-…, poderdata-aya-…) passam a 404.
- Defeitos estruturais do coletor, que explicam (b)–(d) e o risco de travar: (1) a busca partia da ÚLTIMA PUBLICADA, então só andava
  quando o admin aprovava; (2) pesquisa com campo mais antigo que a última aprovada era
  recusada para sempre ("fim < ultimoFim"); (3) o prompt pedia no máximo 6 itens, sem data
  de hoje, sem a fase da eleição e sem dizer se queria votos totais ou válidos; (4) a
  extração ia do primeiro "[" ao ÚLTIMO "]" — a busca na web termina com citações
  "[fonte](url)", o JSON quebrava e o /admin dizia "a série já está em dia"; (5) o selo de
  frescor lia o snapshot do cron, que é gravado mesmo quando a coleta falha.

### Fluxo de coleta reescrito (src/lib/updater.ts)

- **Janela**: `desde = min(última publicada, hoje − 21 dias)`; a rejeição "anterior à última
  da série" virou "anterior à janela". Dedup carrega também as chaves REJEITADAS (o que o
  admin recusou não volta todo dia).
- **Prompt**: data de hoje, resultado do 1º turno, 2º turno em 25/10, até 12 itens, votos
  TOTAIS explícitos (`l2/f2`), `bn2` (branco/nulo do 2º turno, agora gravado em `t2_bnns`),
  `l2v/f2v` (válidos, só para conferência) e 1º turno só antes de 04/10.
- **Sanidade nova**: par que soma ≥ 98,5 sem `bn2` "parece voto válido" e é recusado (o
  admin decide); `l2+f2+bn2` precisa fechar 100 ± 3. Campo OPCIONAL inválido (`n`, `moe`,
  `tse`, `contratante`, `l1`, `f1`, `bn1`, `bn2`) vira `null` com `_avisos` no forense em vez
  de derrubar a pesquisa; `n` "2.004" é 2004.
- **Leitura robusta**: cada "[" candidato é testado com contagem de colchetes fora de
  strings. Resposta ilegível é FALHA (`falhaLeitura` → `erro`), nunca "série em dia".
- **Rastreio**: toda execução grava `audit_log.acao = 'coleta'` (ok, desde, contagens,
  até 12 motivos). A view pública `coleta_publica` expõe só `em` e `ok`; o selo de frescor
  lê a última coleta BEM-SUCEDIDA (com fallback para o snapshot se a view não existir). O
  cron responde 500 quando a coleta falha; o /admin mostra os motivos de cada recusa e a
  rota do /admin ganhou `maxDuration = 300`.
- **Inclusão manual**: campo de branco/nulo do 2º turno; chave ocupada por linha
  REJEITADA é reaproveitada com os números conferidos (antes, só mexendo no banco).
- **Cron segue diário**: o plano da Vercel em uso só permite execução diária; na reta final
  o botão "Verificar agora" do /admin cobre o resto.

### Dados

- **Resultado oficial do 1º turno** em `src/data/resultado-1t.ts`, lido do JSON oficial do
  TSE (totalização de 05/10 12:51; soma dos candidatos = válidos, 119.300.788).
- **Leva 1** (17 pesquisas de 2º turno com campo encerrado a partir de 04/10) conferida em
  imprensa/PDF do instituto: votos TOTAIS, registro TSE, link https. Escolhas registradas:
  Datafolha mais recente com campo 13–14/10 (ficha técnica do Poder360; outras fontes dizem
  13–15); Indexa com branco/nulo 14 (inclui 8 de "não iria votar"); Palver com o registro
  BR-08028/2026 (fontes divergem; painel online não probabilístico); AtlasIntel com campo
  iniciado em 03/10 (parte antes do 1º turno) — entra pela regra do fim do campo.
- O seed (`pesquisas.seed.json`) deixa de ser só o protótipo: recebe as mesmas cargas
  verificadas, para o fallback R8 refletir o 2º turno. A paridade golden continua sobre
  as 13 rodadas originais (`IDS_PROTOTIPO`).
- Carga no banco por migração (`0005_segundo_turno.sql`): upsert dos institutos novos
  (Futura, MDA, Palver, DataTrends, Ipespe, Vox Brasil, Ideia) e das pesquisas como
  `publicada`/origem `admin`, uma linha `inclusao_manual` por pesquisa no audit_log;
  pendente/rejeitada com a mesma chave é substituída pelos números verificados.

### Superfícies

- **Hero**: contagem até 25/10 por dias de calendário em SP ("é hoje" no domingo); a
  frase-ponte do 84×82 saiu; o 1º turno virou fato (resultado oficial com link do TSE);
  aviso de dado velho quando a pesquisa mais recente tem mais de 7 dias.
- **Simetria (R4)**: textos escritos supondo Lula na frente ("é Flávio quem ganha a
  decisão", "a ponta de baixo é uma vitória de Flávio", "pesquisa em que Flávio aparece à
  frente") passaram a usar quem está atrás na média, dos dois lados.
- **Bandas do cenário-base simétricas**: o protótipo binava magnitude só do lado de Lula
  (uma banda "Flávio vence" contra três de Lula). A barra agora é calculada na
  apresentação, duas bandas por lado com corte em 5 pontos, sobre a MESMA N(margemAj,
  sigmaDia2) — o modelo e a paridade não mudam. Entra o token `flavio-fundo-2` (espelho do
  `lula-fundo-2` em clareza) e sai o `lula-fundo-3`.
- **Números fixos de agosto viraram conta**: "+4,7 → ~1,6", "86/83/79 em 100", "6 dos 7
  institutos de julho", "47% contra 38%", "51 × 49", "menos que os 6,3" — agora calculados
  do modelo, ou removidos quando eram contexto de julho.
- **Erro do 1º turno de 2026** (`src/lib/erro-1t.ts`): média SIMPLES, em válidos, das
  pesquisas com campo encerrado de 27/09 a 03/10 × urna — a mesma conta do erro de 2022.
  Aparece como sexta linha da tabela de erros, no cartão do 1º turno e na /metodologia;
  só entra quando houver pesquisas da última semana na série.
- **"E os outros candidatos?"**: depois de 04/10 mostra o resultado oficial (12 nomes) na
  régua fixa de 0 a 50%, no lugar da média de pesquisas antigas.
- **Evolução**: a linha do 1º turno termina em 04/10 com o ponto "urna" (resultado em
  válidos); a frase "desde janeiro a diferença encolheu" virou direção calculada.
- **Próximas pesquisas**: casa parada há mais de max(30 dias, 3× o ritmo) sai da lista
  (não "pode sair a qualquer momento" depois de meses); depois das 17h de 25/10 não há
  ritmo; a frase de `semRitmo` deixou de afirmar "uma pesquisa só" (era falsa).
- **OG**: deixou `force-static` (publicava a chance do último deploy) e revalida a cada 5
  min, com fontes e fundo no bundle (`outputFileTracingIncludes`). `serieMudou` também
  revalida /api/resumo, /embed, /llms.txt e a OG.

### A média do 2º turno recomeça em 04/10 (decisão do dono, 16/10/2026)

- **Contexto**: com a série completa (98 rodadas), a média do 2º turno misturava as
  pesquisas de setembro — feitas antes de os institutos terem o gabarito da urna, e cujo 1º
  turno errou 4,3 pontos na diferença a favor de Lula — com as refeitas depois de 04/10. Só
  pós-1ºT: Flávio +2,6 (eleito em 73/100). Misturando: Flávio +1,5 (64/100).
- **Decisão**: entre turnos (e depois), se houver ao menos uma pesquisa com campo
  encerrado a partir de 04/10, a média do 2º turno usa SÓ essas. As anteriores continuam
  nas linhas com `w = 0` (lista, fichas, gráfico — rotuladas "feita antes do 1º turno: não
  entra na média do 2º turno"); `qtdRecentes/qtdEmpate` só contam quem entra na média; a
  série do gráfico do 2º turno também recomeça em 04/10, e o último ponto bate com a margem.
- **Porquê**: é o mesmo argumento que o painel já usava para 2022 ("as do 2º turno foram
  refeitas depois do susto do 1º") e a prática padrão dos agregadores entre turnos. Golden:
  as 13 rodadas do protótipo são todas pré-1ºT, então a regra não as alcança (paridade
  intacta); `tests/coerencia-superficies.test.ts` trava "margem com a série inteira = margem
  só com as pós-1ºT".

### Leva 2 (03/08 → 03/10) e o erro do 1º turno de 2026

- 68 rodadas (20 de agosto, 48 de setembro/início de outubro) por migração `0006`, mesmo
  rito da 0005. **Excluída**: American Analytics 15–20/09 — registro TSE impresso fora do
  padrão ("BR-032587/26"), não conferível. Instituto novo: Veritá.
- Escolhas registradas: cenário de 1º turno SEM Pablo Marçal quando havia os dois (ele não
  foi candidato); quando só havia o cenário com ele, ele fica em `outros1`. Gerp e Indexa:
  branco/nulo = "nenhum" + "não sabe" (+ "não iria votar" no Indexa). Datafolha 01/10 com
  campo 29/09–01/10 (fontes divergem). Futura 02–03/10, Palver 30/09–03/10 e Gerp 24–28/09
  sem branco/nulo do 1º turno publicado — ficam FORA da conta do erro (a regra exige o dado).
- **Erro do 1º turno de 2026** pela regra pública (16 pesquisas com campo encerrado de
  27/09 a 03/10): pesquisas Lula 44,9% × Flávio 42,5% em válidos; urna 45,16% × 47,03%;
  erro na diferença = 4,3 pontos a favor de Lula. Vira a 6ª linha da tabela de erros e o
  cartão "Igual ao 1º turno de 2026" na curva de puxada (valor MEDIDO, arredondado a 1
  casa). O padrão do painel continua sem puxada.
- O seed passa a ficar em ordem de fim de campo decrescente (era a ordem do protótipo); a
  paridade golden filtra as 13 originais por id, então a ordem não a afeta.

### Contexto social de outubro

- Os cinco cartões de julho (aprovação, rejeição, piso, calendário de agosto, "pano de
  fundo") deram lugar a cinco de outubro, todos com campo depois do 1º turno e conferidos
  em página aberta: aprovação (Quaest, PoderData, Datafolha), rejeição no 2º turno, voto
  decidido, calendário da reta final (propaganda 9–23/10; debates Record e pool
  cancelados, Band 18/10, Globo 23/10) e apoios de quem saiu no 1º turno (três a Flávio,
  um neutro, nenhum a Lula — e o Datafolha mostrando que ~1/3 desses eleitores vai de
  Lula). Ficou FORA o que não deu para conferir (recorte de voto decidido por candidato;
  regra exata de divulgação de pesquisa no dia da votação).
- Os cartões já nascem em linguagem simples; o mapa de tradução de `copia-contexto.ts`
  ficou vazio (o teste de jargão continua valendo).

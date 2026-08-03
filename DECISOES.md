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

# RELATÓRIO DE EXECUÇÃO — Agregador Presidencial 2026

Transformação do protótipo `agregador-presidencial-2026.jsx` (artifact React de sessão única)
em produto web de produção, executada pelo protocolo do PROMPT-MASTER: orquestrador (Fable 5)
mais cinco especialistas (Opus) em `.claude/agents/`, fases 0 → [1‖2‖3] → 4 → 5 → 6 (loop) → 7.

## Resumo por fase

### Fase 0 — Fundação

Protótipo lido integralmente (1.699 linhas). `docs/INVENTARIO.md` com 76 itens de paridade.
Dados extraídos para `src/data/` com **verificação mecânica de paridade** (script que avalia os
literais do `.jsx` e compara por `deepStrictEqual`: 13 pesquisas, contexto, histórico de erros,
ERRO_2022, cenários, fontes, candidatos, params, cores, datas, prompt de busca — tudo idêntico).
Scaffold Next.js 16.2.12 + React 19.2.4 + Tailwind v4, TS strict, pnpm. Commit `7a03fe1`.

### Fase 1 — Design system (design-lead)

`docs/DESIGN.md` (873 linhas): 10 princípios pesquisados com fonte (needle do NYT 2016 como
contraexemplo, Gelman sobre falsa precisão, frequências naturais, WCAG 2.2, padrões de tabela
mobile) + direção de identidade "boletim de urna" formalizada. `src/app/tokens.css` em
`@theme static`, validado contra o compilador real do Tailwind. Tabela de contrastes CALCULADA:
5 falhas AA do protótipo corrigidas por tokens derivados (ex.: par de texto
`lula-escuro #B30026` / `flavio-escuro #2A55A2`, contrastes 5,79×5,84 — neutralidade mensurável).

### Fase 2 — Backend (backend-security)

3 migrations (schema literal da spec + seed + correção de segurança), RLS default-deny com
**zero policies de escrita**, testadas contra um Postgres real temporário. `src/lib/dados.ts`
com fallback total ao seed (R8: builda e roda sem nenhuma env). Updater server-only tratando a
resposta da IA como entrada hostil (Zod estrito, sanidade 20–70, datas coerentes, URL https,
dedup, NUL strip, bruto forense, fila `pendente`). Rota de cron com Bearer timing-safe. 5 Server
Actions com `exigirAdmin()` revalidado no corpo + audit_log. 28 testes de updater + 14 de RLS.
**Achado de segurança real**: a policy literal da spec expunha o e-mail do admin ao público —
corrigido pela migração `0003_audit_publico.sql` (view sem `ator`), nunca silenciosamente.

### Fase 3 — Modelo (data-scientist)

Porte TS puro com **paridade numérica provada**: gabarito `tests/reference/original.mjs` gerado
por script a partir das linhas exatas do `.jsx`; golden tests com 7.107 comparações de objeto /
~199 mil escalares (tolerância 1e-9, 4 datas × 12 conjuntos de params × 8 subconjuntos de
série); mutação de controle (z80 alterado em 1e-5 → 77 testes falham) prova que não são vácuos.
416 cenários de property tests. 6 esquisitices do protótipo preservadas e documentadas em
DECISOES.md (paridade manda; nada corrigido em silêncio).

### Fase 4 — Frontend (frontend-dev)

4 páginas (/, /historico, /metodologia, /admin) + /auth/callback (magic link), OG image
dinâmica tipográfica, sitemap/robots/JSON-LD, fontes self-host. Manchete renderizada no
servidor (provado com e2e sem JavaScript); modo simulação 100% local e rotulado (R5); selo de
frescor no lugar do botão público (R3); estado dos parâmetros na URL; diff visual de aprovação
no /admin. Inventário 76/76 riscado. 21 testes e2e com asserção de console limpo + axe.

### Fase 5 — Assets

Higgsfield tentado 1× para a textura (falso positivo do filtro de conteúdo do serviço em
textura abstrata) → fallback previsto: SVG `feTurbulence` (715 B). Marca `▊26` desenhada em SVG
geométrico (dígitos pixel estilo urna, sem dependência de fonte), rasterizada com o Chromium do
Playwright (apple-icon 180px, favicon PNG-in-ICO 684 B). Nenhuma imagem de pessoa/partido (R4).

### Fase 6 — Loop de qualidade visual

Ferramentas em `scripts/qa/` (screenshots 3 viewports × 3 páginas + 6 âncoras + aba candidatos;
axe standalone; Lighthouse com pisos). **5 iterações** (limite era 8):

| Iter | Resultado                                                      | Ação                                                                                                                 |
| ---- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1    | 2 BLOCKER · 7 MAJOR · 15 MINOR · 5 NIT                         | 24 itens corrigidos + captura consertada; perf 82→94 (LCP: gráficos passaram a montar só no viewport)                |
| 2    | 0 B · 4 MAJOR · 4 MINOR · 3 NIT (25/27 confirmados corrigidos) | 11 itens corrigidos com prova empírica por item (CDP, pixel, scrollWidth); crítica refutada em 4 subpontos com prova |
| 3    | 0 B · 0 M · **1 MINOR** (regressão pontual) · 3 NIT            | correção cirúrgica medida (rótulo "peso baixo" inquebrável)                                                          |
| 4    | **0 B · 0 M · 0 MINOR** · 5 NIT — 1ª limpa                     | 3 NITs baratos aplicados (p.p. inquebrável; PESO alinhado; alvo de toque dos links fonte 27×14→47×46)                |
| 5    | **0 B · 0 M · 0 MINOR** · 2 NIT — 2ª limpa consecutiva         | diff pixel a pixel vs iter-4; declaração formal do crítico **sem ressalva**                                          |

Critério de parada cumprido integralmente: (a) gates verdes (139 unit · 21 e2e com console
limpo · axe zero serious/critical em 8 página×viewport · Lighthouse mobile **94/100/100/100**,
CLS 0, TBT 30 ms); (b) duas iterações consecutivas limpas; (c) declaração por escrito do
qa-critic de que não consegue apontar melhoria que um usuário real perceberia
(`.qa/iter-5/critica.md`). Evidências versionadas: críticas das 5 iterações + Lighthouse JSONs +
30 prints finais da iter-5 (intermediários, 113 MB, ficam locais).

### Fase 7 — Hardening e entrega (backend-security)

Headers de segurança em todas as rotas (HSTS preload, nosniff, Referrer-Policy,
Permissions-Policy, X-Frame-Options DENY) + CSP estrita compatível com ISR (sem `unsafe-eval`
em produção; trade-offs documentados em DECISOES.md). Prova do R1 com valores-sentinela:
`.next/static/` limpo de qualquer segredo, nome ou valor — inclusive anon key (nenhum
componente cliente fala com o banco). `pnpm audit --prod`: 5 vulns transitivas via pin do Next,
todas com vetor inalcançável neste produto (análise em SECURITY.md A9). CI com lockfile
congelado + grep de segredo no bundle como gate; Dependabot npm + actions. README.md (setup,
deploy, operação, custo real do cron ~US$ 5–20/mês) e SECURITY.md (A1–A10 com status real).
Dois achados do hardening corrigidos na integração: a rota do cron exportava só POST — e o
Vercel Cron invoca por GET (não dispararia nunca em produção); e o probe JIT do Zod 4 violava a
CSP no cliente (`z.config({ jitless: true })` no único módulo cliente com Zod).

## NITs remanescentes (honestidade final — deliberadamente não corrigidos)

1. Microcopy "REPLAY 2022" (título do bloco) × "réplica" (corpo) — ambos vêm do texto editorial
   do protótipo, preservado por decisão; unificar exigiria reescrever conteúdo do acadêmico.
2. O campo `dado` do cartão "Pano de fundo da disputa" carrega ~30 palavras narrativas em mono —
   é o padrão do componente (todo `dado` é mono); quebrar o padrão para um cartão criaria
   inconsistência pior que a atual.

## Fatos dignos de nota

- O processo adversarial funcionou nos dois sentidos: o crítico pegou uma correção declarada e
  não aplicada (mono/Archivo, iter-2) e o corretor refutou 4 subpontos da crítica com prova de
  fonte rasterizada via CDP. As duas partes recalibraram.
- Interrupção por limite de sessão durante a crítica da iter-3: estado estava em commit limpo,
  retomada sem perda (o crítico foi relançado do zero).
- 1 geração de imagem cobrada (2 créditos Higgsfield) sem resultado aproveitável (filtro).

## Pendências que dependem do humano (sem credenciais não há como concluir)

1. **Supabase**: criar o projeto, rodar as 3 migrations (SQL editor ou `supabase db push`),
   copiar as chaves, desativar signup público, ativar MFA, criar o usuário admin. Os 14 testes
   de RLS rodam automaticamente quando as envs existirem.
2. **GitHub**: criar o repositório, `git remote add` + push, ligar branch protection na `main`
   e 2FA.
3. **Vercel**: importar o repo, preencher as envs do `.env.example` (service role e Anthropic
   como server-only), conferir o cron diário em Settings → Crons, definir `CRON_SECRET`.
4. Fluxo de login por magic link validado com envs falsas (3 estados do /admin renderizam);
   o `exchangeCodeForSession` só é testável com projeto Supabase real.

## Ideias de v2 (NÃO implementadas — R7)

- OG image revalidada ao vivo (`outputFileTracingIncludes` + revalidate) em vez de por deploy.
- Fan chart da probabilidade no /historico quando houver semanas de `model_runs` acumuladas.
- Diff visual de aprovação também por e-mail (resumo diário para o admin).
- `web_search` versão 2026-02 (filtragem dinâmica) quando fixar o modelo do updater em 4.6+.
- Página /institutos com histórico de acerto por casa (dados de 2018/2022 já estão no repo).

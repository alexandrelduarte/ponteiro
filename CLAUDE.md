# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Agregador de pesquisas presidenciais Brasil 2026 (Lula × Flávio Bolsonaro): Next.js 16
(App Router, React 19, TS strict) + Tailwind v4 + Supabase + Recharts, deploy na Vercel.
O protótipo `agregador-presidencial-2026.jsx` na raiz é a **fonte da verdade** do modelo
estatístico, dos dados e dos textos editoriais — não é código do app (está fora de lint/tsc).

## Comandos

```bash
pnpm dev          # dev server (Turbopack)
pnpm build        # build de produção
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm test         # vitest (unidade + golden tests do modelo)
pnpm test:watch   # vitest watch; um teste: pnpm vitest run tests/modelo.golden.test.ts
pnpm e2e          # playwright (requer build antes p/ smoke completo)
pnpm format       # prettier --write
```

Gates antes de qualquer commit: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.

## Regras inegociáveis (resumo de R1–R8)

- **R1** Nenhum segredo no cliente: `ANTHROPIC_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são
  server-only; chamadas à Anthropic só em route handler/cron.
- **R2** Público só lê: RLS em todas as tabelas, zero policies de escrita; escrita apenas via
  service role no servidor, após checagem de admin, com registro em `audit_log`.
- **R3** Pesquisas achadas pela IA nascem `pendente`; só admin aprova (no `/admin`). Não existe
  gatilho público de atualização.
- **R4** Neutralidade absoluta: simetria visual entre candidatos; nenhuma imagem de
  pessoa/partido/bandeira; registros TSE e fontes sempre visíveis.
- **R5** Simulações (adicionar/remover pesquisa, sliders) são estado local rotulado
  "simulação" — nunca tocam a base oficial.
- **R6** Decisões ambíguas: decidir com bom senso e registrar em `DECISOES.md`.
- **R7** Anti-desperdício: sem troca de biblioteca, sem refatoração sem efeito perceptível.
  Conventional Commits, um por marco.
- **R8** Degradação graciosa: o site builda e roda SEM envs do Supabase (fallback para o seed
  em `src/data/`); falha de rede nunca derruba a página.

## Arquitetura

- `src/data/` — seeds e constantes extraídos do protótipo (paridade byte a byte; NÃO editar
  números sem registrar em DECISOES.md). `tipos.ts` tem os tipos compartilhados.
- `src/lib/modelo/` — porte TS puro do modelo estatístico. **Intocável numericamente**: golden
  tests em `tests/` comparam com as funções originais (`tests/reference/original.mjs`, cópia
  verbatim do .jsx) com tolerância 1e-9. Nunca "melhorar" a matemática; bug real → DECISOES.md.
  `rodarModelo(pesquisas, params, hojeMs)` é determinístico (`hojeMs` explícito).
- `src/lib/dados.ts` — camada de dados: Supabase quando envs existem, senão seed local (R8).
- `src/lib/updater.ts` — coletor server-only (Anthropic + web_search). A resposta da IA é
  entrada HOSTIL: Zod estrito, sanidade (valores 20–70, datas coerentes, URL https:), dedup
  por (instituto, campo_fim), bruto guardado para forense, insere como `pendente`.
- `supabase/migrations/` — schema versionado (RLS default-deny; ver SECURITY.md).
- `src/app/` — App Router: `/` painel, `/historico`, `/metodologia`, `/admin`; tokens de design
  em `src/app/tokens.css` (Tailwind v4 `@theme`) — zero hex hardcoded em componente.
- Identidade visual: "boletim de urna" — papel #E8E8DF, tela fósforo verde, IBM Plex Mono para
  dados, Archivo para títulos (self-host via next/font). Ver `docs/DESIGN.md`.

## Convenções

- pt-BR em toda a UI; números com vírgula decimal; timezone America/Sao_Paulo (date-fns-tz).
- Server Components por padrão; client só onde há interatividade; números-manchete no HTML do
  servidor.
- Zod é a única fronteira de entrada de dados externos (IA, forms).
- Links externos: `rel="noopener noreferrer"`. Zero `dangerouslySetInnerHTML`.
- `docs/INVENTARIO.md` é o checklist de paridade com o protótipo; `DECISOES.md` registra toda
  decisão ambígua (contexto → decisão → porquê).

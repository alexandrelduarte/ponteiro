/**
 * Identidade do site usada em metadata, OG, sitemap e JSON-LD.
 * Pasta `_lib` é privada para o App Router (o underscore impede que vire rota).
 *
 * A marca é PONTEIRO (docs/MARCA.md). O nome antigo, "Agregador Presidencial
 * 2026", foi rebaixado a DESCRIÇÃO: sobrevive em `NOME_DESCRITIVO` (usado no
 * `alternateName` do JSON-LD e no texto de busca) e em lugar nenhum da tela —
 * "agregador" é palavra banida na superfície pública (docs/VOZ.md §5.1).
 */

/** URL canônica, sem barra final. Sem env, cai para localhost (R8: build não quebra). */
export const URL_SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

export const NOME_SITE = "PONTEIRO";

export const TAGLINE = "Para onde apontam as pesquisas.";

/** Só para metadado e busca — nunca renderizado como texto de tela. */
export const NOME_DESCRITIVO = "Agregador de pesquisas presidenciais 2026";

export const TITULO_PADRAO = "PONTEIRO — Lula × Flávio Bolsonaro";

export const DESCRICAO_PADRAO =
  "PONTEIRO: para onde apontam as pesquisas registradas no TSE para a eleição presidencial " +
  "de 2026. Em 100 eleições parecidas com esta, em quantas cada candidato termina eleito — " +
  "com a diferença medida, a dúvida do dia e as suposições à vista. Não é previsão.";

/** Rotas públicas — fonte única para sitemap e navegação de rodapé. */
export const ROTAS = [
  { href: "/", titulo: "Painel", prioridade: 1 },
  { href: "/historico", titulo: "O que já mudou", prioridade: 0.7 },
  { href: "/metodologia", titulo: "Metodologia", prioridade: 0.6 },
] as const;

/**
 * Rotas institucionais — quem faz o site e a política de privacidade.
 * FORA de `ROTAS` de propósito: a barra fixa tem três itens por medida
 * (DESIGN-V2), então estas páginas vivem só no rodapé e no sitemap.
 */
export const ROTAS_INSTITUCIONAIS = [
  { href: "/quem-somos", titulo: "Quem faz o PONTEIRO", prioridade: 0.3 },
  { href: "/privacidade", titulo: "Privacidade", prioridade: 0.3 },
] as const;

/**
 * Identidade do site usada em metadata, OG, sitemap e JSON-LD.
 * Pasta `_lib` é privada para o App Router (o underscore impede que vire rota).
 */

/** URL canônica, sem barra final. Sem env, cai para localhost (R8: build não quebra). */
export const URL_SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

export const NOME_SITE = "Agregador Presidencial 2026";

export const TITULO_PADRAO = "Agregador Presidencial 2026 — Lula × Flávio Bolsonaro";

export const DESCRICAO_PADRAO =
  "Agregado das pesquisas registradas no TSE para a eleição presidencial de 2026: " +
  "média ponderada por recência e amostra, tendência pareada por instituto e probabilidade " +
  "de eleição no cenário atual e projetada para o dia da votação. Leitura dos dados, não previsão.";

/** Rotas públicas — fonte única para sitemap e navegação de rodapé. */
export const ROTAS = [
  { href: "/", titulo: "Painel", prioridade: 1 },
  { href: "/historico", titulo: "Histórico e transparência", prioridade: 0.7 },
  { href: "/metodologia", titulo: "Metodologia", prioridade: 0.6 },
] as const;

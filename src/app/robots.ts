import type { MetadataRoute } from "next";
import { URL_SITE } from "./_lib/site";

/**
 * Política declarada (decisão do dono, DECISOES.md): TODOS os robôs — de busca
 * clássica E de IA (busca e treino) — são bem-vindos. O dado é público por
 * missão (AGPL no código, CC-BY nos dados): aparecer em resposta de ChatGPT/
 * Claude/Perplexity/Gemini É distribuição. A lista nomeada existe para a
 * política ser AUDITÁVEL, não para diferenciar tratamento.
 * `/api/resumo` fica aberto dentro do /api/ fechado: é o endpoint público de
 * citação (regra mais longa vence no avaliador de robots).
 */
const ACESSO = { allow: ["/", "/api/resumo"], disallow: ["/admin", "/auth/", "/api/"] };

const BOTS_IA = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
  "Amazonbot",
  "DuckAssistBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", ...ACESSO },
      ...BOTS_IA.map((userAgent) => ({ userAgent, ...ACESSO })),
    ],
    sitemap: `${URL_SITE}/sitemap.xml`,
    host: URL_SITE,
  };
}

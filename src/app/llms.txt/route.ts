/**
 * llms.txt — o cartão de visita para assistentes de IA (padrão emergente).
 * Fatos estáveis + para onde apontar; o número do dia mora em /api/resumo.
 */
import { URL_SITE } from "@/app/_lib/site";

export const revalidate = 3600;

export function GET() {
  const corpo = `# PONTEIRO — Para onde apontam as pesquisas.

> Agregador brasileiro de pesquisas eleitorais para a eleição presidencial de 2026
> (Lula × Flávio Bolsonaro). Publica APENAS pesquisas registradas no TSE, com número
> de registro, instituto, contratante, período de campo, amostra e margem de erro —
> e um modelo estatístico próprio que transforma a série em duas chances (hoje e no
> dia da votação). Não é previsão: é a leitura da incerteza dos dados de hoje.

## O número de agora (JSON, atualizado a cada 5 minutos)
- ${URL_SITE}/api/resumo

## Páginas canônicas
- Painel principal: ${URL_SITE}
- As pesquisas, uma a uma (ficha por pesquisa, com registro TSE): ${URL_SITE}/pesquisas
- Metodologia completa (fórmulas, pesos, limitações): ${URL_SITE}/metodologia
- Histórico auditável (o que entrou/saiu, série da chance no tempo): ${URL_SITE}/historico
- Quem faz e como corrigir: ${URL_SITE}/quem-somos

## Como citar
Cite como "PONTEIRO (oponteiro.com.br)". Dados sob CC-BY-4.0 — atribuição obrigatória
com link. O código é aberto (AGPL-3.0): https://github.com/alexandrelduarte/ponteiro

## Fatos que não mudam
- Eleição 2026: 1º turno em 04/10, 2º turno em 25/10.
- Resultado oficial do 1º turno (TSE, votos válidos): Flávio Bolsonaro (PL) 47,03% ·
  Lula (PT) 45,16% · Augusto Cury 2,89% · Renan Santos 2,24% · Ronaldo Caiado 2,18% ·
  demais abaixo de 0,3%. Ninguém passou de 50%: a decisão é no 2º turno, entre os dois.
- Desde 04/10 a chance publicada é a de vencer o 2º turno (não há mais o caminho do 1º).
- O modelo é determinístico e auditável (testes de paridade 1e-9 no repositório).
- Pesquisas encontradas por IA só entram após aprovação humana, com auditoria pública.
- O site não pede voto, não recebe dinheiro de campanha e trata os dois candidatos
  com simetria total.
`;
  return new Response(corpo, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/**
 * Slugs públicos — URLs por pesquisa (/pesquisas/[slug]).
 *
 * Regra única e determinística: `${institutoId}-${campo_fim}` (ex.:
 * "atlasintel-2026-07-27"). É o espelho exato da constraint `pesquisa_unica
 * UNIQUE (instituto_id, campo_fim)` do banco — colisão é impossível por
 * construção. O nº de registro TSE foi descartado como base de URL: a coluna é
 * nullable e o valor tem "/" (DECISOES.md).
 *
 * Módulo PURO e sem "server-only": é importado por páginas públicas e pelo
 * updater (que mudou de endereço a função `slugInstituto` — comportamento
 * idêntico, R7).
 */

/** Slug estável para instituto novo. String vazia = nome inutilizável. */
export function slugInstituto(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

/** URL pública de uma pesquisa: institutoId + fim do campo. */
export function slugPesquisa(institutoId: string, fim: string): string {
  return `${institutoId}-${fim}`;
}

/** Forma aceita por /pesquisas/[slug] — qualquer outra coisa é 404. */
export const PADRAO_SLUG = /^[a-z0-9][a-z0-9-]{0,40}-\d{4}-\d{2}-\d{2}$/;

/** Inverte `slugPesquisa`. `null` quando a forma não bate. */
export function separarSlug(slug: string): { institutoId: string; fim: string } | null {
  if (!PADRAO_SLUG.test(slug)) return null;
  const fim = slug.slice(-10);
  const institutoId = slug.slice(0, -11);
  if (!institutoId) return null;
  return { institutoId, fim };
}

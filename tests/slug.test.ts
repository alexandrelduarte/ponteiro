/** Slugs públicos: determinismo, inversão e unicidade nas 13 do seed. */
import { describe, expect, it } from "vitest";
import { pesquisasDoSeed } from "@/lib/dados";
import { PADRAO_SLUG, separarSlug, slugPesquisa } from "@/lib/slug";

describe("slug público das pesquisas", () => {
  it("as 13 do seed têm slug único, válido e invertível", () => {
    const slugs = pesquisasDoSeed().map((p) => p.slug!);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) {
      expect(s).toMatch(PADRAO_SLUG);
      const partes = separarSlug(s)!;
      expect(slugPesquisa(partes.institutoId, partes.fim)).toBe(s);
    }
  });

  it("separarSlug rejeita formas fora do padrão", () => {
    for (const ruim of ["", "atlasintel", "2026-07-27", "a/b-2026-07-27", "UPPER-2026-07-27"]) {
      expect(separarSlug(ruim)).toBeNull();
    }
  });
});

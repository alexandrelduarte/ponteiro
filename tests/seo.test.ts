/** pingIndexNow: no-op sem env; nunca lança nem com a rede em chamas. */
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { pingIndexNow } from "@/lib/seo";

describe("pingIndexNow", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sem INDEXNOW_KEY não toca a rede", async () => {
    vi.stubEnv("INDEXNOW_KEY", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await pingIndexNow(["/"]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("com env, POSTa para o endpoint e NUNCA lança em falha", async () => {
    vi.stubEnv("INDEXNOW_KEY", "chave-teste");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://exemplo.com.br");
    const fetchSpy = vi.fn().mockRejectedValue(new Error("rede caiu"));
    vi.stubGlobal("fetch", fetchSpy);
    await expect(pingIndexNow(["/", "/pesquisas"])).resolves.toBeUndefined();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const corpo = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(corpo.host).toBe("exemplo.com.br");
    expect(corpo.urlList).toContain("https://exemplo.com.br/pesquisas");
  });
});

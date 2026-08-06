/**
 * Teste de contrato do RLS (R2): a chave anônima **só lê o que é público**.
 *
 * Este arquivo é o guarda-costas da regra "público só lê". Se alguém um dia
 * criar uma policy de escrita, ou afrouxar a leitura de `pesquisas`, um destes
 * testes quebra.
 *
 * Requer credenciais reais — roda apenas quando `NEXT_PUBLIC_SUPABASE_URL` e
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão no ambiente. Localmente:
 *
 *   env $(grep -v '^#' .env.local | xargs) pnpm vitest run tests/rls.test.ts
 *
 * Sem elas o bloco inteiro é pulado (com aviso), para o `pnpm test` continuar
 * verde em máquinas sem Supabase (R8).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CHAVE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SEM_CREDENCIAIS = !URL_SUPABASE || !CHAVE_ANON;

if (SEM_CREDENCIAIS) {
  console.warn(
    "\n[rls.test] PULADO: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY\n" +
      "           para validar de verdade as policies de RLS antes de publicar.\n",
  );
}

/** Escrita bloqueada = erro do Postgres OU nenhuma linha afetada. */
function escritaBloqueada(resultado: {
  error: { message: string } | null;
  data: unknown[] | null;
}): boolean {
  if (resultado.error) return true;
  return !resultado.data || resultado.data.length === 0;
}

describe.skipIf(SEM_CREDENCIAIS)("RLS — a chave anônima não escreve", () => {
  let anon: SupabaseClient;

  beforeAll(() => {
    anon = createClient(URL_SUPABASE as string, CHAVE_ANON as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  });

  it("não faz INSERT em institutos", async () => {
    const r = await anon
      .from("institutos")
      .insert({ id: "invasor", nome: "Invasor", aliases: [] })
      .select();
    expect(escritaBloqueada(r)).toBe(true);
  });

  it("não faz INSERT em pesquisas", async () => {
    const r = await anon
      .from("pesquisas")
      .insert({
        instituto_id: "atlasintel",
        campo_inicio: "2026-08-01",
        campo_fim: "2026-08-02",
        t2_lula: 50,
        t2_flavio: 40,
        status: "publicada",
        origem: "admin",
      })
      .select();
    expect(escritaBloqueada(r)).toBe(true);
  });

  it("não faz INSERT em model_runs", async () => {
    const r = await anon
      .from("model_runs")
      .insert({ gatilho: "manual", params: {}, n_pesquisas: 0, resultado: {} })
      .select();
    expect(escritaBloqueada(r)).toBe(true);
  });

  it("não faz INSERT em audit_log", async () => {
    const r = await anon
      .from("audit_log")
      .insert({ ator: "invasor", acao: "aprovacao", entidade: "pesquisa" })
      .select();
    expect(escritaBloqueada(r)).toBe(true);
  });

  it("não faz UPDATE em pesquisas", async () => {
    const r = await anon
      .from("pesquisas")
      .update({ t2_lula: 70 })
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .select();
    expect(escritaBloqueada(r)).toBe(true);
  });

  it("não faz UPDATE em institutos", async () => {
    const r = await anon
      .from("institutos")
      .update({ nome: "Invadido" })
      .neq("id", "__inexistente__")
      .select();
    expect(escritaBloqueada(r)).toBe(true);
  });

  it("não faz DELETE em pesquisas", async () => {
    const r = await anon
      .from("pesquisas")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .select();
    expect(escritaBloqueada(r)).toBe(true);
  });

  it("não faz DELETE em model_runs nem em audit_log", async () => {
    const runs = await anon.from("model_runs").delete().neq("gatilho", "__nada__").select();
    expect(escritaBloqueada(runs)).toBe(true);
    const audit = await anon.from("audit_log").delete().neq("ator", "__nada__").select();
    expect(escritaBloqueada(audit)).toBe(true);
  });
});

describe.skipIf(SEM_CREDENCIAIS)("RLS — a chave anônima só lê o que é público", () => {
  let anon: SupabaseClient;

  beforeAll(() => {
    anon = createClient(URL_SUPABASE as string, CHAVE_ANON as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  });

  it("não enxerga pesquisas pendentes nem rejeitadas", async () => {
    const { data, error } = await anon
      .from("pesquisas")
      .select("id,status")
      .in("status", ["pendente", "rejeitada"]);
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("toda pesquisa visível está publicada", async () => {
    const { data, error } = await anon.from("pesquisas").select("id,status").limit(200);
    expect(error).toBeNull();
    for (const linha of data ?? []) {
      expect((linha as { status: string }).status).toBe("publicada");
    }
  });

  it("não enxerga o campo bruto de pesquisas não publicadas", async () => {
    // `bruto` de pesquisa publicada pode aparecer (é o seed); o que não pode
    // vazar é a fila de pendentes — coberto acima. Aqui garantimos que não há
    // atalho por seleção explícita de coluna.
    const { data, error } = await anon
      .from("pesquisas")
      .select("bruto,status")
      .eq("status", "pendente");
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("não lê a tabela audit_log diretamente (migração 0003: sem policy de select)", async () => {
    const { data, error } = await anon.from("audit_log").select("acao,ator").limit(500);
    // Sem policy, o RLS devolve conjunto vazio (ou erro de permissão) — nunca linhas.
    if (error) {
      expect(error).toBeTruthy();
    } else {
      expect(data ?? []).toHaveLength(0);
    }
  });

  it("na view audit_publico só existem ações públicas e nenhuma coluna de ator", async () => {
    const publicas = ["aprovacao", "inclusao_manual", "remocao"];
    const { data, error } = await anon.from("audit_publico").select("*").limit(500);
    expect(error).toBeNull();
    for (const linha of data ?? []) {
      expect(publicas).toContain((linha as { acao: string }).acao);
      expect(Object.keys(linha as object)).not.toContain("ator");
    }
  });

  it("lê institutos e model_runs (dados públicos por desenho)", async () => {
    const institutos = await anon.from("institutos").select("id").limit(1);
    expect(institutos.error).toBeNull();
    const runs = await anon.from("model_runs").select("id").limit(1);
    expect(runs.error).toBeNull();
  });

  it("lê os pontos retroativos (mesma policy), mas não consegue inserir um", async () => {
    const leitura = await anon
      .from("model_runs")
      .select("id,gatilho")
      .eq("gatilho", "retroativo")
      .limit(1);
    expect(leitura.error).toBeNull();

    const escrita = await anon.from("model_runs").insert({
      executado_em: "2026-01-15T12:00:00Z",
      gatilho: "retroativo",
      params: {},
      n_pesquisas: 1,
      resultado: {},
    });
    expect(escrita.error).not.toBeNull();
  });
});

/**
 * Cliente Supabase **service role** — a única porta de escrita do sistema (R1/R2).
 *
 * `import "server-only"` faz o build quebrar se este módulo entrar em qualquer
 * bundle de cliente. A chave nunca é lida fora daqui e nunca é logada.
 *
 * Regra de uso: NENHUMA chamada a este cliente sem (a) checagem de admin ou
 * segredo de cron ANTES e (b) registro em `audit_log` DEPOIS.
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function envsAdmin(): { url: string; serviceKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

/** `true` quando a escrita no banco está disponível. */
export function adminConfigurado(): boolean {
  return envsAdmin() !== null;
}

let cliente: SupabaseClient | null = null;

/**
 * Cliente com service role. `null` quando não configurado — quem chama decide
 * entre 503 (rotas) e degradação silenciosa (leituras).
 */
export function criarClienteAdmin(): SupabaseClient | null {
  if (cliente) return cliente;
  const envs = envsAdmin();
  if (!envs) return null;
  cliente = createClient(envs.url, envs.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "x-application-name": "agregador-presidencial-2026/admin" } },
  });
  return cliente;
}

/** Igual a `criarClienteAdmin`, mas lança quando falta configuração. */
export function exigirClienteAdmin(): SupabaseClient {
  const c = criarClienteAdmin();
  if (!c) throw new Error("Supabase não configurado (service role ausente).");
  return c;
}

/**
 * Registra uma linha em `audit_log`. Nunca lança: uma falha de auditoria não
 * pode derrubar a ação já executada — ela é logada no servidor.
 */
export async function registrarAuditoria(entrada: {
  ator: string;
  acao: "auto_insercao" | "aprovacao" | "rejeicao" | "inclusao_manual" | "edicao" | "remocao";
  entidade: string;
  entidadeId?: string | null;
  detalhes?: Record<string, unknown> | null;
}): Promise<void> {
  const c = criarClienteAdmin();
  if (!c) return;
  const { error } = await c.from("audit_log").insert({
    ator: entrada.ator,
    acao: entrada.acao,
    entidade: entrada.entidade,
    entidade_id: entrada.entidadeId ?? null,
    detalhes: entrada.detalhes ?? null,
  });
  if (error) console.error("[auditoria] falha ao registrar:", error.message);
}

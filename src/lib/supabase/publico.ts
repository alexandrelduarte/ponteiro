/**
 * Cliente Supabase **anônimo** — leitura pública (Server Components, ISR, build).
 *
 * Só enxerga o que as policies de RLS liberam: institutos, pesquisas com
 * `status = 'publicada'`, model_runs e as ações públicas do audit_log.
 * Não existe policy de escrita em nenhuma tabela; toda escrita passa pelo
 * service role (`./admin`) depois da checagem de admin (R2).
 *
 * R8 — degradação graciosa: sem as envs o construtor devolve `null` e a camada
 * de dados cai para o seed local. Nada aqui lança.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Envs públicas do Supabase, ou `null` quando o projeto roda só com o seed local. */
export function envsPublicas(): { url: string; anonKey: string } | null {
  // Acesso literal a process.env.NEXT_PUBLIC_* — o Next só substitui esta forma.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/** `true` quando há Supabase configurado (não garante que a rede responde). */
export function supabaseConfigurado(): boolean {
  return envsPublicas() !== null;
}

let cliente: SupabaseClient | null = null;

/**
 * Cliente anônimo compartilhado no processo. `null` quando não há envs.
 *
 * Sem sessão persistida e sem refresh automático: este cliente é usado em
 * Server Components, onde não existe usuário — quem precisa da sessão usa
 * `./sessao`.
 */
export function criarClientePublico(): SupabaseClient | null {
  if (cliente) return cliente;
  const envs = envsPublicas();
  if (!envs) return null;
  cliente = createClient(envs.url, envs.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "x-application-name": "agregador-presidencial-2026" } },
  });
  return cliente;
}

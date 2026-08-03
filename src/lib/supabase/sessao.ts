/**
 * Sessão do usuário (Supabase Auth) no servidor, via cookies — usado por
 * `/admin` e pelas Server Actions.
 *
 * Este cliente usa a chave **anônima**: ele só sabe QUEM é o usuário. Ele não
 * é a autorização — a lista de admins vive em `ADMIN_EMAILS` e é conferida em
 * `@/lib/admin/auth` (nunca no cliente, nunca por claim vinda do navegador).
 *
 * R8: sem envs do Supabase não há login possível; tudo devolve `null` e o
 * `/admin` mostra o estado desconectado em vez de quebrar o build.
 */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { envsPublicas } from "./publico";

/**
 * Cria um cliente ligado aos cookies da requisição. Um por render — nunca
 * compartilhe entre requisições (vazaria sessão entre usuários).
 */
export async function criarClienteSessao(): Promise<SupabaseClient | null> {
  const envs = envsPublicas();
  if (!envs) return null;

  const armazem = await cookies();

  return createServerClient(envs.url, envs.anonKey, {
    cookies: {
      getAll() {
        return armazem.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesParaGravar) {
        try {
          for (const { name, value, options } of cookiesParaGravar) {
            armazem.set(name, value, options);
          }
        } catch {
          // Server Components não podem gravar cookies. O refresh de token é
          // feito pelo route handler/middleware de auth; ignorar aqui é o
          // comportamento recomendado pelo @supabase/ssr.
        }
      },
    },
  });
}

/** Identidade mínima do usuário logado — nada além do necessário. */
export interface UsuarioSessao {
  id: string;
  email: string;
}

/**
 * Usuário autenticado da requisição, validado contra o servidor do Supabase
 * (`getUser`, não `getSession`: o cookie sozinho não é prova). `null` quando
 * não há login, o token é inválido ou o Supabase não está configurado.
 */
export async function getUsuario(): Promise<UsuarioSessao | null> {
  const supabase = await criarClienteSessao();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email) return null;
    return { id: data.user.id, email: data.user.email };
  } catch {
    // Falha de rede não pode derrubar a página (R8).
    return null;
  }
}

/** Encerra a sessão do usuário atual. Nunca lança. */
export async function encerrarSessao(): Promise<void> {
  const supabase = await criarClienteSessao();
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch {
    /* silencioso: já estamos saindo */
  }
}

/**
 * Autorização do `/admin` — decidida SEMPRE no servidor.
 *
 * A sessão do Supabase diz apenas *quem* é o usuário; quem pode publicar está
 * em `ADMIN_EMAILS` (env do servidor). Nenhum claim, cookie ou campo vindo do
 * navegador concede privilégio.
 *
 * Default-deny: sem `ADMIN_EMAILS` configurado, ninguém é admin.
 */
import "server-only";
import { getUsuario, type UsuarioSessao } from "@/lib/supabase/sessao";

/** Erro de autorização — mensagem neutra, sem revelar quem/por quê. */
export class ErroAutorizacao extends Error {
  constructor(mensagem = "Ação restrita a administradores.") {
    super(mensagem);
    this.name = "ErroAutorizacao";
  }
}

/** E-mails autorizados, normalizados (minúsculas, sem espaços). */
export function listaAdmins(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0 && e.includes("@"));
}

function autorizado(email: string): boolean {
  const admins = listaAdmins();
  if (admins.length === 0) return false;
  return admins.includes(email.trim().toLowerCase());
}

/**
 * Usuário admin da requisição, ou `null`. Use na página para escolher entre
 * o painel e a tela de login — nunca como única barreira (ver `exigirAdmin`).
 */
export async function getAdmin(): Promise<UsuarioSessao | null> {
  const usuario = await getUsuario();
  if (!usuario?.email) return null;
  return autorizado(usuario.email) ? usuario : null;
}

/** Versão booleana, para renderização condicional. */
export async function ehAdmin(): Promise<boolean> {
  return (await getAdmin()) !== null;
}

/**
 * Exige admin e devolve o ator para o `audit_log`. Lança `ErroAutorizacao`
 * quando não há sessão válida ou o e-mail não está na lista.
 *
 * **Chame no corpo de TODA Server Action** (defesa em profundidade): middleware
 * e checagem na página não protegem uma action invocada diretamente.
 */
export async function exigirAdmin(): Promise<UsuarioSessao> {
  const admin = await getAdmin();
  if (!admin) throw new ErroAutorizacao();
  return admin;
}

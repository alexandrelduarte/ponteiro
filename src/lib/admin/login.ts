"use server";

/**
 * Login do /admin por magic link (Supabase Auth).
 *
 * Regras de segurança desta porta:
 *  1. o link só é ENVIADO para e-mails que estão em `ADMIN_EMAILS`. Ninguém
 *     mais consegue criar conta no projeto por aqui;
 *  2. a resposta é a MESMA para e-mail autorizado e não autorizado — não existe
 *     enumeração de administradores a partir da tela de login;
 *  3. cooldown por e-mail para não transformar o formulário em máquina de spam;
 *  4. autorização de verdade continua sendo decidida no servidor a cada request
 *     (`exigirAdmin`): a sessão só diz QUEM é o usuário.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { listaAdmins } from "@/lib/admin/auth";
import { supabaseConfigurado } from "@/lib/supabase/publico";
import { criarClienteSessao, encerrarSessao } from "@/lib/supabase/sessao";

export type ResultadoLogin = { ok: true; mensagem: string } | { ok: false; erro: string };

const RESPOSTA_NEUTRA =
  "Se este e-mail estiver autorizado, o link de acesso chega em instantes. " +
  "Confira também a caixa de spam — o link vale por 1 hora e só pode ser usado uma vez.";

const esquemaEmail = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, "Informe um e-mail válido.")
  .max(254, "Informe um e-mail válido.")
  .email("Informe um e-mail válido.");

/** Cooldown em memória (por instância) — barra o clique repetido, não é rate limit distribuído. */
const ultimoEnvio = new Map<string, number>();
const INTERVALO_MS = 60_000;

/** URL absoluta de retorno do magic link. */
async function origemDaRequisicao(): Promise<string> {
  const doAmbiente = process.env.NEXT_PUBLIC_SITE_URL;
  if (doAmbiente) return doAmbiente.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocolo = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}

export async function enviarMagicLink(email: string): Promise<ResultadoLogin> {
  if (!supabaseConfigurado()) {
    return { ok: false, erro: "Login indisponível: este ambiente roda sem banco configurado." };
  }

  const analisado = esquemaEmail.safeParse(email);
  if (!analisado.success) {
    return { ok: false, erro: analisado.error.issues[0]?.message ?? "Informe um e-mail válido." };
  }
  const alvo = analisado.data;

  const agora = Date.now();
  const anterior = ultimoEnvio.get(alvo) ?? 0;
  if (agora - anterior < INTERVALO_MS) {
    const faltam = Math.ceil((INTERVALO_MS - (agora - anterior)) / 1000);
    return { ok: false, erro: `Aguarde ${faltam}s antes de pedir outro link.` };
  }
  ultimoEnvio.set(alvo, agora);

  // Fora da lista: resposta idêntica, e-mail nenhum enviado, conta nenhuma criada.
  if (!listaAdmins().includes(alvo)) {
    return { ok: true, mensagem: RESPOSTA_NEUTRA };
  }

  try {
    const supabase = await criarClienteSessao();
    if (!supabase) {
      return { ok: false, erro: "Login indisponível: este ambiente roda sem banco configurado." };
    }
    const origem = await origemDaRequisicao();
    const { error } = await supabase.auth.signInWithOtp({
      email: alvo,
      options: { emailRedirectTo: `${origem}/auth/callback`, shouldCreateUser: true },
    });
    if (error) throw new Error(error.message);
    return { ok: true, mensagem: RESPOSTA_NEUTRA };
  } catch (erro) {
    console.error("[admin] falha ao enviar magic link:", erro);
    return { ok: false, erro: "Não foi possível enviar o link agora. Tente de novo em instantes." };
  }
}

/** Encerra a sessão e volta para a tela de login. */
export async function sair(): Promise<void> {
  await encerrarSessao();
  revalidatePath("/admin");
  redirect("/admin");
}

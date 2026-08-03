/**
 * Troca o código do magic link por uma sessão e grava os cookies.
 *
 * Precisa ser um Route Handler: Server Components não podem escrever cookies,
 * então este é o único ponto do sistema onde a sessão é materializada.
 * Aceita os dois formatos que o Supabase pode emitir: `?code=` (PKCE, padrão do
 * @supabase/ssr) e `?token_hash=&type=` (link de verificação clássico).
 */
import { NextResponse } from "next/server";
import { criarClienteSessao } from "@/lib/supabase/sessao";
import type { EmailOtpType } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIPOS: EmailOtpType[] = [
  "magiclink",
  "email",
  "signup",
  "recovery",
  "invite",
  "email_change",
];

export async function GET(requisicao: Request) {
  const url = new URL(requisicao.url);
  const destino = new URL("/admin", url.origin);

  const supabase = await criarClienteSessao();
  if (!supabase) {
    destino.searchParams.set("erro", "sem-configuracao");
    return NextResponse.redirect(destino);
  }

  try {
    const code = url.searchParams.get("code");
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw new Error(error.message);
      return NextResponse.redirect(destino);
    }

    const tokenHash = url.searchParams.get("token_hash");
    const tipoBruto = url.searchParams.get("type");
    const tipo = TIPOS.find((t) => t === tipoBruto);
    if (tokenHash && tipo) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo });
      if (error) throw new Error(error.message);
      return NextResponse.redirect(destino);
    }
  } catch (erro) {
    console.error("[auth] falha ao concluir o login:", erro);
  }

  destino.searchParams.set("erro", "login");
  return NextResponse.redirect(destino);
}

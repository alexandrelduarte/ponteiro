/**
 * Reconstituição retroativa da série do /historico — disparo deliberado
 * (curl no deploy; o reuso do dia a dia é o botão do /admin).
 *
 * NÃO é cron agendado: não está no `vercel.json`. POST porque muda estado;
 * mesmas guardas do cron real (Bearer CRON_SECRET em tempo constante, 503
 * fechado sem segredo, 401 de corpo vazio, guarda contra disparo duplo).
 * A operação em si é idempotente (`executarReconstituicao` apaga e regrava
 * só os pontos `retroativo`).
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { CADENCIA_PADRAO, executarReconstituicao } from "@/lib/reconstituir";
import { adminConfigurado } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SEM_CACHE = { "Cache-Control": "no-store, max-age=0" } as const;

const esquemaCorpo = z.object({ cadencia: z.enum(["diaria", "semanal"]).optional() });

function segredoConfere(recebido: string, esperado: string): boolean {
  const a = createHash("sha256").update(recebido, "utf8").digest();
  const b = createHash("sha256").update(esperado, "utf8").digest();
  return timingSafeEqual(a, b);
}

let emExecucao = false;

export async function POST(requisicao: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) {
    return NextResponse.json({ erro: "serviço indisponível" }, { status: 503, headers: SEM_CACHE });
  }

  const autorizacao = requisicao.headers.get("authorization") ?? "";
  if (!segredoConfere(autorizacao, `Bearer ${segredo}`)) {
    return NextResponse.json({}, { status: 401, headers: SEM_CACHE });
  }

  if (!adminConfigurado()) {
    return NextResponse.json({ erro: "serviço indisponível" }, { status: 503, headers: SEM_CACHE });
  }

  if (emExecucao) {
    return NextResponse.json(
      { erro: "execução já em andamento" },
      { status: 409, headers: SEM_CACHE },
    );
  }
  emExecucao = true;

  try {
    let corpo: unknown = {};
    try {
      const texto = await requisicao.text();
      corpo = texto ? JSON.parse(texto) : {};
    } catch {
      return NextResponse.json({ erro: "corpo inválido" }, { status: 422, headers: SEM_CACHE });
    }
    const analisado = esquemaCorpo.safeParse(corpo);
    if (!analisado.success) {
      return NextResponse.json({ erro: "corpo inválido" }, { status: 422, headers: SEM_CACHE });
    }

    const resumo = await executarReconstituicao("cron", analisado.data.cadencia ?? CADENCIA_PADRAO);
    if (!resumo.ok) {
      return NextResponse.json({ erro: resumo.motivo }, { status: 500, headers: SEM_CACHE });
    }
    revalidatePath("/historico");
    return NextResponse.json(resumo, { headers: SEM_CACHE });
  } finally {
    emExecucao = false;
  }
}

export function GET() {
  return NextResponse.json(
    { erro: "use POST" },
    { status: 405, headers: { ...SEM_CACHE, Allow: "POST" } },
  );
}

/**
 * Cron diário (Vercel Cron → `vercel.json`).
 *
 * Faz duas coisas, nesta ordem:
 *  1. roda o coletor — pesquisas novas entram como `pendente` (R3);
 *  2. grava SEMPRE o snapshot do dia, mesmo sem pesquisa nova, para o gráfico
 *     de probabilidade no tempo não ter buracos.
 *
 * Segurança:
 *  - único gatilho é `Authorization: Bearer $CRON_SECRET`, comparado em tempo
 *    constante (hash + timingSafeEqual) para não vazar o segredo por timing;
 *  - falha de auth → 401 com corpo vazio: nada de "segredo errado" vs
 *    "segredo ausente";
 *  - sem `CRON_SECRET` a rota fica fechada (503) em vez de aberta;
 *  - GET/HEAD e afins → 405: não existe gatilho por navegação.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { gravarSnapshot } from "@/lib/snapshot";
import { rodarUpdater } from "@/lib/updater";
import { adminConfigurado } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SEM_CACHE = { "Cache-Control": "no-store, max-age=0" } as const;

/** Comparação em tempo constante e independente do comprimento. */
function segredoConfere(recebido: string, esperado: string): boolean {
  const a = createHash("sha256").update(recebido, "utf8").digest();
  const b = createHash("sha256").update(esperado, "utf8").digest();
  return timingSafeEqual(a, b);
}

/** Guarda contra disparo duplo na mesma instância (o cron às vezes repete). */
let emExecucao = false;

/** O Vercel Cron invoca por GET com `Authorization: Bearer ${CRON_SECRET}`. */
export async function GET(requisicao: Request) {
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
    const coleta = await rodarUpdater("cron");
    // O snapshot é gravado mesmo que a coleta falhe: a série do dia não pode
    // depender da IA estar de pé.
    const snapshot = await gravarSnapshot("cron");

    return NextResponse.json(
      {
        ok: true,
        coleta: {
          encontradas: coleta.encontradas,
          inseridas: coleta.inseridas,
          rejeitadas: coleta.rejeitadas,
          institutosNovos: coleta.institutosNovos,
          ...(coleta.erro ? { erro: coleta.erro } : {}),
        },
        snapshot,
      },
      { status: 200, headers: SEM_CACHE },
    );
  } catch (erro) {
    console.error("[cron] falha inesperada:", erro);
    return NextResponse.json(
      { erro: "falha ao executar a atualização" },
      { status: 500, headers: SEM_CACHE },
    );
  } finally {
    emExecucao = false;
  }
}

export async function POST() {
  return NextResponse.json(
    { erro: "método não permitido" },
    { status: 405, headers: { ...SEM_CACHE, Allow: "GET" } },
  );
}

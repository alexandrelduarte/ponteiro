/**
 * Snapshot do modelo — congela em `model_runs` o resultado de `rodarModelo`
 * sobre a série publicada no momento.
 *
 * É o que alimenta o gráfico "probabilidade no tempo" e o que torna cada
 * número do painel auditável depois: quem quiser conferir vê os params, o
 * número de pesquisas e a saída completa daquele instante.
 *
 * Determinismo: `hojeMs` é passado explicitamente (o modelo nunca lê o relógio).
 */
import "server-only";
import { PARAMS_PADRAO } from "@/data/constantes";
import { getPesquisasPublicadas } from "@/lib/dados";
import { rodarModelo } from "@/lib/modelo";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export type GatilhoSnapshot = "cron" | "aprovacao" | "manual" | "deploy";

export interface ResultadoSnapshot {
  gravado: boolean;
  id?: string;
  nPesquisas?: number;
  motivo?: string;
}

/**
 * Torna a saída do modelo segura para `jsonb`: NaN/Infinity viram `null`
 * (JSON não os representa) em vez de estourar a serialização mais tarde.
 */
function serializavel(valor: unknown): unknown {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  if (Array.isArray(valor)) return valor.map(serializavel);
  if (valor && typeof valor === "object") {
    const saida: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
      saida[k] = serializavel(v);
    }
    return saida;
  }
  if (valor === undefined) return null;
  return valor;
}

/**
 * Roda o modelo com os parâmetros padrão sobre a série publicada e grava o
 * resultado. Nunca lança: devolve `{ gravado: false, motivo }`.
 */
export async function gravarSnapshot(gatilho: GatilhoSnapshot): Promise<ResultadoSnapshot> {
  const supabase = criarClienteAdmin();
  if (!supabase) return { gravado: false, motivo: "banco não configurado" };

  try {
    const pesquisas = await getPesquisasPublicadas();
    if (!pesquisas.length) return { gravado: false, motivo: "série vazia" };

    const resultado = rodarModelo(pesquisas, PARAMS_PADRAO, Date.now());
    if (!resultado) return { gravado: false, motivo: "modelo sem saída para esta série" };

    const { data, error } = await supabase
      .from("model_runs")
      .insert({
        gatilho,
        params: PARAMS_PADRAO,
        n_pesquisas: pesquisas.length,
        resultado: serializavel(resultado),
      })
      .select("id")
      .single();

    if (error) {
      console.error("[snapshot] falha ao gravar:", error.message);
      return { gravado: false, motivo: "falha ao gravar o snapshot" };
    }

    return { gravado: true, id: data?.id as string | undefined, nPesquisas: pesquisas.length };
  } catch (erro) {
    console.error("[snapshot] erro inesperado:", erro);
    return { gravado: false, motivo: "erro inesperado ao rodar o modelo" };
  }
}

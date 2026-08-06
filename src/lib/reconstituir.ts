/**
 * Reconstituição retroativa da série de chance (/historico).
 *
 * O painel nasceu em agosto/2026, mas `rodarModelo` é puro e determinístico:
 * dá para responder "o que o painel teria mostrado no dia X?" rodando o modelo
 * com `hojeMs = X` e com APENAS as pesquisas conhecidas até X. O resultado
 * vira snapshot em `model_runs` com `gatilho='retroativo'` — e o gráfico o
 * desenha TRACEJADO, nunca como registro ao vivo (H11/H14; DECISOES.md).
 *
 * Duas regras não-negociáveis:
 *  - O filtro `p.fim <= data` é OBRIGATÓRIO antes de chamar o modelo: o
 *    agregado do 2º turno não exclui pesquisas futuras sozinho (idadeDias tem
 *    `Math.max(0, …)` — uma pesquisa do futuro entraria com peso máximo).
 *  - "Conhecida" = trabalho de campo encerrado (`campo_fim`). A divulgação
 *    real vem dias depois; a copy do gráfico declara essa ressalva.
 *
 * Idempotente por construção: apaga TODOS os `retroativo` e regrava. Nunca
 * toca snapshots de outros gatilhos.
 */
import "server-only";
import { PARAMS_PADRAO } from "@/data/constantes";
import type { ParamsModelo, Pesquisa } from "@/data/tipos";
import { getPesquisasPublicadasDoBanco } from "@/lib/dados";
import { rodarModelo, type ResultadoModelo } from "@/lib/modelo";
import { serializavel } from "@/lib/snapshot";
import { criarClienteAdmin, registrarAuditoria } from "@/lib/supabase/admin";
import { hojeSaoPaulo } from "@/lib/updater";

export type Cadencia = "diaria" | "semanal";

/** Decisão do dono: diária (o tracejado tem a densidade da linha viva). */
export const CADENCIA_PADRAO: Cadencia = "diaria";

/** Mesma hora do cron real (12:00Z = 09:00 em Brasília; sem horário de verão). */
export const HORA_SNAPSHOT = "T09:00:00-03:00";

/** Teto de sanidade: mais que isso é erro de intervalo, não série legítima. */
export const TETO_PONTOS = 400;

const DIA_MS = 86_400_000;

/** `ms` do meio-dia UTC de uma data ISO — âncora estável para aritmética de dias. */
function meioDiaUTC(iso: string): number {
  return Date.parse(`${iso}T12:00:00Z`);
}

function paraISO(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Datas-alvo (ISO, ascendente), do primeiro `fim` conhecido até a VÉSPERA da
 * fronteira (exclusive — o dia da fronteira já tem registro ao vivo). Pura.
 * `semanal` inclui sempre a véspera, para o tracejado encostar na linha cheia.
 */
export function gerarDatasAlvo(
  primeiroFimISO: string,
  fronteiraISO: string,
  cadencia: Cadencia,
): string[] {
  const inicio = meioDiaUTC(primeiroFimISO);
  const vespera = meioDiaUTC(fronteiraISO) - DIA_MS;
  if (!Number.isFinite(inicio) || !Number.isFinite(vespera) || vespera < inicio) return [];

  const passo = cadencia === "diaria" ? DIA_MS : 7 * DIA_MS;
  const datas: string[] = [];
  for (let t = inicio; t <= vespera; t += passo) datas.push(paraISO(t));
  const vesperaISO = paraISO(vespera);
  if (datas[datas.length - 1] !== vesperaISO) datas.push(vesperaISO);

  if (datas.length > TETO_PONTOS) {
    throw new Error(`intervalo gera ${datas.length} pontos (> ${TETO_PONTOS})`);
  }
  return datas;
}

export interface PontoReconstituido {
  /** ISO UTC de `${data}${HORA_SNAPSHOT}` — `executado_em` explícito no insert. */
  executadoEm: string;
  /** Nº de pesquisas conhecidas na data (após o filtro). */
  nPesquisas: number;
  resultado: ResultadoModelo;
}

/**
 * Núcleo PURO e determinístico: nem relógio, nem I/O. Datas sem pesquisa
 * conhecida (antes da 1ª da série) ou sem saída do modelo são puladas —
 * nenhum ponto é fabricado.
 */
export function reconstituirSerie(
  pesquisas: readonly Pesquisa[],
  params: ParamsModelo,
  datasAlvo: readonly string[],
): PontoReconstituido[] {
  const pontos: PontoReconstituido[] = [];
  for (const data of datasAlvo) {
    const conhecidas = pesquisas.filter((p) => p.fim <= data);
    if (!conhecidas.length) continue;
    const hojeMs = Date.parse(`${data}${HORA_SNAPSHOT}`);
    const resultado = rodarModelo(conhecidas, params, hojeMs);
    if (!resultado) continue;
    pontos.push({
      executadoEm: new Date(hojeMs).toISOString(),
      nPesquisas: conhecidas.length,
      resultado,
    });
  }
  return pontos;
}

export interface ResumoReconstituicao {
  ok: boolean;
  apagados?: number;
  inseridos?: number;
  de?: string;
  ate?: string;
  motivo?: string;
}

const TAMANHO_LOTE = 50;

/**
 * Orquestra a reconstituição: lê a série DO BANCO (nunca do seed — gravar
 * snapshots derivados do seed local numa falha de rede reconstituiria uma
 * série que não é a oficial), apaga os retroativos, regrava em lotes e
 * audita. Nunca lança; devolve o resumo.
 *
 * Sem transação multi-statement no PostgREST: a ordem delete→insert + o índice
 * único parcial + a idempotência (re-executar cura) fazem o papel. O chamador
 * garante a guarda (admin OU segredo de cron) ANTES.
 */
export async function executarReconstituicao(
  ator: string,
  cadencia: Cadencia = CADENCIA_PADRAO,
): Promise<ResumoReconstituicao> {
  const supabase = criarClienteAdmin();
  if (!supabase) return { ok: false, motivo: "banco não configurado" };

  try {
    const pesquisas = await getPesquisasPublicadasDoBanco();
    if (!pesquisas?.length) return { ok: false, motivo: "série do banco indisponível" };

    // Fronteira: o 1º snapshot REGISTRADO (qualquer gatilho que não seja
    // retroativo). Sem nenhum, reconstitui até ontem.
    const { data: primeiros, error: erroFronteira } = await supabase
      .from("model_runs")
      .select("executado_em")
      .neq("gatilho", "retroativo")
      .order("executado_em", { ascending: true })
      .limit(1)
      .returns<{ executado_em: string }[]>();
    if (erroFronteira) return { ok: false, motivo: "falha ao ler a fronteira" };
    const fronteiraISO = primeiros?.[0]
      ? new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/Sao_Paulo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(primeiros[0].executado_em))
      : hojeSaoPaulo();

    const primeiroFim = pesquisas.reduce((min, p) => (p.fim < min ? p.fim : min), pesquisas[0].fim);
    const datas = gerarDatasAlvo(primeiroFim, fronteiraISO, cadencia);
    if (!datas.length) return { ok: false, motivo: "nada a reconstituir" };

    const pontos = reconstituirSerie(pesquisas, PARAMS_PADRAO, datas);
    if (!pontos.length) return { ok: false, motivo: "modelo sem saída no intervalo" };

    const { data: apagadas, error: erroDelete } = await supabase
      .from("model_runs")
      .delete()
      .eq("gatilho", "retroativo")
      .select("id")
      .returns<{ id: string }[]>();
    if (erroDelete) return { ok: false, motivo: "falha ao limpar a série retroativa" };

    for (let i = 0; i < pontos.length; i += TAMANHO_LOTE) {
      const lote = pontos.slice(i, i + TAMANHO_LOTE).map((p) => ({
        executado_em: p.executadoEm,
        gatilho: "retroativo",
        params: PARAMS_PADRAO,
        n_pesquisas: p.nPesquisas,
        resultado: serializavel(p.resultado),
      }));
      const { error: erroInsert } = await supabase.from("model_runs").insert(lote);
      if (erroInsert) {
        console.error("[reconstituir] insert falhou:", erroInsert.message);
        return { ok: false, motivo: "falha ao gravar (re-executar limpa e refaz)" };
      }
    }

    const de = pontos[0].executadoEm.slice(0, 10);
    const ate = pontos[pontos.length - 1].executadoEm.slice(0, 10);
    await registrarAuditoria({
      ator,
      acao: "reconstituicao",
      entidade: "model_runs",
      detalhes: { de, ate, pontos: pontos.length, apagados: apagadas?.length ?? 0, cadencia },
    });

    return { ok: true, apagados: apagadas?.length ?? 0, inseridos: pontos.length, de, ate };
  } catch (erro) {
    console.error("[reconstituir] erro inesperado:", erro);
    return { ok: false, motivo: "erro inesperado na reconstituição" };
  }
}

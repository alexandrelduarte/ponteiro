/**
 * "Quando saem as próximas pesquisas?" — o cálculo por trás do bloco da home.
 *
 * Duas fontes, duas naturezas — e o bloco nunca as mistura:
 *  1. RITMO por instituto: mediana dos intervalos entre campos (fim)
 *     consecutivos, SÓ na janela de recência de 120 dias (carimbo §15.1: a
 *     mediana da série inteira mistura o regime de janeiro com o da campanha
 *     e publicava "próxima" depois do 1º turno). Elegível = ≥2 pesquisas com
 *     campo_fim na janela. É ESTIMATIVA (a copy a rotula); estimativa que
 *     cai depois de 25/10 NÃO é publicada (§15.6.4).
 *  2. CALENDÁRIO OFICIAL: datas fixadas em lei (Lei 9.504, arts. 11 e 36;
 *     turnos). Eventos passados somem sozinhos; contagem de dias em
 *     America/Sao_Paulo (§15.6.5 — virada de dia em UTC não adianta nada).
 *
 * Puro e determinístico: nada de relógio interno, nada de rede.
 */
import type { Pesquisa } from "@/data/tipos";

export interface RitmoInstituto {
  instituto: string;
  institutoId: string;
  slugUltima: string;
  ultimaFimISO: string;
  /** mediana dos intervalos NA JANELA, em dias inteiros */
  ritmoDias: number;
  /** só 1 intervalo na janela → a copy usa a variante "a anterior saiu…" */
  unico: boolean;
  previstaISO: string;
  /** a prevista já ficou para trás de hoje */
  atrasada: boolean;
  /** prevista ≤ 25/10 — depois disso a estimativa não é publicada */
  publicavel: boolean;
}

export interface EventoOficial {
  nome: string;
  dataISO: string;
  faltamDias: number;
}

export interface Proximas {
  institutos: RitmoInstituto[];
  /** institutos com 1 pesquisa só — a copy explica por que não têm ritmo */
  semRitmo: string[];
  eventos: EventoOficial[];
}

const DIA_MS = 86_400_000;
export const JANELA_RITMO_DIAS = 120;
const SEGUNDO_TURNO_ISO = "2026-10-25";

/** Datas fixadas em lei — nomes carimbados (§15.3). */
const EVENTOS_OFICIAIS: readonly { nome: string; dataISO: string }[] = [
  { nome: "prazo final de registro das candidaturas no TSE", dataISO: "2026-08-15" },
  { nome: "começa a propaganda eleitoral", dataISO: "2026-08-16" },
  { nome: "1º turno", dataISO: "2026-10-04" },
  { nome: "2º turno — a decisão que as 100 bolinhas mostram", dataISO: SEGUNDO_TURNO_ISO },
];

function meioDiaSP(iso: string): number {
  return Date.parse(`${iso}T12:00:00-03:00`);
}

function paraISO(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** A data (AAAA-MM-DD) de um instante, no fuso do produto. */
function diaSP(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

function mediana(valores: number[]): number {
  const v = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(v.length / 2);
  return v.length % 2 ? v[meio] : (v[meio - 1] + v[meio]) / 2;
}

/** Ritmos por instituto (janela de 120d) + calendário à frente, ordenados. */
export function computarProximas(
  pesquisas: readonly Pesquisa[],
  hojeMs: number,
  limiteInstitutos = 6,
): Proximas {
  const inicioJanelaMs = hojeMs - JANELA_RITMO_DIAS * DIA_MS;

  const porInstituto = new Map<string, Pesquisa[]>();
  for (const p of pesquisas) {
    if (!p.slug) continue; // simuladas (R5) nunca entram
    const id = p.slug.slice(0, -11);
    const lista = porInstituto.get(id);
    if (lista) lista.push(p);
    else porInstituto.set(id, [p]);
  }

  const institutos: RitmoInstituto[] = [];
  const semRitmo: string[] = [];
  for (const [institutoId, lista] of porInstituto) {
    const maisRecente = [...lista].sort((a, b) => meioDiaSP(b.fim) - meioDiaSP(a.fim))[0];
    if (lista.length < 2) {
      semRitmo.push(maisRecente.instituto);
      continue;
    }
    const fins = lista.map((p) => meioDiaSP(p.fim)).sort((a, b) => a - b);
    // Intervalos cujo INÍCIO cai na janela de recência (§15.1).
    const intervalos: number[] = [];
    for (let i = 1; i < fins.length; i++) {
      if (fins[i - 1] >= inicioJanelaMs) intervalos.push((fins[i] - fins[i - 1]) / DIA_MS);
    }
    const naJanela = fins.filter((f) => f >= inicioJanelaMs).length;
    if (naJanela < 2 || intervalos.length === 0) {
      semRitmo.push(maisRecente.instituto);
      continue;
    }
    const ritmoDias = Math.max(1, Math.round(mediana(intervalos)));
    const ultimaMs = fins[fins.length - 1];
    const previstaMs = ultimaMs + ritmoDias * DIA_MS;
    institutos.push({
      instituto: maisRecente.instituto,
      institutoId,
      slugUltima: maisRecente.slug!,
      ultimaFimISO: maisRecente.fim,
      ritmoDias,
      unico: intervalos.length === 1,
      previstaISO: paraISO(previstaMs),
      atrasada: previstaMs < hojeMs,
      publicavel: previstaMs <= meioDiaSP(SEGUNDO_TURNO_ISO),
    });
  }
  // Ordem fixa e neutra (§15.7): prevista crescente, desempate alfabético.
  institutos.sort(
    (a, b) =>
      meioDiaSP(a.previstaISO) - meioDiaSP(b.previstaISO) ||
      a.instituto.localeCompare(b.instituto, "pt-BR"),
  );
  semRitmo.sort((a, b) => a.localeCompare(b, "pt-BR"));

  // Dias corridos em SP: diferença de DATAS, nunca de instantes (§15.6.5).
  const hojeISO = diaSP(hojeMs);
  const eventos: EventoOficial[] = EVENTOS_OFICIAIS.map((e) => ({
    ...e,
    faltamDias: Math.round((meioDiaSP(e.dataISO) - meioDiaSP(hojeISO)) / DIA_MS),
  })).filter((e) => e.faltamDias >= 0);

  return { institutos: institutos.slice(0, limiteInstitutos), semRitmo, eventos };
}

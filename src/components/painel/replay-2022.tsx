"use client";

/**
 * Replay 2022 — "e se os erros se repetissem exatamente?".
 *
 * Terceiro (e último) bloco autorizado a usar `--color-tela` (docs/DESIGN.md
 * §3.2). O erro de cada turno é aplicado NO SEU PRÓPRIO TURNO: os erros de 2022
 * não se somam, porque o do 2ºT foi medido sobre pesquisas refeitas depois do 1º.
 */
import { useMemo } from "react";
import { ERRO_2022 } from "@/data/constantes";
import { calcReplay, fmt, fmtSinal } from "@/lib/modelo";
import { usePainel } from "./estado";

export function Replay2022() {
  const { M, definirParam } = usePainel();
  const replay = useMemo(() => calcReplay(M), [M]);

  if (!replay) return null;

  const margem1T = M.t1valL && M.t1valF ? M.t1valL.valor - M.t1valF.valor : null;

  return (
    <div className="tela-urna mt-4 rounded-cartao border border-tela-borda bg-tela p-4">
      <h3 className="font-mono text-xs tracking-etiqueta text-fosforo uppercase">
        Replay 2022 — e se os erros se repetissem exatamente?
      </h3>

      {/* `items-start`: só o 3º cartão tem botão; esticar os três à mesma altura
          deixava 100–150px de espaço morto nos dois primeiros.
          O rótulo e o selo só dividem a linha quando há largura para isso (lg):
          entre 768 e 1139 o rótulo estilhaçava em 4–5 linhas, com o token
          «2ºT-2022» partido no hífen, e os placares desalinhavam. */}
      <div className="mt-3 grid gap-3 text-sm md:grid-cols-3 md:items-start">
        <div className="rounded-controle bg-tela-fundo p-3">
          <div className="flex flex-col gap-1 lg:flex-row lg:items-start lg:justify-between lg:gap-2">
            <span className="font-mono text-xs text-fosforo uppercase">
              1º turno · erro do <span className="whitespace-nowrap">1ºT-2022</span> aplicado
            </span>
            <span className="w-fit rounded-controle border border-tela-borda px-1.5 py-0.5 font-mono text-xs font-semibold whitespace-nowrap text-fosforo-forte">
              vai a 2ºT: {Math.round(replay.p2Trep * 100)}%
            </span>
          </div>
          <p className="mt-1 text-dado font-mono text-fosforo-forte">
            <span className="text-lula-claro">{fmt(replay.r1L)}%</span> ×{" "}
            <span className="text-flavio-claro">{fmt(replay.r1F)}%</span>
          </p>
          {/* §4.1: os números que o modelo recalcula saem em mono, mesmo dentro
              da prosa; os fixos editoriais (−1,0 · +5,3 · 50%) ficam em Archivo. */}
          <p className="mt-1 text-xs leading-compacto text-fosforo">
            dos válidos (Lula −1,0 · Flávio +5,3). Ninguém chega a 50%: <b>2º turno confirmado</b>,
            com chegada apertada (
            <span className="font-mono">{fmtSinal(replay.r1L - replay.r1F)} p.p.</span>) em vez dos{" "}
            <span className="font-mono">{margem1T === null ? "–" : fmtSinal(margem1T)}</span> das
            pesquisas. Probabilidade de Lula ainda chegar em 1º lugar:{" "}
            <span className="font-mono">{Math.round(replay.pLider1 * 100)}%</span>.
          </p>
        </div>

        <div className="rounded-controle bg-tela-fundo p-3">
          <div className="flex flex-col gap-1 lg:flex-row lg:items-start lg:justify-between lg:gap-2">
            <span className="font-mono text-xs text-fosforo uppercase">
              2º turno · erro do <span className="whitespace-nowrap">2ºT-2022</span> aplicado
            </span>
            <span className="w-fit rounded-controle border border-tela-borda px-1.5 py-0.5 font-mono text-xs font-semibold whitespace-nowrap text-fosforo-forte">
              Lula vence: {Math.round(replay.pV2rep * 100)}%
            </span>
          </div>
          <p className="mt-1 text-dado font-mono text-fosforo-forte">
            <span className="text-lula-claro">{fmt(replay.r2L)}%</span> ×{" "}
            <span className="text-flavio-claro">{fmt(replay.r2F)}%</span>
          </p>
          <p className="mt-1 text-xs leading-compacto text-fosforo">
            dos válidos (±1,6).{" "}
            <b>
              Vitória apertada de Lula por{" "}
              <span className="font-mono">{fmtSinal(replay.r2L - replay.r2F)} p.p.</span>
            </b>{" "}
            — réplica quase exata do placar real de 2022 (50,9×49,1).
          </p>
        </div>

        <div className="rounded-controle border border-confirma bg-tela-fundo p-3">
          <span className="font-mono text-xs text-fosforo uppercase">
            Estimativa de vitória · condicional à réplica exata
          </span>
          <p className="mt-1 text-dado font-mono text-fosforo-forte">
            <span className="text-lula-claro">{Math.round(replay.elRepD * 100)}%</span> ×{" "}
            <span className="text-flavio-claro">{100 - Math.round(replay.elRepD * 100)}%</span>
          </p>
          <p className="mt-0.5 font-mono text-xs text-fosforo">
            = {fmt(replay.p1Ld * 100, 0)}% (direto no 1ºT) + {Math.round(replay.p2Trep * 100)}% ×{" "}
            {Math.round(replay.pV2rep * 100)}% (2ºT)
          </p>
          <p className="mt-1 text-xs leading-compacto text-fosforo">
            projeção p/ o dia da votação: o erro vira premissa fixa (turno a turno, como em 2022) e
            a única incerteza que sobra é o movimento da opinião até outubro. Se a votação fosse
            hoje sob a réplica, o placar{" "}
            <span className="font-mono">
              ~{fmt(replay.r2L, 0)}×{fmt(replay.r2F, 0)}
            </span>{" "}
            seria quase certo (Lula{" "}
            <span className="font-mono">≈{Math.round(replay.elRepH * 100)}%</span>).
          </p>
          <button
            type="button"
            data-testid="aplicar-replica"
            onClick={() => definirParam("vies", ERRO_2022.t2.margem)}
            className="mt-2 min-h-toque rounded-controle bg-confirma px-3 text-xs font-semibold text-campo"
          >
            aplicar réplica (viés +3,1) ao painel
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs leading-compacto text-fosforo opacity-85">
        Calibração: erro médio «pesquisas de véspera × urna» de 2022 em votos válidos — 1º turno:
        margens de +7,1 a +14 (média +11,6) contra +5,2 real; 2º turno: margens de +0,8 a +8 (média
        +4,9) contra +1,8 real. Por que os erros não se somam: em 2022, as pesquisas do 2º turno
        foram refeitas depois do choque do 1º — o erro remanescente na decisão foi só +3,1. A
        réplica fiel, portanto, <b>ainda elege Lula por pouco, como em 2022</b>. No painel principal
        esse mesmo cenário aparece como{" "}
        <span className="font-mono">≈{Math.round(replay.pPainel * 100)}%</span>, porque lá a
        incerteza sobre o próprio viés é mantida. A inversão da corrida exige uma hipótese que NÃO
        aconteceu em 2022: o erro do 1º turno persistir intacto na decisão — é o cartão
        «teste-limite +6,3» acima, além do ponto de virada (
        <span className="font-mono">{fmtSinal(M.margem)}</span>).
      </p>
    </div>
  );
}

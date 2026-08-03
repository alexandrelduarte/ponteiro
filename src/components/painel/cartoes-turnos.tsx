"use client";

/**
 * Cartões 1º turno / 2º turno (docs/DESIGN.md §7.4).
 * Placar em `text-placar` com numerais nas variantes `-escuro` (§5.2);
 * a legenda quebra para a linha de baixo e nunca disputa espaço com o placar.
 */
import { Cartao } from "@/components/ui/cartao";
import { pctComPiso } from "@/components/ui/textos";
import { fmt, fmtSinal, pct } from "@/lib/modelo";
import { usePainel } from "./estado";
import { Tendencia } from "./tendencia";

function MiniCartao({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="rounded-controle bg-mini p-2 text-center">
      <div className="text-dado font-mono text-tinta">{valor}</div>
      <div className="text-xs">{rotulo}</div>
    </div>
  );
}

export function CartoesTurnos() {
  const { M } = usePainel();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Cartao titulo="1º turno · 04 de outubro" destaque="confirma">
        <div>
          <p className="flex items-baseline gap-2">
            <span className="text-placar font-mono text-lula-escuro">{fmt(M.t1raw?.valor)}%</span>
            <span className="text-lg text-cinza" aria-hidden="true">
              ×
            </span>
            <span className="text-placar font-mono text-flavio-escuro">
              {fmt(M.t1rawF?.valor)}%
            </span>
          </p>
          <p className="mt-1 text-xs text-cinza">média ponderada (estimulada)</p>
        </div>

        <div className="mt-2 flex flex-col gap-1">
          <Tendencia t={M.tend1.l} rotulo="Lula" />
          <Tendencia t={M.tend1.f} rotulo="Flávio" />
          <Tendencia t={M.tend1.m} rotulo="Margem" />
        </div>

        <div className="mt-3 border-t border-dashed border-linha pt-3 text-sm text-cinza">
          Em votos válidos, Lula tem ≈
          <b className="font-mono text-tinta">{fmt(M.t1valL?.valor)}%</b> — abaixo dos 50% que
          evitariam o 2º turno.
          <div className="mt-2 grid grid-cols-2 gap-2">
            <MiniCartao valor={pct(M.p1?.lulaHoje)} rotulo="definição no 1ºT · hoje" />
            <MiniCartao valor={pct(M.p1?.lulaDia)} rotulo="definição no 1ºT · em 04/10" />
          </div>
          <p className="mt-2 text-xs">
            Chance de Flávio vencer no 1º turno:{" "}
            <span className="font-mono">{pctComPiso(M.p1?.flavioDia)}</span> (precisa de mais de 50%
            dos válidos).
          </p>
        </div>
      </Cartao>

      {/* Filete NEUTRO: `--color-lula` aqui era a única régua larga em cor de
          candidato da página, sem espelho azul do outro lado (R4 / §5.2). */}
      <Cartao titulo="2º turno · 25 de outubro (disputa decisiva)" destaque="tinta">
        <div>
          <p className="flex items-baseline gap-2">
            <span data-testid="media-2t-lula" className="text-placar font-mono text-lula-escuro">
              {fmt(M.mediaL2)}%
            </span>
            <span className="text-lg text-cinza" aria-hidden="true">
              ×
            </span>
            <span className="text-placar font-mono text-flavio-escuro">{fmt(M.mediaF2)}%</span>
          </p>
          <p className="mt-1 font-mono text-xs text-cinza">
            margem {fmtSinal(M.margem)} p.p. · válidos {fmt(M.validoL2)}%×{fmt(100 - M.validoL2)}%
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-1">
          <Tendencia t={M.tend2.l} rotulo="Lula" />
          <Tendencia t={M.tend2.f} rotulo="Flávio" />
          <Tendencia t={M.tend2.m} rotulo="Margem" />
        </div>

        <div className="mt-3 border-t border-dashed border-linha pt-3 text-sm text-cinza">
          <span className="font-mono">{M.qtdEmpate}</span> de{" "}
          <span className="font-mono">{M.qtdRecentes}</span> pesquisas recentes apontam empate
          técnico; a Gerp chega a mostrar Flávio à frente. Dispersão entre institutos:{" "}
          <span className="font-mono">±{fmt(M.sdEntre)} p.p.</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <MiniCartao valor={pct(M.pL2hoje)} rotulo="vitória de Lula no 2ºT · hoje" />
            <MiniCartao valor={pct(M.pL2dia)} rotulo="vitória de Lula no 2ºT · em 25/10" />
          </div>
          <p className="mt-2 text-xs">
            Faixa provável (80%) da margem final:{" "}
            <span className="font-mono">
              {fmt(M.int80[0])} a {fmtSinal(M.int80[1])} p.p.
            </span>{" "}
            — inclui vitória apertada de Flávio no limite inferior.
          </p>
        </div>
      </Cartao>
    </div>
  );
}

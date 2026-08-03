"use client";

/**
 * Curva de sensibilidade ao viés + os 3 cartões de cenário
 * (docs/DESIGN.md §7.8).
 *
 * O clique na curva é uma afordância invisível em toque: por isso a legenda
 * explícita acima do gráfico e os 3 cartões abaixo como caminho alternativo
 * acessível (são `button` com `aria-pressed` e alvo ≥44px).
 */
import { useMemo } from "react";
import { CENARIOS_VIES } from "@/data/constantes";
import { calcSerieSens, calcVies, fmtSinal } from "@/lib/modelo";
import { ALTURA, CaixaGrafico } from "@/components/graficos/comum";
import { SensibilidadeLazy } from "@/components/graficos/carregados";
import { usePainel } from "./estado";

function Amostra({ cor }: { cor: "lula" | "flavio" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3 w-3 rounded-[2px] border border-linha-forte ${
        cor === "lula" ? "bg-lula" : "bg-flavio"
      }`}
    />
  );
}

export function CurvaSensibilidade() {
  const { M, params, definirParam } = usePainel();
  const serie = useMemo(() => calcSerieSens(M), [M]);

  return (
    <div className="mt-4">
      <p className="mb-2 font-mono text-xs tracking-dado text-cinza uppercase">
        Curva de sensibilidade — chance de ser eleito (dia da votação) conforme o viés assumido.
        Toque na curva para aplicar aquele viés ao painel:
      </p>

      <CaixaGrafico altura={ALTURA.sensibilidade}>
        <SensibilidadeLazy
          serie={serie}
          margem={M.margem}
          vies={params.vies}
          onAplicarVies={(v) => definirParam("vies", v)}
        />
      </CaixaGrafico>

      <p className="mt-1 font-mono text-xs text-cinza">
        ● ponto de virada: viés {fmtSinal(M.margem)} p.p. · ◆ viés aplicado agora:{" "}
        {fmtSinal(params.vies)} p.p.
      </p>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {CENARIOS_VIES.map((c) => {
          const r = calcVies(M, c.vies);
          const pl = Math.round(r.elD * 100);
          const ativo = Math.abs(params.vies - c.vies) < 0.05;
          return (
            <button
              key={c.vies}
              type="button"
              data-testid={`cenario-vies-${String(c.vies).replace(".", "-")}`}
              onClick={() => definirParam("vies", c.vies)}
              aria-pressed={ativo}
              className={[
                "min-h-toque rounded-controle bg-mini p-3 text-left",
                ativo ? "border-2 border-tinta shadow-ativo" : "border border-linha",
              ].join(" ")}
            >
              <span className="block text-sm font-bold text-tinta">
                {ativo ? "▶ " : ""}
                {c.titulo}
              </span>
              <span className="mt-0.5 block font-mono text-sm font-semibold">
                viés {fmtSinal(c.vies)} → <span className="text-lula-escuro">{pl}%</span>×
                <span className="text-flavio-escuro">{100 - pl}%</span>
              </span>
              <span className="mt-1 block text-xs leading-snug text-cinza">{c.desc}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-cinza">
        <span className="inline-flex items-center gap-1">
          <Amostra cor="lula" /> Lula
        </span>
        <span className="inline-flex items-center gap-1">
          <Amostra cor="flavio" /> Flávio.
        </span>
        <span>
          O ponto preto é a <b className="text-tinta">virada</b>: as linhas cruzam os 50% quando o
          viés assumido iguala a margem bruta ({fmtSinal(M.margem)} p.p.) — qualquer erro pró-Lula
          maior que isso na disputa decisiva inverte o favorito. Toque no gráfico ou nos cartões
          para aplicar o cenário ao painel inteiro.
        </span>
      </p>
    </div>
  );
}

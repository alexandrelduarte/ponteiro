"use client";

/**
 * Cenário-base — o caminho MODAL da árvore de probabilidades do modelo, nos
 * parâmetros atuais do painel.
 *
 * A frase de frequência natural ("1 vez a cada N eleições parecidas") fica no
 * topo do bloco, nunca dentro de `<details>`: é ela que resolve a confusão
 * clássica do "75% de chance" lido como certeza (docs/DESIGN.md P3).
 */
import { useMemo } from "react";
import { Cartao } from "@/components/ui/cartao";
import { calcCenarioBase, fmt, fmtSinal, pct } from "@/lib/modelo";
import { usePainel } from "./estado";

/** Bandas 0 e 1 são escuras (rótulo claro); 2 e 3 são claras (rótulo escuro) — §5.5. */
const ROTULO_BANDA = ["text-papel", "text-papel", "text-tinta", "text-tinta"] as const;

export function CenarioBase() {
  const { M, params } = usePainel();
  const cen = useMemo(() => calcCenarioBase(M, params.vies), [M, params.vies]);

  if (!cen) return null;

  const contra = 1 - cen.pElei;
  const umaEmN = Math.max(2, Math.round(1 / Math.max(0.01, contra)));

  return (
    <Cartao
      titulo="Cenário-base — o desfecho mais provável segundo o modelo (recalcula com seus parâmetros)"
      destaque="tinta"
    >
      <h2 className="text-secao uppercase" data-testid="cenario-base-titulo">
        {cen.liderLula ? "Reeleição de Lula" : "Vitória de Flávio Bolsonaro"} decidida no 2º turno,
        por margem {Math.abs(M.margemAj) < 5 ? "apertada" : "moderada"} — probabilidade combinada:{" "}
        <span className={cen.liderLula ? "text-lula-escuro" : "text-flavio-escuro"}>
          {pct(cen.pElei)}
        </span>
      </h2>

      <p className="mt-2 rounded-controle bg-mini p-2 text-xs text-cinza">
        Leitura estatística do agregado — não é previsão determinística nem endosso. Um cenário com{" "}
        {pct(contra)} de probabilidade contrária acontece, no longo prazo,{" "}
        <b className="text-tinta">1 vez a cada {umaEmN} eleições parecidas</b>.
      </p>

      <div className="mt-4 grid gap-2 font-mono text-sm md:grid-cols-3">
        <div className="rounded-controle border border-linha bg-mini p-3">
          <p className="text-xs text-cinza uppercase">04/10 · 1º turno</p>
          <p className="mt-1 font-semibold">Sem definição → 2º turno</p>
          <p className="mt-1 text-xs text-cinza">
            P(ir a 2ºT): <b className="text-tinta">{pct(M.p2Tacontece)}</b> · Lula em 1º:{" "}
            <b className="text-tinta">{pct(cen.pLulaEm1)}</b>
          </p>
        </div>
        <div className="rounded-controle border border-linha bg-mini p-3">
          <p className="text-xs text-cinza uppercase">25/10 · 2º turno</p>
          <p className="mt-1 font-semibold">{cen.liderLula ? "Lula" : "Flávio"} vence a decisão</p>
          <p className="mt-1 text-xs text-cinza">
            P(vitória na decisão): <b className="text-tinta">{pct(cen.pV2)}</b> · combinada ={" "}
            {fmt(cen.pDireto * 100, 0)}% + {pct(M.p2Tacontece)}×{pct(cen.pV2)}
          </p>
        </div>
        <div className="rounded-controle border border-linha bg-mini p-3">
          <p className="text-xs text-cinza uppercase">Placar central projetado</p>
          <p className="mt-1 font-semibold">
            <span className="text-lula-escuro">{fmt(cen.placarL)}%</span> ×{" "}
            <span className="text-flavio-escuro">{fmt(100 - cen.placarL)}%</span>
          </p>
          <p className="mt-1 text-xs text-cinza">
            dos válidos · faixa 80% da margem: {fmt(M.int80[0])} a {fmtSinal(M.int80[1])} p.p.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-1 font-mono text-xs tracking-dado text-cinza uppercase">
          Como a distribuição do 2º turno se reparte (banda modal em destaque):
        </p>
        <div
          className="flex h-6 overflow-hidden rounded-controle border border-linha"
          role="img"
          aria-label={cen.bandas.map((b) => `${b.rot}: ${Math.round(b.p * 100)}%`).join("; ")}
        >
          {cen.bandas.map((b, i) => (
            <div
              key={b.rot}
              className={`flex items-center justify-center text-xs font-bold ${ROTULO_BANDA[i]}`}
              style={{ width: `${Math.max(b.p * 100, 0)}%`, background: b.cor }}
            >
              {b.p >= 0.12 ? `${Math.round(b.p * 100)}%` : ""}
            </div>
          ))}
        </div>
        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cinza">
          {cen.bandas.map((b) => (
            <li key={b.rot} className="inline-flex items-center gap-1">
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 rounded-[2px] border border-linha-forte"
                style={{ background: b.cor }}
              />
              {b.rot}: {Math.round(b.p * 100)}%
              {b === cen.modal ? <b className="text-tinta"> ● mais provável</b> : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 text-sm leading-leitura">
        <b>Por que este é o cenário-base:</b>{" "}
        <span className="text-cinza">
          (1) a vantagem é consistente — 6 dos 7 institutos de julho mostram Lula à frente ou
          empatado, margem agregada de {fmtSinal(M.margem)} p.p., tendência pareada estável com leve
          inclinação pró-Lula; (2) o contexto medido favorece o incumbente competitivo — aprovação
          ~empatada (1º saldo positivo na Quaest desde dez/24), rejeição de Flávio igual ou maior
          que a de Lula em todos os institutos, potencial de voto 47%×38%; (3) a estrutura
          polarizada, com ~2/3 de voto fechado de cada lado, faz a série andar em décimos — virar
          exige movimento fora do padrão de 2026; (4) mas a margem fica «apertada» no placar central
          porque a direção histórica do erro (2018, 2022 e Datafolha/Quaest em SP-2024) é subestimar
          a direita, e a réplica fiel de 2022 entrega exatamente ~51×49. O que derrubaria o cenário:
          novas rodadas levando a margem bruta para baixo de ~+2 (viraria «leve favoritismo»), três
          institutos seguidos com Flávio à frente fora da margem, ou um erro de pesquisa acima do já
          observado no estado calibrado.
        </span>
      </div>

      <details className="mt-3 text-sm">
        <summary className="font-semibold">Metodologia desta seção</summary>
        <p className="mt-1 text-sm leading-compacto text-cinza">
          O cenário-base é o <b>caminho modal</b> da árvore de probabilidades do próprio modelo, nos
          parâmetros atuais do painel: em cada bifurcação, o ramo mais provável — definição no 1º
          turno? (não, {pct(M.p2Tacontece)}); quem lidera a largada? (
          {cen.pLulaEm1 >= 0.5 ? "Lula" : "Flávio"}, {pct(Math.max(cen.pLulaEm1, 1 - cen.pLulaEm1))}
          ); quem vence a decisão? ({cen.liderLula ? "Lula" : "Flávio"}, {pct(cen.pV2)}); em qual
          faixa de margem? (banda modal acima). As bandas vêm da distribuição normal projetada
          N(margem ajustada; ±{fmt(M.sigmaDia2)}), a mesma do gráfico de distribuição; a
          probabilidade combinada soma o caminho direto no 1º turno com o caminho via 2º turno. Nada
          aqui é opinião fixa: mude o viés para +6,3 no painel de parâmetros e esta seção passará,
          sozinha, a descrever a vitória de Flávio — o «cenário mais provável» é uma função dos
          dados e das premissas, não um palpite.
        </p>
      </details>
    </Cartao>
  );
}

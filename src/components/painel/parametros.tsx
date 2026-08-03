"use client";

/**
 * Parâmetros do modelo (docs/DESIGN.md §7.7 · princípio P10).
 *
 * Os sliders são CONTEÚDO EDITORIAL, não configuração avançada: se o leitor
 * pode mover o viés para +6,3 e ver a página inteira passar a descrever a
 * vitória do outro candidato, ele aprende que o "cenário mais provável" é
 * função das premissas. Por isso ficam na página, não atrás de um menu.
 */
import type { ReactNode } from "react";
import { Cartao } from "@/components/ui/cartao";
import { fmt, fmtSinal } from "@/lib/modelo";
import { PARAMS_PADRAO } from "@/data/constantes";
import type { ParamsModelo } from "@/data/tipos";
import { Deslizador } from "./deslizador";
import { Compartilhar } from "./compartilhar";
import { FAIXAS } from "./parametros-url";
import { usePainel } from "./estado";

interface ConfigSlider {
  chave: keyof ParamsModelo;
  rotulo: string;
  sufixo: string;
  unidadeLeitura: string;
  idTeste: string;
  dica: ReactNode;
}

/** Ordem de leitura preservada do protótipo. */
const SLIDERS: ConfigSlider[] = [
  {
    chave: "meiaVida",
    rotulo: "Meia-vida da recência",
    sufixo: " dias",
    unidadeLeitura: "dias",
    idTeste: "slider-meia",
    dica: "A cada X dias, o peso de uma pesquisa cai pela metade. Menor = agregado reage mais rápido; as rodadas antigas seguem na série apenas para a tendência.",
  },
  {
    chave: "sigmaSys",
    rotulo: "Erro sistemático histórico",
    sufixo: " p.p.",
    unidadeLeitura: "pontos percentuais",
    idTeste: "slider-sys",
    // Ênfase em negrito, não em caixa alta (§4.3).
    dica: (
      <>
        Âncoras de 2022: +3,1 foi o erro do estado <b className="text-tinta">calibrado</b> (2ºT,
        depois do gabarito do 1º turno); +6,3 foi o do estado não calibrado (1ºT). As pesquisas que
        alimentam o painel hoje ainda não passaram por calibragem — o padrão 4,0 fica entre os dois,
        descontando a parte do 6,3 que foi movimento de véspera (já coberto pela deriva).
      </>
    ),
  },
  {
    chave: "coefDeriva",
    rotulo: "Deriva da opinião pública",
    sufixo: " ×√dias",
    unidadeLeitura: "pontos percentuais vezes a raiz dos dias restantes",
    idTeste: "slider-deriva",
    dica: (
      <>
        Quanto a corrida pode se mover até a votação (TV, debates, fatos novos). Afeta{" "}
        <b className="text-tinta">apenas</b> a projeção para o dia da eleição — é o que separa as
        duas linhas da tela.
      </>
    ),
  },
  {
    chave: "vies",
    rotulo: "Viés direcional das pesquisas",
    sufixo: " p.p.",
    unidadeLeitura: "pontos percentuais; positivo significa pesquisas superestimando Lula",
    idTeste: "slider-vies",
    dica: "Positivo = pesquisas superestimando Lula. Calibração 2022 (agregado de véspera × urna): +6,3 no 1º turno, +3,1 no 2º — os erros não se somam: o do 2ºT já foi medido sobre pesquisas novas, refeitas após o choque do 1º. Negativo = superestimando Flávio.",
  },
];

export function Parametros() {
  const { M, params, definirParam, restaurarParams, paramsAlterados } = usePainel();

  return (
    <Cartao
      titulo="Parâmetros do modelo"
      descricao="Ajuste as premissas — calibradas pelo histórico de erros logo abaixo."
      destaque="confirma"
    >
      {/* Um filete tracejado abre cada FILEIRA da grade. Como as fileiras do
          grid começam na mesma altura nas duas colunas, os filetes ficam
          colineares e a folga desigual das dicas (2 × 4 linhas) deixa de ler
          como bloco torto. */}
      <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
        {SLIDERS.map((s, i) => (
          <Deslizador
            key={s.chave}
            rotulo={s.rotulo}
            valor={params[s.chave]}
            faixa={FAIXAS[s.chave]}
            sufixo={s.sufixo}
            unidadeLeitura={s.unidadeLeitura}
            idTeste={s.idTeste}
            dica={s.dica}
            className={[
              i > 0 ? "border-t border-dashed border-linha pt-4" : "",
              i === 1 ? "md:border-t-0 md:pt-0" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onChange={(v) => definirParam(s.chave, v)}
          />
        ))}
      </div>

      <div className="mt-4 space-y-1 rounded-controle bg-mini p-3 font-mono text-xs text-cinza">
        <p>
          margem: bruta {fmtSinal(M.margem)} − viés {fmt(params.vies)} ={" "}
          <b className="text-tinta">{fmtSinal(M.margemAj)} p.p.</b>
        </p>
        <p>
          hoje: √({fmt(M.seAgora)}² + {fmt(params.sigmaSys)}²) ={" "}
          <b className="text-tinta">±{fmt(M.sigmaHoje)} p.p.</b>
        </p>
        <p>
          dia da votação: √(hoje² + {fmt(M.deriva2)}²) ={" "}
          <b className="text-tinta">±{fmt(M.sigmaDia2)} p.p.</b>
        </p>
      </div>

      <button
        type="button"
        onClick={restaurarParams}
        disabled={!paramsAlterados}
        data-testid="restaurar-parametros"
        className={[
          "mt-3 min-h-toque w-full rounded-controle px-3 text-sm font-semibold",
          paramsAlterados
            ? "border border-alerta text-tinta"
            : "cursor-default border border-dashed border-linha text-cinza opacity-70",
        ].join(" ")}
      >
        {paramsAlterados
          ? `↺ Restaurar parâmetros padrão (meia-vida ${PARAMS_PADRAO.meiaVida} · σ ${fmt(
              PARAMS_PADRAO.sigmaSys,
            )} · deriva ${fmt(PARAMS_PADRAO.coefDeriva, 2)} · viés ${fmt(PARAMS_PADRAO.vies, 0)})`
          : "✓ Parâmetros no padrão"}
      </button>

      <div className="mt-3">
        <Compartilhar />
      </div>
    </Cartao>
  );
}

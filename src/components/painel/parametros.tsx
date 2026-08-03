"use client";

/**
 * Parâmetros do modelo (docs/DESIGN.md §7.7 · princípio P10).
 *
 * Os sliders são CONTEÚDO EDITORIAL, não configuração avançada: se o leitor
 * pode mover o viés para +6,3 e ver a página inteira passar a descrever a
 * vitória do outro candidato, ele aprende que o "cenário mais provável" é
 * função das premissas. Por isso ficam na página, não atrás de um menu.
 */
import { Cartao } from "@/components/ui/cartao";
import { fmt, fmtSinal } from "@/lib/modelo";
import { PARAMS_PADRAO } from "@/data/constantes";
import { Deslizador } from "./deslizador";
import { Compartilhar } from "./compartilhar";
import { FAIXAS } from "./parametros-url";
import { usePainel } from "./estado";

export function Parametros() {
  const { M, params, definirParam, restaurarParams, paramsAlterados } = usePainel();

  return (
    <Cartao
      titulo="Parâmetros do modelo (ajuste as premissas) — calibrados pelo histórico de erros logo abaixo"
      destaque="confirma"
    >
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        <Deslizador
          rotulo="Meia-vida da recência"
          valor={params.meiaVida}
          faixa={FAIXAS.meiaVida}
          sufixo=" dias"
          unidadeLeitura="dias"
          idTeste="slider-meia"
          onChange={(v) => definirParam("meiaVida", v)}
          dica="A cada X dias, o peso de uma pesquisa cai pela metade. Menor = agregado reage mais rápido; as rodadas antigas seguem na série apenas para a tendência."
        />
        <Deslizador
          rotulo="Erro sistemático histórico"
          valor={params.sigmaSys}
          faixa={FAIXAS.sigmaSys}
          sufixo=" p.p."
          unidadeLeitura="pontos percentuais"
          idTeste="slider-sys"
          onChange={(v) => definirParam("sigmaSys", v)}
          dica="Âncoras de 2022: +3,1 foi o erro do estado CALIBRADO (2ºT, depois do gabarito do 1º turno); +6,3 foi o do estado não calibrado (1ºT). As pesquisas que alimentam o painel hoje ainda não passaram por calibragem — o padrão 4,0 fica entre os dois, descontando a parte do 6,3 que foi movimento de véspera (já coberto pela deriva)."
        />
        <Deslizador
          rotulo="Deriva da opinião pública"
          valor={params.coefDeriva}
          faixa={FAIXAS.coefDeriva}
          sufixo=" ×√dias"
          unidadeLeitura="pontos percentuais vezes a raiz dos dias restantes"
          idTeste="slider-deriva"
          onChange={(v) => definirParam("coefDeriva", v)}
          dica="Quanto a corrida pode se mover até a votação (TV, debates, fatos novos). Afeta APENAS a projeção para o dia da eleição — é o que separa as duas linhas da tela."
        />
        <Deslizador
          rotulo="Viés direcional das pesquisas"
          valor={params.vies}
          faixa={FAIXAS.vies}
          sufixo=" p.p."
          unidadeLeitura="pontos percentuais; positivo significa pesquisas superestimando Lula"
          idTeste="slider-vies"
          onChange={(v) => definirParam("vies", v)}
          dica="Positivo = pesquisas superestimando Lula. Calibração 2022 (agregado de véspera × urna): +6,3 no 1º turno, +3,1 no 2º — os erros não se somam: o do 2ºT já foi medido sobre pesquisas novas, refeitas após o choque do 1º. Negativo = superestimando Flávio."
        />
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

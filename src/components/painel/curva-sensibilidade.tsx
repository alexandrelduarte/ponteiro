"use client";

/**
 * "E se a puxada fosse maior ou menor?" (COPY-DECK §L, INVENTÁRIO 3.8).
 *
 * A curva responde a uma pergunta só, e o toque nela aplica a suposição ao
 * painel inteiro. Os três cartões abaixo são o mesmo gesto por teclado e por
 * dedo grande — e os TRÊS publicam o placar, para que nenhum deles anuncie um
 * desfecho sem número enquanto os outros carregam a dúvida (H9).
 */
import { useMemo } from "react";
import { Subtitulo } from "@/components/ui/blocos";
import { Celebra } from "@/components/ui/movimento";
import { parEmCem } from "@/components/ui/textos";
import { ALTURA, CaixaGrafico } from "@/components/graficos/comum";
import { SensibilidadeLazy } from "@/components/graficos/carregados";
import { CENARIOS_VIES } from "@/data/constantes";
import { calcSerieSens, calcVies, fmtSinal } from "@/lib/modelo";
import { usePainel } from "./estado";

/** Os títulos e as frases são do COPY-DECK; os VALORES vêm de `CENARIOS_VIES`. */
const TEXTO_CENARIO: Record<string, { titulo: string; texto: (pl: string) => React.ReactNode }> = {
  "0": {
    titulo: "As pesquisas estão certas",
    texto: () => null,
  },
  "3.1": {
    titulo: "Igual a 2022",
    texto: (pl) => (
      <>
        As pesquisas da decisão erram 3,1 pontos a favor de Lula — o mesmo tamanho do erro do 2º
        turno de 2022. A diferença medida cairia para cerca de 1,6 ponto, e Lula seria eleito em{" "}
        {pl} de cada 100 cenários: apertado, como em 2022.
      </>
    ),
  },
  "6.3": {
    titulo: "Teste-limite: 6,3",
    texto: (pl) => (
      <>
        Uma hipótese que <b className="font-semibold text-tinta">não</b> aconteceu em 2022: o erro
        grande do 1º turno chegar inteiro até a decisão, sem a correção que os institutos fizeram
        entre os turnos. Como 6,3 passa do ponto de virada, quem fica na frente é Flávio — Lula é
        eleito em {pl} de cada 100 cenários.
      </>
    ),
  },
};

export function CurvaSensibilidade() {
  const { M, params, definirParam } = usePainel();
  const serie = useMemo(() => calcSerieSens(M), [M]);
  const cenarios = useMemo(
    () =>
      CENARIOS_VIES.map((c) => ({ vies: c.vies, rotulo: TEXTO_CENARIO[String(c.vies)].titulo })),
    [],
  );

  return (
    <div className="mt-6">
      <Subtitulo>E se a puxada fosse maior ou menor?</Subtitulo>
      <p className="mt-1 max-w-texto text-corpo text-tinta-media">
        Toque em qualquer ponto do gráfico para aplicar aquela puxada ao painel inteiro.
      </p>
      <p className="mt-2 max-w-texto text-corpo text-tinta-media">
        Esta linha responde a uma pergunta só: se todas as pesquisas estiverem puxando para o lado
        de Lula, quanto muda a chance de cada um? Quanto mais para a direita, maior a puxada que
        você está supondo.
      </p>

      <div className="mt-3">
        <p className="text-micro text-tinta-media">chance de ser eleito, em cada 100</p>
        <CaixaGrafico altura={ALTURA.sensibilidade}>
          <SensibilidadeLazy
            serie={serie}
            margem={M.margem}
            vies={params.vies}
            cenarios={cenarios}
            onAplicar={(v) => definirParam("vies", v)}
          />
        </CaixaGrafico>
        <p className="text-right text-micro text-tinta-media">
          tamanho da puxada suposta, em pontos
        </p>
      </div>

      <p className="mt-2 max-w-texto text-micro text-tinta-media">
        O ponto preto é a virada: as duas linhas se cruzam quando a puxada suposta fica{" "}
        <b className="font-semibold text-tinta">perto do tamanho</b> da diferença medida (
        <span className="numeros">{fmtSinal(M.margem)}</span> pontos). Puxada maior que isso a favor
        de Lula inverte quem está na frente.
      </p>
      <p className="sr-only">
        Gráfico: chance de cada candidato ser eleito conforme o tamanho da puxada suposta, de −3 a
        +10 pontos. A virada acontece em {fmtSinal(M.margem)} pontos.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3 md:items-start">
        {CENARIOS_VIES.map((c) => {
          const copy = TEXTO_CENARIO[String(c.vies)];
          const [pl, pf] = parEmCem(calcVies(M, c.vies).elD);
          const ativo = Math.abs(params.vies - c.vies) < 0.05;
          return (
            <button
              key={c.vies}
              type="button"
              data-testid={`cenario-vies-${String(c.vies).replace(".", "-")}`}
              onClick={() => definirParam("vies", c.vies)}
              aria-pressed={ativo}
              className={[
                "min-h-toque rounded-nicho p-4 text-left",
                "transition-colors duration-(--dur-rapida) ease-(--ease-padrao)",
                ativo ? "bg-ameixa-bruma" : "bg-nicho hover:bg-ameixa-tenue",
              ].join(" ")}
            >
              <Celebra chave={ativo ? `${c.vies}-ativo` : `${c.vies}-inativo`}>
                <span className="block text-secao text-tinta">
                  {ativo ? "▶ " : ""}
                  {copy.titulo}
                </span>
              </Celebra>
              <span className="mt-1 block text-corpo font-semibold numeros">
                <span className="text-lula">Lula {pl} em 100</span>
                <span className="text-tinta-media"> × </span>
                <span className="text-flavio">Flávio {pf} em 100</span>
              </span>
              <span className="mt-2 block text-micro text-tinta-media">
                {c.vies === 0 ? (
                  <>
                    <b className="font-semibold text-tinta">Nesta hipótese</b> a média acerta, e a
                    diferença de <span className="numeros">{fmtSinal(M.margem)}</span> pontos é a
                    real. É assim que o painel calcula por padrão.
                  </>
                ) : (
                  copy.texto(pl)
                )}
              </span>
              {ativo ? (
                <span className="mt-2 block text-micro font-semibold text-ameixa">
                  ▶ aplicado ao painel
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

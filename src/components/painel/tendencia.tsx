/**
 * Tendência pareada (COPY-DECK §E): cada instituto comparado COM ELE MESMO.
 *
 * A palavra faz o trabalho — "subiu", "caiu", "praticamente igual" —, então a
 * cor nunca é o único canal, e aqui ela nem entra: não existe verde de alta
 * nem vermelho de queda neste sistema (vermelho é de candidato, R4). Subir
 * agora não quer dizer que vai continuar subindo, e o texto diz isso.
 */
import { abs1 } from "@/components/ui/textos";
import { fmtSinal, type Tendencia as TendenciaModelo } from "@/lib/modelo";

const ESTAVEL = 0.8;

export function Tendencia({ t, rotulo }: { t: TendenciaModelo | null; rotulo: string }) {
  if (!t) {
    return (
      <span className="text-micro text-tinta-media">
        <b className="font-medium text-tinta">{rotulo}</b> ainda não dá para comparar
      </span>
    );
  }

  const unidade = Math.abs(t.delta) === 1 ? "ponto" : "pontos";
  const corpo =
    Math.abs(t.delta) < ESTAVEL
      ? `praticamente igual (${fmtSinal(t.delta)})`
      : t.delta > 0
        ? `subiu ${abs1(t.delta)} ${unidade}`
        : `caiu ${abs1(t.delta)} ${unidade}`;

  return (
    <span className="text-micro text-tinta-media numeros">
      <b className="font-medium text-tinta">{rotulo}</b> {corpo} · comparando {t.pares}{" "}
      {t.pares === 1 ? "instituto" : "institutos"} com {t.pares === 1 ? "ele mesmo" : "eles mesmos"}
    </span>
  );
}

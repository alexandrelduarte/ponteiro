/**
 * Tendência pareada (P8): cada instituto comparado COM ELE MESMO.
 * Glifo + sinal além da cor — cor nunca é o único canal (docs/DESIGN.md §5.6).
 */
import { fmtSinal, type Tendencia as TendenciaModelo } from "@/lib/modelo";

export function Tendencia({ t, rotulo }: { t: TendenciaModelo | null; rotulo: string }) {
  let corpo: string;
  let cor = "text-cinza";

  if (!t) {
    corpo = "sem base p/ tendência";
  } else if (Math.abs(t.delta) < 0.8) {
    corpo = `▬ estável (${fmtSinal(t.delta)})`;
  } else if (t.delta > 0) {
    corpo = `▲ ${fmtSinal(t.delta)}`;
    cor = "text-confirma-texto";
  } else {
    corpo = `▼ ${fmtSinal(t.delta)}`;
    cor = "text-alerta-texto";
  }

  return (
    <span className="inline-flex items-baseline gap-1 font-mono text-xs">
      <span className="text-cinza">{rotulo}</span>
      <span className={`font-semibold ${cor}`}>{corpo}</span>
      {t ? (
        <span className="text-cinza">
          · {t.pares} par{t.pares > 1 ? "es" : ""}
        </span>
      ) : null}
    </span>
  );
}

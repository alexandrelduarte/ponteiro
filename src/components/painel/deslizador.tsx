"use client";

/**
 * Deslizador (docs/DESIGN.md §7.7).
 *
 * Alvo de toque de 44×44 (o mínimo do WCAG 2.2 AA é 24; o alvo do produto é o
 * de plataforma) e `aria-valuetext` em português COM unidade — `aria-valuenow`
 * sozinho lê "4" e não significa nada.
 */
import { useId, type CSSProperties, type ReactNode } from "react";
import { fmt } from "@/lib/modelo";
import type { FaixaSlider } from "./parametros-url";

export function Deslizador({
  rotulo,
  valor,
  faixa,
  sufixo,
  unidadeLeitura,
  dica,
  idTeste,
  className,
  onChange,
}: {
  rotulo: string;
  valor: number;
  faixa: FaixaSlider;
  /** sufixo curto exibido ao lado do número */
  sufixo: string;
  /** unidade por extenso, lida por leitor de tela */
  unidadeLeitura: string;
  /** ênfase da dica é NEGRITO (§4.3) — nunca caixa alta no meio da prosa */
  dica: ReactNode;
  idTeste?: string;
  className?: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const idDica = `${id}-dica`;
  const texto = fmt(valor, faixa.casas);
  const preenchido = ((valor - faixa.min) / (faixa.max - faixa.min)) * 100;

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-tinta">
          {rotulo}
        </label>
        <output htmlFor={id} className="font-mono text-sm text-confirma-texto">
          {texto}
          {sufixo}
        </output>
      </div>
      <input
        id={id}
        data-testid={idTeste}
        type="range"
        className="deslizador mt-1"
        min={faixa.min}
        max={faixa.max}
        step={faixa.passo}
        value={valor}
        aria-describedby={idDica}
        aria-valuetext={`${texto} ${unidadeLeitura}`}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ "--preenchido": `${preenchido}%` } as CSSProperties}
      />
      <p id={idDica} className="mt-1 text-xs leading-snug text-cinza">
        {dica}
      </p>
    </div>
  );
}

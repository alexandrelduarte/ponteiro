"use client";

/**
 * Régua (docs/DESIGN-V2.md §5.5 e §6.6, COPY-DECK §K).
 *
 * "Régua", não "parâmetro": são conteúdo editorial, não configuração avançada —
 * se o leitor pode supor uma puxada de 6,3 pontos e ver a página inteira passar
 * a descrever a vitória do outro candidato, ele aprende que o "cenário mais
 * provável" é função das suposições.
 *
 * Thumb de 24px VISÍVEIS dentro de alvo de 44px, com o anel por `box-shadow` de
 * blur zero (o CSS mora em globals.css). `aria-valuetext` em português COM
 * unidade: `aria-valuenow` sozinho lê "4" e não significa nada.
 */
import { useId, type CSSProperties, type ReactNode } from "react";
import { MaisSobre } from "@/components/ui/glossario";
import type { FaixaSlider } from "./parametros-url";

export function Deslizador({
  rotulo,
  valorExibido,
  leituraAcessivel,
  valor,
  faixa,
  dica,
  dicaResumo,
  idTeste,
  onChange,
}: {
  rotulo: string;
  /** o valor como a pessoa lê ("21 dias", "nenhuma puxada") */
  valorExibido: string;
  /** a frase inteira que o leitor de tela ouve, com unidade */
  leituraAcessivel: string;
  valor: number;
  faixa: FaixaSlider;
  /** a dica INTEIRA — mora na 2ª camada, a um toque do "?" */
  dica: ReactNode;
  /** a 1ª frase da dica, VERBATIM: é o que fica visível ao lado da régua */
  dicaResumo: ReactNode;
  idTeste?: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const idDica = `${id}-dica`;
  const preenchido = ((valor - faixa.min) / (faixa.max - faixa.min)) * 100;

  return (
    <div>
      <label htmlFor={id} className="block text-secao text-tinta">
        {rotulo}
      </label>
      <output htmlFor={id} className="mt-1 block text-corpo font-semibold text-ameixa numeros">
        {valorExibido}
      </output>
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
        aria-valuetext={leituraAcessivel}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ "--preenchido": `${preenchido}%` } as CSSProperties}
      />
      {/* DIETA (missão "ENCAIXE"): as quatro dicas somavam ~19 frases sempre
          visíveis dentro do grid das réguas — mais texto do que os controles
          que elas explicam. Fica visível a 1ª FRASE, palavra por palavra, e o
          resto abre no "?", na mesma folha/popover do glossário. Nenhuma
          palavra foi reescrita e nada saiu da página.
          O `aria-describedby` da régua aponta para a frase VISÍVEL: o texto
          inteiro está a um toque, para todo mundo do mesmo jeito — em vez de
          uma cópia `sr-only` que duplicaria os chips de glossário de dentro da
          dica e criaria paradas de tabulação invisíveis. */}
      <p id={idDica} className="mt-1 max-w-texto text-micro text-tinta-media">
        {dicaResumo}{" "}
        <MaisSobre titulo={rotulo} rotuloAcessivel={`ver a explicação completa: ${rotulo}`}>
          {dica}
        </MaisSobre>
      </p>
    </div>
  );
}

/**
 * Ficha técnica de um conceito — o mesmo bloco nos três style tiles, pintado
 * com as variáveis de cor de cada conceito (`--placa`, `--tinta`, `--ident`…).
 * Existe para que a escolha do vencedor seja feita com os números na tela:
 * hex, contraste WCAG 2 calculado, par tipográfico, assinatura e motion.
 */

export interface Ficha {
  nome: string;
  /** conceito de layout em uma frase */
  frase: string;
  /** o elemento-assinatura */
  assinatura: string;
  /** conceito de motion em uma frase */
  motion: string;
  /** [papel, família] */
  tipografia: [string, string][];
  /** [nome, hex, contraste calculado] */
  cores: [string, string, string][];
  deltaL: string;
}

export function FichaDoConceito({ ficha }: { ficha: Ficha }) {
  return (
    <section
      className="mt-8 rounded-[6px] p-4 md:p-6"
      style={{ background: "var(--placa)", boxShadow: "0 0 0 1px var(--vazio)" }}
    >
      <h2 className="text-[13px] md:text-[14px]" style={{ color: "var(--ident)", fontWeight: 600 }}>
        ficha do conceito {ficha.nome}
      </h2>

      <dl className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <dt className="text-[13px]" style={{ color: "var(--tinta2)" }}>
            layout
          </dt>
          <dd className="mt-1 text-[15px] leading-[1.5]">{ficha.frase}</dd>
        </div>
        <div>
          <dt className="text-[13px]" style={{ color: "var(--tinta2)" }}>
            elemento-assinatura
          </dt>
          <dd className="mt-1 text-[15px] leading-[1.5]">{ficha.assinatura}</dd>
        </div>
        <div>
          <dt className="text-[13px]" style={{ color: "var(--tinta2)" }}>
            motion
          </dt>
          <dd className="mt-1 text-[15px] leading-[1.5]">{ficha.motion}</dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-[13px]" style={{ color: "var(--tinta2)" }}>
            tipografia
          </p>
          <ul className="mt-1 grid gap-1">
            {ficha.tipografia.map(([papel, familia]) => (
              <li key={papel} className="text-[15px]">
                <span style={{ color: "var(--tinta2)" }}>{papel}: </span>
                {familia}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[13px]" style={{ color: "var(--tinta2)" }}>
            paleta e contraste WCAG 2 (calculado)
          </p>
          <ul className="mt-1 grid gap-1.5">
            {ficha.cores.map(([nome, hex, nota]) => (
              <li key={hex} className="flex items-center gap-2 text-[14px]">
                <span
                  aria-hidden="true"
                  className="inline-block h-4 w-4 flex-none rounded-[3px]"
                  style={{ background: hex, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.25)" }}
                />
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {nome} <span style={{ color: "var(--tinta2)" }}>{hex}</span> · {nota}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[14px]" style={{ color: "var(--tinta2)" }}>
            {ficha.deltaL}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Contexto social medido (não é achismo) — Server Component: texto fixo, zero
 * JavaScript enviado ao navegador.
 *
 * A "Síntese do contexto" é o segundo dos três blocos autorizados a usar
 * `--color-tela` (docs/DESIGN.md §3.2).
 */
import { Cartao } from "@/components/ui/cartao";
import { LinkExterno } from "@/components/ui/basicos";
import { CONTEXTO, SINTESE_CONTEXTO } from "@/data/contexto";

export function ContextoSocial() {
  return (
    <Cartao
      titulo="Contexto social"
      descricao="Indicadores medidos que sustentam a leitura — não é achismo."
      destaque="alerta"
    >
      {/* `items-start`: cada cartãozinho mede o próprio conteúdo. Esticados
          pela linha da grade, os mais curtos sobravam até 62px de espaço morto
          embaixo (medido a 768 e a 1440) — o mesmo efeito já corrigido no
          bloco REPLAY. */}
      <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CONTEXTO.map((c) => (
          <div key={c.titulo} className="rounded-controle border border-linha bg-mini p-3">
            <h3 className="text-sm font-bold">{c.titulo}</h3>
            <p className="mt-1 font-mono text-xs text-tinta">{c.dado}</p>
            <p className="mt-2 text-xs leading-snug text-cinza">{c.leitura}</p>
            <p className="mt-2">
              <LinkExterno href={c.fonte} className="text-xs text-confirma-texto">
                fonte
              </LinkExterno>
            </p>
          </div>
        ))}
        <div className="tela-urna flex flex-col justify-center rounded-controle bg-tela p-3">
          <h3 className="font-mono text-xs tracking-dado text-fosforo uppercase">
            Síntese do contexto
          </h3>
          <p className="mt-2 text-sm leading-snug text-fosforo-forte">{SINTESE_CONTEXTO}</p>
        </div>
      </div>
    </Cartao>
  );
}

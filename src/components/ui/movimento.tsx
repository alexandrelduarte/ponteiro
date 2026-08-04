"use client";

/**
 * Movimento — a lista fechada de `docs/DESIGN-V2.md` §7, com Motion.
 *
 * Regras duras que este módulo faz valer:
 *  - só `transform` e `opacity`; nada acima de 300 ms;
 *  - duração e easing SÓ por token: lidos de `tokens.css` em runtime, então
 *    `prefers-reduced-motion` (que zera os tokens) desliga tudo sem nenhum
 *    `if` espalhado pelos componentes;
 *  - nada anima na primeira pintura: a manchete e o enxame nascem prontos no
 *    HTML do servidor. `Contagem` só se mexe quando o número MUDA por ação do
 *    leitor — é feedback de interação, não espetáculo de carregamento.
 */
import { animate } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* ------------------------------------------------------------------ *
 * Leitura dos tokens de movimento                                    *
 * ------------------------------------------------------------------ */

const NUM = /-?\d*\.?\d+/g;

/** Duração de um token (`--dur-base`) em SEGUNDOS, como o Motion espera. */
export function duracaoDoToken(nome: string, padraoMs = 0): number {
  if (typeof window === "undefined") return padraoMs / 1000;
  const bruto = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  if (!bruto) return padraoMs / 1000;
  const valor = parseFloat(bruto);
  if (!isFinite(valor)) return padraoMs / 1000;
  return bruto.endsWith("ms") ? valor / 1000 : valor;
}

/** Easing de um token `cubic-bezier(a,b,c,d)` → tupla que o Motion aceita. */
export function easeDoToken(nome: string): [number, number, number, number] {
  const padrao: [number, number, number, number] = [0.2, 0, 0.2, 1];
  if (typeof window === "undefined") return padrao;
  const bruto = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  const partes = bruto.match(NUM)?.map(Number) ?? [];
  return partes.length === 4 ? (partes as [number, number, number, number]) : padrao;
}

/* ------------------------------------------------------------------ *
 * Contagem — count-up de número que REAGE                            *
 * ------------------------------------------------------------------ */

/**
 * Número que conta de onde estava até onde chegou.
 *
 * Só anima quando o valor MUDA depois da montagem (mexer numa régua, aplicar
 * um cenário, trocar de turno). No primeiro render devolve o valor final, que
 * é o mesmo do HTML do servidor: a manchete nunca espera JS e o CLS é zero
 * porque o texto tem largura reservada por `numeros` (tabular).
 *
 * Em `prefers-reduced-motion` a duração do token vai a 0 e o número troca seco.
 */
/** Formatador padrão: inteiro. Módulo-level para ser estável entre renders. */
const inteiro = (n: number) => String(Math.round(n));

export function Contagem({
  valor,
  formatar = inteiro,
  className,
}: {
  valor: number;
  /** precisa ser estável entre renders (constante de módulo ou `useCallback`) */
  formatar?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const anterior = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    const de = anterior.current;
    anterior.current = valor;
    if (!el || de === null || de === valor) return;

    const duracao = duracaoDoToken("--dur-base", 200);
    if (duracao <= 0) return;

    const controles = animate(de, valor, {
      duration: duracao,
      ease: easeDoToken("--ease-padrao"),
      onUpdate: (v) => {
        el.textContent = formatar(v);
      },
    });
    controles.then(() => {
      el.textContent = formatar(valor);
    });
    return () => controles.stop();
  }, [valor, formatar]);

  return (
    <span ref={ref} className={className}>
      {formatar(valor)}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Micro-celebração                                                   *
 * ------------------------------------------------------------------ */

/**
 * Pulso DISCRETO de `scale` quando `chave` muda — só `transform`, uma vez, e
 * só depois de um toque do leitor (nunca na montagem). Em reduced-motion a
 * rede de segurança dos tokens deixa a animação em 0,01 ms: o pulso não chega
 * a existir e o `animationend` fecha o ciclo na hora.
 */
export function Celebra({
  chave,
  children,
  className,
}: {
  chave: string | number;
  children: ReactNode;
  className?: string;
}) {
  const [pulsando, setPulsando] = useState(false);
  const anterior = useRef<string | number | null>(null);

  useEffect(() => {
    if (anterior.current === null) {
      anterior.current = chave;
      return;
    }
    if (anterior.current === chave) return;
    anterior.current = chave;
    setPulsando(true);
  }, [chave]);

  return (
    <span
      className={["inline-block", className, pulsando ? "celebra" : ""].filter(Boolean).join(" ")}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setPulsando(false);
      }}
    >
      {children}
    </span>
  );
}

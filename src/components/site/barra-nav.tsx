"use client";

/**
 * Barra de navegação sticky (pesquisa de branding §2.2, DECISOES.md).
 *
 * Sticky HONESTO: nada aparece nem se esconde com a rolagem (§7.2 bane a
 * coreografia de scroll) e nada anima altura — a barra já nasce compacta.
 * Fundo bruma CHAPADO (glassmorphism é banido) com filete; quando descolada
 * do topo (conteúdo passando por baixo), ganha `--shadow-flutua` — o mesmo
 * raciocínio da faixa de simulação: sombra só no que de fato flutua (§3.5).
 * A transição é só `opacity` (allow-list §7) e zera em reduced-motion via
 * token. Detecção por sentinela de 1px + IntersectionObserver — sem listener
 * de scroll; sem JS o filete fica e nada quebra (R8).
 *
 * As TRÊS rotas entram (a antiga nav omitia "Painel": a única volta à home
 * era o logo, que ninguém descobre). A página ativa vira pílula ameixa-bruma
 * com `aria-current="page"` — tinta sobre ameixa-bruma: 12,40:1 (§10.1).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROTAS } from "@/app/_lib/site";
import { Simbolo } from "./simbolo";

const CLASSE_LINK = [
  "inline-flex min-h-toque items-center rounded-plena px-3",
  "text-etiqueta font-semibold no-underline",
  "transition-colors duration-(--dur-rapida) ease-(--ease-padrao)",
].join(" ");

export function BarraNav() {
  const pathname = usePathname();
  const sentinela = useRef<HTMLDivElement>(null);
  const [descolada, setDescolada] = useState(false);

  useEffect(() => {
    const alvo = sentinela.current;
    if (!alvo || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entrada]) => {
      setDescolada(!entrada.isIntersecting);
    });
    io.observe(alvo);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* 1px observável imediatamente acima da barra; margem negativa devolve
          o pixel ao layout. Fora da tela ⇔ a barra está grudada no topo. */}
      <div ref={sentinela} aria-hidden="true" className="-mb-px h-px w-full" />
      <div className="sticky top-0 z-30 border-b border-filete bg-bruma">
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 shadow-flutua transition-opacity duration-(--dur-rapida) ease-(--ease-padrao) ${
            descolada ? "opacity-100" : "opacity-0"
          }`}
        />
        <nav
          aria-label="Páginas do site"
          className="relative mx-auto flex h-barra w-full max-w-pagina items-center gap-1 px-goteira md:px-goteira-md lg:px-goteira-lg"
        >
          {/* O bastão da marca: o símbolo SÓ aparece quando o cabeçalho de
              marca já rolou embora (§6.6.10 — nunca dois visíveis; decisão do
              dono, DECISOES.md). Transição só de opacity; sem JS fica oculto e
              nada quebra. Fora do fluxo de tab enquanto invisível. */}
          <Link
            href="/"
            aria-label="PONTEIRO — voltar ao início"
            aria-hidden={!descolada}
            tabIndex={descolada ? 0 : -1}
            className={`mr-1 inline-flex min-h-toque items-center rounded-campo pr-1 transition-opacity duration-(--dur-rapida) ease-(--ease-padrao) ${
              descolada ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Simbolo className="h-7 w-auto text-ameixa-forte" />
          </Link>
          {ROTAS.map((r) => {
            const ativa = pathname === r.href;
            return (
              <Link
                key={r.href}
                href={r.href}
                aria-current={ativa ? "page" : undefined}
                className={`${CLASSE_LINK} ${
                  ativa
                    ? "bg-ameixa-bruma text-tinta"
                    : "text-ameixa decoration-2 underline-offset-4 hover:text-ameixa-forte hover:underline"
                }`}
              >
                {r.titulo}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

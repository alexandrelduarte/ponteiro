"use client";

/**
 * O contêiner único de detalhe (docs/DESIGN-V2.md §6.4).
 *
 * Abaixo de `md` é uma FOLHA que sobe do rodapé da tela, com alça, véu atrás e
 * altura máxima de 85svh; a partir de `md` é o mesmo conteúdo como popover
 * ancorado no gatilho. Um componente só serve o glossário e o registro
 * completo da pesquisa — o leitor aprende o gesto uma vez.
 *
 * Acessibilidade: `button` real com `aria-expanded`, o painel logo depois dele
 * no DOM (a ordem de tabulação já entra no conteúdo), fecho por `Esc` e por
 * toque fora, e o foco volta para quem abriu.
 *
 * Movimento: `translateY` + `opacity`, entrada em `--dur-base`, saída em
 * `--dur-rapida` (a saída acelera, §7.1). Nada disso existe na primeira
 * pintura: o painel só nasce depois de um toque.
 */
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { duracaoDoToken, easeDoToken } from "./movimento";
import { ACOES } from "./textos";

export function Revelador({
  rotuloAcessivel,
  titulo,
  children,
  classeGatilho,
  conteudoGatilho,
  idTeste,
}: {
  /** nome acessível do botão — diz o que vai abrir ("o que é margem de erro") */
  rotuloAcessivel: string;
  /** título do painel, repetido para quem usa leitor de tela */
  titulo: string;
  children: ReactNode;
  classeGatilho: string;
  conteudoGatilho: ReactNode;
  idTeste?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const gatilhoRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  /* A 768–1440 o painel é absoluto com a esquerda no chip e 22rem de largura:
     chip perto da borda direita fazia a página inteira rolar de lado (medido:
     +101px no pior chip a 768). O deslocamento é medido ao abrir e escrito
     DIRETO no DOM (CSS var no próprio painel) — sem setState: o efeito só
     sincroniza o sistema externo, e o painel morre com a var ao fechar. */
  useLayoutEffect(() => {
    if (!aberto) return;
    if (!window.matchMedia("(min-width: 48rem)").matches) return;
    const gatilho = gatilhoRef.current?.getBoundingClientRect();
    const painel = painelRef.current;
    const larguraPainel = painel?.getBoundingClientRect().width;
    if (!gatilho || !painel || !larguraPainel) return;
    const estouro = gatilho.left + larguraPainel - (window.innerWidth - 16);
    if (estouro > 0) {
      const desloc = -Math.min(estouro, Math.max(gatilho.left - 16, 0));
      painel.style.setProperty("--desloc-popover", `${desloc}px`);
    }
  }, [aberto]);

  const fechar = (devolverFoco: boolean) => {
    setAberto(false);
    if (devolverFoco) gatilhoRef.current?.focus();
  };

  useEffect(() => {
    if (!aberto) return;
    fecharRef.current?.focus();

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      fechar(true);
    };
    const aoTocarFora = (e: PointerEvent) => {
      const alvo = e.target as Node | null;
      if (!alvo) return;
      if (painelRef.current?.contains(alvo) || gatilhoRef.current?.contains(alvo)) return;
      fechar(false);
    };

    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("pointerdown", aoTocarFora);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("pointerdown", aoTocarFora);
    };
  }, [aberto]);

  return (
    <span className="relative inline-block">
      <button
        ref={gatilhoRef}
        type="button"
        aria-expanded={aberto}
        aria-controls={`${id}-painel`}
        aria-label={rotuloAcessivel}
        data-testid={idTeste}
        onClick={() => setAberto((v) => !v)}
        className={classeGatilho}
      >
        {conteudoGatilho}
      </button>

      <AnimatePresence>
        {aberto ? (
          <>
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duracaoDoToken("--dur-rapida", 120) }}
              className="fixed inset-0 z-40 bg-veu md:hidden"
            />
            <motion.div
              ref={painelRef}
              id={`${id}-painel`}
              role="dialog"
              aria-label={titulo}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: 8,
                transition: {
                  duration: duracaoDoToken("--dur-rapida", 120),
                  ease: easeDoToken("--ease-saida"),
                },
              }}
              transition={{
                duration: duracaoDoToken("--dur-base", 200),
                ease: easeDoToken("--ease-padrao"),
              }}
              className={[
                "fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-y-auto",
                "rounded-t-bloco bg-placa p-bloco text-left shadow-erguido",
                "md:absolute md:inset-x-auto md:top-full md:bottom-auto md:mt-2",
                "md:left-[var(--desloc-popover,0px)]",
                "md:w-[22rem] md:max-w-[calc(100vw-2rem)] md:rounded-bloco",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className="mx-auto mb-3 block h-1 w-10 rounded-plena bg-contorno md:hidden"
              />
              <p className="text-secao text-tinta">{titulo}</p>
              <div className="mt-2 text-corpo text-tinta-media">{children}</div>
              <button
                ref={fecharRef}
                type="button"
                onClick={() => fechar(true)}
                className="mt-4 inline-flex min-h-toque items-center rounded-plena bg-ameixa-bruma px-4 text-corpo font-semibold text-tinta"
              >
                {ACOES.fecharFolha}
              </button>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

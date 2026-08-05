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
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/* Montado no cliente? SSR-safe sem setState-em-efeito: snapshot do servidor é
   false, do cliente é true — o portal só tenta tocar em `document` no cliente. */
const assinaturaVazia = () => () => {};
const useMontado = () =>
  useSyncExternalStore(
    assinaturaVazia,
    () => true,
    () => false,
  );
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
  const montado = useMontado();
  const gatilhoRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  /* O painel vive num PORTAL no <body> (aprendizado da iter-8 do loop): dentro
     do fluxo, qualquer ancestral com transform persistido vira bloco contentor
     de `position: fixed` — a folha mobile ficava presa no parágrafo animado, o
     z-index quebrava contra vizinhos, e a fileira da régua do enxame recebia o
     toque por cima da definição, fechando-a na mão do leitor. No body, nada
     disso existe (e o <div role="dialog"> sai de dentro do <p>).

     Em md+ o painel é posicionado por medição, em coordenadas de DOCUMENTO
     (rola junto com o conteúdo), com a borda direita clampada ao viewport −16px
     (o estouro de +101px da iter-6). Escrita direta no DOM — sem setState. */
  useLayoutEffect(() => {
    if (!aberto) return;
    if (!window.matchMedia("(min-width: 48rem)").matches) return;
    const gatilho = gatilhoRef.current?.getBoundingClientRect();
    const painel = painelRef.current;
    const larguraPainel = painel?.getBoundingClientRect().width;
    if (!gatilho || !painel || !larguraPainel) return;
    // Retângulo degenerado (gatilho sem layout — só acontece em automação que
    // dispara N aberturas no mesmo tique): não posicionar às cegas na origem.
    if (!gatilho.width && !gatilho.height) return;
    const esquerda = Math.max(16, Math.min(gatilho.left, window.innerWidth - 16 - larguraPainel));
    painel.style.top = `${window.scrollY + gatilho.bottom + 8}px`;
    painel.style.left = `${window.scrollX + esquerda}px`;
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

      {/* O portal fica SEMPRE montado (no cliente) e o AnimatePresence vive
          DENTRO dele: como filho direto do AnimatePresence, um portal não é
          reconhecido e nada renderiza; por dentro, a saída anima normalmente. */}
      {montado
        ? createPortal(
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
                      "md:absolute md:inset-x-auto md:bottom-auto",
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
            </AnimatePresence>,
            document.body,
          )
        : null}
    </span>
  );
}

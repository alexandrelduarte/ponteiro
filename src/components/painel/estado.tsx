"use client";

/**
 * Estado do painel — o único lugar do produto que guarda "o que o leitor mexeu".
 *
 * Invariantes:
 *  - `hojeMs` vem do SERVIDOR por prop e nunca é recalculado no cliente. O
 *    modelo é determinístico em `hojeMs`, então o HTML do servidor e a primeira
 *    renderização do cliente batem número a número (zero mismatch de hidratação);
 *  - o estado inicial é SEMPRE a base oficial + `PARAMS_PADRAO`. Um link com
 *    `?vies=…` é aplicado depois da montagem, pelo `SincronizadorURL` — é o que
 *    permite a página ser estática e a manchete não esperar JS;
 *  - simulação (R5) é local e rotulada: `serieAlterada` e `paramsAlterados`
 *    alimentam a faixa de aviso e nunca tocam a base oficial.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { PARAMS_PADRAO } from "@/data/constantes";
import type { ParamsModelo, Pesquisa } from "@/data/tipos";
import {
  calcCampoCompleto,
  rodarModelo,
  type CampoCompleto,
  type ResultadoModelo,
} from "@/lib/modelo";
import { ehPadrao, paramsParaQuery } from "./parametros-url";
import { EstadoVazio } from "./estado-vazio";

export type Aba = "principal" | "todos";

export interface EstadoPainel {
  /** instante de referência do modelo, fixado no servidor */
  hojeMs: number;
  /** série oficial (nunca muda no cliente) */
  pesquisasOficiais: Pesquisa[];
  /** série em uso — igual à oficial fora do modo simulação */
  pesquisas: Pesquisa[];
  params: ParamsModelo;
  /** resultado do modelo; garantido não-nulo (série vazia troca a página) */
  M: ResultadoModelo;
  campoCompleto: CampoCompleto | null;

  serieAlterada: boolean;
  paramsAlterados: boolean;
  simulando: boolean;

  aba: Aba;
  turnoGrafico: 1 | 2;

  definirParam: (campo: keyof ParamsModelo, valor: number) => void;
  definirParams: (params: ParamsModelo) => void;
  restaurarParams: () => void;
  adicionarPesquisa: (p: Pesquisa) => void;
  removerPesquisa: (id: string) => void;
  restaurarSerie: () => void;
  restaurarTudo: () => void;
  definirAba: (aba: Aba) => void;
  definirTurnoGrafico: (turno: 1 | 2) => void;
}

const Contexto = createContext<EstadoPainel | null>(null);

export function usePainel(): EstadoPainel {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("usePainel precisa estar dentro de <PainelProvider>.");
  return ctx;
}

export function PainelProvider({
  hojeMs,
  pesquisasOficiais,
  children,
}: {
  hojeMs: number;
  pesquisasOficiais: Pesquisa[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>(pesquisasOficiais);
  const [params, setParams] = useState<ParamsModelo>(PARAMS_PADRAO);
  const [serieAlterada, setSerieAlterada] = useState(false);
  const [aba, definirAba] = useState<Aba>("principal");
  const [turnoGrafico, definirTurnoGrafico] = useState<1 | 2>(2);

  const M = useMemo(() => rodarModelo(pesquisas, params, hojeMs), [pesquisas, params, hojeMs]);
  const campoCompleto = useMemo(
    () => calcCampoCompleto(pesquisas, params.meiaVida, hojeMs),
    [pesquisas, params.meiaVida, hojeMs],
  );

  const paramsAlterados = !ehPadrao(params);

  /* ---- URL compartilhável: escreve só o que sai do padrão ---- */
  const primeiraSincronia = useRef(true);
  useEffect(() => {
    if (primeiraSincronia.current) {
      primeiraSincronia.current = false;
      return;
    }
    const query = paramsParaQuery(params);
    const id = window.setTimeout(() => {
      if (window.location.search === query) return;
      router.replace(`${window.location.pathname}${query}`, { scroll: false });
    }, 400);
    return () => window.clearTimeout(id);
  }, [params, router]);

  const definirParam = useCallback((campo: keyof ParamsModelo, valor: number) => {
    setParams((p) => (p[campo] === valor ? p : { ...p, [campo]: valor }));
  }, []);

  const definirParams = useCallback((novos: ParamsModelo) => setParams(novos), []);
  const restaurarParams = useCallback(() => setParams(PARAMS_PADRAO), []);

  const adicionarPesquisa = useCallback((nova: Pesquisa) => {
    setPesquisas((ps) => [...ps, nova]);
    setSerieAlterada(true);
  }, []);

  const removerPesquisa = useCallback((id: string) => {
    setPesquisas((ps) => ps.filter((p) => p.id !== id));
    setSerieAlterada(true);
  }, []);

  const restaurarSerie = useCallback(() => {
    setPesquisas(pesquisasOficiais);
    setSerieAlterada(false);
  }, [pesquisasOficiais]);

  const restaurarTudo = useCallback(() => {
    setPesquisas(pesquisasOficiais);
    setSerieAlterada(false);
    setParams(PARAMS_PADRAO);
  }, [pesquisasOficiais]);

  const valor = useMemo<EstadoPainel | null>(() => {
    if (!M) return null;
    return {
      hojeMs,
      pesquisasOficiais,
      pesquisas,
      params,
      M,
      campoCompleto,
      serieAlterada,
      paramsAlterados,
      simulando: serieAlterada || paramsAlterados,
      aba,
      turnoGrafico,
      definirParam,
      definirParams,
      restaurarParams,
      adicionarPesquisa,
      removerPesquisa,
      restaurarSerie,
      restaurarTudo,
      definirAba,
      definirTurnoGrafico,
    };
  }, [
    hojeMs,
    pesquisasOficiais,
    pesquisas,
    params,
    M,
    campoCompleto,
    serieAlterada,
    paramsAlterados,
    aba,
    turnoGrafico,
    definirParam,
    definirParams,
    restaurarParams,
    adicionarPesquisa,
    removerPesquisa,
    restaurarSerie,
    restaurarTudo,
  ]);

  /* Série sem nenhuma pesquisa de 2º turno: nada de modelo é renderizado
     (evita divisão por zero e número fantasma) — docs/DESIGN.md §8.2. */
  if (!valor) return <EstadoVazio onRestaurar={restaurarSerie} />;

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

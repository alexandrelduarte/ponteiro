"use client";

/**
 * Gráficos carregados sob demanda — em dois estágios.
 *
 * 1) `next/dynamic` com `ssr: false` de propósito: o Recharts mede o contêiner
 *    para desenhar, então no servidor ele renderiza vazio e reclamaria de
 *    largura 0. O esqueleto tem a altura exata do gráfico, então a troca não
 *    move nada na página (CLS 0) — e nenhum NÚMERO do painel depende disto:
 *    a manchete já veio do servidor.
 * 2) `SoQuandoVisivel`: o chunk do Recharts (~200 KB) só é baixado quando o
 *    gráfico se aproxima do viewport (IntersectionObserver, margem de 400px).
 *    Quem só lê a manchete nunca paga pelos gráficos — e o LCP simulado em
 *    4G lento deixa de arrastar o bundle inteiro no grafo crítico.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps, type ComponentType } from "react";
import { EsqueletoGrafico } from "./comum";

function soQuandoVisivel<P extends object>(Interno: ComponentType<P>): ComponentType<P> {
  function ComGate(props: P) {
    const ref = useRef<HTMLDivElement>(null);
    const [visivel, setVisivel] = useState(false);
    useEffect(() => {
      const el = ref.current;
      if (!el || visivel) return;
      if (!("IntersectionObserver" in window)) {
        setVisivel(true);
        return;
      }
      const observador = new IntersectionObserver(
        (entradas) => {
          if (entradas.some((e) => e.isIntersecting)) {
            setVisivel(true);
            observador.disconnect();
          }
        },
        { rootMargin: "400px 0px" },
      );
      observador.observe(el);
      return () => observador.disconnect();
    }, [visivel]);
    return (
      <div ref={ref} className="h-full w-full">
        {visivel ? <Interno {...props} /> : <EsqueletoGrafico />}
      </div>
    );
  }
  return ComGate;
}

const EvolucaoDinamico = dynamic(() => import("./evolucao"), {
  ssr: false,
  loading: EsqueletoGrafico,
});

const DistribuicaoDinamico = dynamic(() => import("./distribuicao"), {
  ssr: false,
  loading: EsqueletoGrafico,
});

const SensibilidadeDinamico = dynamic(() => import("./sensibilidade"), {
  ssr: false,
  loading: EsqueletoGrafico,
});

const ProbabilidadeTempoDinamico = dynamic(() => import("./probabilidade-tempo"), {
  ssr: false,
  loading: EsqueletoGrafico,
});

export const EvolucaoLazy: ComponentType<ComponentProps<typeof EvolucaoDinamico>> =
  soQuandoVisivel(EvolucaoDinamico);
export const DistribuicaoLazy: ComponentType<ComponentProps<typeof DistribuicaoDinamico>> =
  soQuandoVisivel(DistribuicaoDinamico);
export const SensibilidadeLazy: ComponentType<ComponentProps<typeof SensibilidadeDinamico>> =
  soQuandoVisivel(SensibilidadeDinamico);
export const ProbabilidadeTempoLazy: ComponentType<
  ComponentProps<typeof ProbabilidadeTempoDinamico>
> = soQuandoVisivel(ProbabilidadeTempoDinamico);

"use client";

/**
 * Faixa "Como ler esta página" (COPY-DECK §D).
 *
 * Colapsável, três passos, 20 segundos. É `<button aria-expanded>` + região —
 * não `<details>` — porque o rótulo muda de "Abrir" para "Fechar" e porque o
 * estado precisa ser anunciado. Fechada por padrão: quem já sabe ler a página
 * não paga por ela; quem não sabe encontra a porta antes do primeiro gráfico.
 */
import { useId, useState } from "react";
import { Bloco } from "@/components/ui/blocos";
import { Termo } from "@/components/ui/glossario";

export function ComoLer() {
  const [aberta, setAberta] = useState(false);
  const id = useId();

  return (
    <Bloco>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-secao text-tinta">Como ler esta página</h2>
          <p className="text-micro text-tinta-media numeros">3 passos · 20 segundos</p>
        </div>
        <button
          type="button"
          data-testid="como-ler-alternar"
          aria-expanded={aberta}
          aria-controls={id}
          onClick={() => setAberta((v) => !v)}
          className="inline-flex min-h-toque items-center rounded-plena bg-ameixa-bruma px-5 text-corpo font-semibold text-tinta transition-colors duration-(--dur-rapida) ease-(--ease-padrao) hover:bg-ameixa-tenue"
        >
          {aberta ? "Fechar" : "Abrir"}
        </button>
      </div>

      {aberta ? (
        <div id={id} data-testid="como-ler-conteudo" className="mt-4 max-w-texto space-y-3">
          <p className="text-corpo text-tinta-media">
            <b className="font-semibold text-tinta">
              1. O número grande é uma chance, não um resultado.
            </b>{" "}
            Ele diz em quantas eleições parecidas com esta cada um termina eleito.
          </p>
          <div className="flex flex-wrap items-start gap-4">
            <p className="min-w-[16rem] flex-1 text-corpo text-tinta-media">
              <b className="font-semibold text-tinta">
                2. As 100 bolinhas são 100 resultados possíveis.
              </b>{" "}
              Conte de que lado da régua elas caem. A régua do meio é o empate.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático, sem otimização a fazer */}
            <img
              src="/ilustracoes/explicando-incerteza.svg"
              alt=""
              width={320}
              height={200}
              className="h-auto w-full max-w-[13rem]"
            />
          </div>
          <p className="text-corpo text-tinta-media">
            <b className="font-semibold text-tinta">3. Palavra difícil é para tocar.</b> Onde tiver
            um chip como <Termo chave="margemErro" idTeste="chip-glossario-como-ler" />, toque: a
            explicação abre aqui mesmo.
          </p>
          <p className="text-corpo text-tinta-media">
            <b className="font-semibold text-tinta">Ninguém aqui torce.</b> Os números saem de
            pesquisas registradas no TSE, com link para a fonte. O painel também faz quatro
            suposições para calcular a chance — elas ficam à vista, e você pode mexer em todas.
          </p>
        </div>
      ) : null}
    </Bloco>
  );
}

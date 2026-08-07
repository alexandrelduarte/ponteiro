/**
 * "Quando saem as próximas pesquisas?" — bloco da home, entre "De onde vêm
 * esses números?" e "Antes de sair".
 *
 * Toda redação é CARIMBADA (AUDITORIA-COPY §15). As condições de veto moram
 * no cálculo (src/lib/proximas.ts: janela de 120 dias, variante `.unico`,
 * teto de 25/10, dias em America/Sao_Paulo); aqui só se escolhe a frase
 * carimbada certa para cada estado. Server Component: o bloco muda com a
 * passagem do tempo via ISR, sem JavaScript.
 */
import Link from "next/link";
import { Bloco, Pergunta, Resposta, Traduzindo } from "@/components/ui/blocos";
import type { Proximas } from "@/lib/proximas";

function ddmm(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function Linha({ r }: { r: Proximas["institutos"][number] }) {
  const inicio = r.unico
    ? `última em ${ddmm(r.ultimaFimISO)} · a anterior saiu ${r.ritmoDias} dias antes`
    : `última em ${ddmm(r.ultimaFimISO)} · vem publicando a cada ${r.ritmoDias} dias`;
  const fim = !r.publicavel
    ? "" // §15.6.4: prevista depois de 25/10 não é publicada
    : r.atrasada
      ? r.unico
        ? " · uma nova pode sair a qualquer momento"
        : " · pelo ritmo, uma nova pode sair a qualquer momento"
      : ` · próxima por volta de ${ddmm(r.previstaISO)}`;
  return (
    <li className="flex min-h-toque flex-wrap items-center gap-x-3 gap-y-0.5 py-1.5">
      <Link
        href={`/pesquisas/${r.slugUltima}`}
        className="font-semibold text-ameixa underline decoration-from-font underline-offset-2"
      >
        {r.instituto}
      </Link>
      <span className="text-corpo text-tinta-media numeros">
        {inicio}
        {fim}
      </span>
    </li>
  );
}

export function ProximasPesquisas({ proximas }: { proximas: Proximas }) {
  const { institutos, semRitmo, eventos } = proximas;
  if (!institutos.length && !eventos.length) return null;

  return (
    <Bloco rotuladoPor="titulo-proximas">
      <div className="lg:grid lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div>
          <Pergunta id="titulo-proximas">Quando saem as próximas pesquisas?</Pergunta>
          <Resposta>
            Instituto não marca data. Dá para ver o ritmo de cada casa e as datas fixas do
            calendário da eleição.
          </Resposta>
        </div>
        <Traduzindo className="lg:mt-0">
          O ritmo é o intervalo típico entre uma pesquisa e a seguinte da mesma casa. Ele é contado
          pelas datas de fim das entrevistas. A data estimada é isso: uma estimativa, não uma
          promessa.
        </Traduzindo>
      </div>

      {institutos.length ? (
        <ul className="mt-4">
          {institutos.map((r) => (
            <Linha key={r.institutoId} r={r} />
          ))}
        </ul>
      ) : null}
      {semRitmo.length ? (
        <p className="mt-2 max-w-texto text-micro text-tinta-media">
          Institutos com uma pesquisa só no painel ainda não mostram ritmo: {semRitmo.join(", ")}.
        </p>
      ) : null}

      <p className="mt-3 max-w-texto text-micro text-tinta-media">
        A estimativa é só o ritmo passado de cada casa, e ritmo passado não marca data. As datas são
        as do fim das entrevistas. A publicação costuma sair alguns dias depois. E o passo não é
        fixo: perto da eleição, os institutos costumam publicar mais vezes.
      </p>

      {eventos.length ? (
        <div className="mt-6">
          <h3 className="text-secao text-tinta">Datas oficiais da eleição</h3>
          <ul className="mt-2">
            {eventos.map((e) => (
              <li
                key={e.dataISO}
                className="flex min-h-8 flex-wrap items-center gap-x-3 py-0.5 text-corpo text-tinta-media numeros"
              >
                <span className="text-tinta">{e.nome}</span>
                <span>
                  — <time dateTime={e.dataISO}>{ddmm(e.dataISO)}</time>
                  {" · "}
                  {e.faltamDias === 0
                    ? "é hoje"
                    : e.faltamDias === 1
                      ? "falta 1 dia"
                      : `faltam ${e.faltamDias} dias`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Bloco>
  );
}

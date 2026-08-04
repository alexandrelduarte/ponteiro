import Link from "next/link";
import { fmt, fmtSinal } from "@/lib/modelo";
import { montarRetrato } from "./_lib/retrato";

/**
 * Índice do laboratório de design (Fase 3 do redesign v2).
 *
 * Neutro de propósito: quem escolhe o vencedor não pode ser influenciado pela
 * página que apenas lista os candidatos. Sem cor de marca, sem paleta de
 * nenhum dos três conceitos — só a informação necessária para comparar.
 */

const CONCEITOS = [
  {
    href: "/design-lab/conceito-a",
    nome: "A · LATÃO",
    identidade: "latão #6B4A11 (ocre-metal, família terceira quente)",
    tipografia: "Bricolage Grotesque + Public Sans",
    assinatura: "A RÉGUA DE 100 GRADUAÇÕES — escala de instrumento, 1 dimensão",
    layout: "mesa de instrumento: placa branca única sobre bruma fria, blocos chapados",
  },
  {
    href: "/design-lab/conceito-b",
    nome: "B · ENXAME",
    identidade: "ameixa #5A3A66 (violeta-acinzentado, família terceira fria)",
    tipografia: "Instrument Serif + Lexend",
    assinatura: "O ENXAME DE 100 — quantile dotplot sobre a régua da diferença",
    layout: "conversa: blocos arredondados sem borda, frase que conclui antes do número",
  },
  {
    href: "/design-lab/conceito-c",
    nome: "C · CHUMBO",
    identidade: "chumbo #3B3E3D (acromática: só os candidatos têm matiz)",
    tipografia: "Schibsted Grotesk + Atkinson Hyperlegible Next",
    assinatura: "O CAMPO DE 100 — grade 10×10 com contorno em degrau",
    layout: "página de tipografia: sem cartão, sem raio, réguas grossas de 4 px",
  },
] as const;

export default async function IndiceDesignLab() {
  const r = await montarRetrato();

  return (
    <div style={{ background: "#FFFFFF", color: "#15181A", minHeight: "100vh" }}>
      <main
        className="mx-auto w-full max-w-[860px] px-4 py-10 md:px-8"
        style={{ fontFamily: "var(--fonte-a-texto)" }}
      >
        <h1 className="text-[28px] leading-tight md:text-[36px]" style={{ fontWeight: 700 }}>
          Laboratório de design — PONTEIRO v2
        </h1>
        <p className="mt-3 max-w-[62ch] text-[16px] leading-[1.6]" style={{ color: "#565C5C" }}>
          Fase 3, parte 1: três conceitos divergentes materializados como style tiles reais, com os
          números do modelo oficial (seed local, <code>PARAMS_PADRAO</code>). Nenhum deles é o
          vencedor — a escolha é do orquestrador.
        </p>

        <section className="mt-8 rounded-[6px] p-4 md:p-5" style={{ background: "#F2F3F2" }}>
          <h2 className="text-[13px]" style={{ fontWeight: 600, color: "#565C5C" }}>
            os números que os três desenham
          </h2>
          <ul className="mt-2 grid gap-1 text-[15px] leading-[1.6]">
            <li>
              chance de ser eleito (projeção 25/10): Lula {r.lulaEm100} em 100 · Flávio{" "}
              {r.flavioEm100} em 100
            </li>
            <li>
              à frente no 2º turno: Lula {r.lulaMargemEm100} em 100 · Flávio {r.flavioMargemEm100} em
              100
            </li>
            <li>
              2º turno: Lula {fmt(r.mediaLula)}% × Flávio {fmt(r.mediaFlavio)}% · diferença{" "}
              {fmtSinal(r.margem)} p.p. · incerteza ±{fmt(r.incerteza)} p.p.
            </li>
            <li>
              intervalo de 80% no dia da votação: {fmtSinal(r.int80[0])} a {fmtSinal(r.int80[1])} p.p.
            </li>
            <li>
              {r.totalPesquisas} pesquisas na série · {r.qtdEmpate} de {r.qtdRecentes} recentes em
              empate técnico · faltam {r.dias1T} dias para o 1º turno e {r.dias2T} para o 2º
            </li>
          </ul>
        </section>

        <ul className="mt-8 grid gap-4">
          {CONCEITOS.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="block rounded-[6px] p-4 transition-colors duration-150 hover:bg-[#F2F3F2] md:p-6"
                style={{ boxShadow: "0 0 0 2px #E4E7E6" }}
              >
                <p className="text-[20px] md:text-[24px]" style={{ fontWeight: 700 }}>
                  {c.nome}
                </p>
                <dl className="mt-3 grid gap-1.5 text-[15px] leading-[1.5]">
                  <Par etiqueta="layout" valor={c.layout} />
                  <Par etiqueta="assinatura" valor={c.assinatura} />
                  <Par etiqueta="identidade" valor={c.identidade} />
                  <Par etiqueta="tipografia" valor={c.tipografia} />
                </dl>
                <p className="mt-3 text-[15px] underline underline-offset-4" style={{ fontWeight: 600 }}>
                  abrir o style tile →
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-[14px] leading-[1.6]" style={{ color: "#565C5C" }}>
          Página interna: <code>robots: index false</code>, fora do sitemap (a lista de rotas
          públicas em <code>_lib/site.ts</code> é literal). A salvaguarda vale nos três: a agulha do
          PONTEIRO é marca estática — nenhum conceito transforma o hero num medidor animado.
        </p>
      </main>
    </div>
  );
}

function Par({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-2">
      <dt style={{ color: "#565C5C" }}>{etiqueta}</dt>
      <dd>{valor}</dd>
    </div>
  );
}

/**
 * /admin — a única porta de escrita da série (R2/R3).
 *
 * Quatro estados, nesta ordem: sem configuração de banco (R8) · sem sessão ·
 * com sessão mas fora de `ADMIN_EMAILS` · administrador.
 *
 * A checagem aqui é para ESCOLHER A TELA. A autorização de verdade é
 * revalidada dentro de cada Server Action e de cada leitura privilegiada —
 * uma Server Action é um endpoint POST público.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { Cartao } from "@/components/ui/cartao";
import { AvisoErro, Secao, Vazio } from "@/components/ui/basicos";
import { AcoesPendente } from "@/components/admin/acoes-pendente";
import { BotaoAtualizar } from "@/components/admin/botao-atualizar";
import { BotaoRemover } from "@/components/admin/botao-remover";
import { BotaoSair } from "@/components/admin/botao-sair";
import { FormInclusao } from "@/components/admin/form-inclusao";
import { FormLogin } from "@/components/admin/form-login";
import { PARAMS_PADRAO } from "@/data/constantes";
import type { Pesquisa } from "@/data/tipos";
import { getAdmin } from "@/lib/admin/auth";
import { getPendentes, getPesquisasPublicadas, type PesquisaPendente } from "@/lib/dados";
import { fmt, fmtData, fmtSinal, pct, rodarModelo } from "@/lib/modelo";
import { supabaseConfigurado } from "@/lib/supabase/publico";
import { getUsuario } from "@/lib/supabase/sessao";
import { instanteDoRender } from "../_lib/relogio";
import { getAuditoria } from "./auditoria";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administração",
  description: "Fila de aprovação da série de pesquisas.",
  robots: { index: false, follow: false },
};

const TZ = "America/Sao_Paulo";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-leitura px-goteira pt-8 pb-16 lg:px-goteira-lg">
      <p className="font-mono text-xs tracking-sobretitulo text-confirma-texto uppercase">
        Área restrita · aprovação humana da série
      </p>
      <h1 className="mt-1 text-titulo">ADMINISTRAÇÃO</h1>
      {children}
      <p className="mt-secao">
        <Link
          href="/"
          className="inline-flex min-h-toque items-center text-sm font-semibold text-confirma-texto underline decoration-dotted underline-offset-2"
        >
          ← voltar ao painel
        </Link>
      </p>
    </main>
  );
}

/** Pendente → `Pesquisa` para simular o agregado com ela dentro. */
function paraPesquisa(p: PesquisaPendente): Pesquisa | null {
  const l2 = p.t2.lula;
  const f2 = p.t2.flavio;
  if (l2 === null || f2 === null) return null;
  return {
    id: p.id,
    instituto: p.instituto,
    contratante: p.contratante ?? "—",
    inicio: p.inicio,
    fim: p.fim,
    n: p.n ?? 1000,
    moe: p.moe ?? 2,
    tse: p.tse ?? "—",
    t1: p.t1 && p.t1.lula !== null && p.t1.flavio !== null ? p.t1 : null,
    t2: { lula: l2, flavio: f2, bnns: p.t2.bnns },
    fonte: p.fonte,
  };
}

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const busca = await searchParams;
  const erroLogin = typeof busca.erro === "string" ? busca.erro : null;

  /* ---------- 1. sem Supabase (R8) ---------- */
  if (!supabaseConfigurado()) {
    return (
      <Moldura>
        <div className="mt-4 max-w-texto">
          <AvisoErro>
            admin indisponível sem configuração — este ambiente roda apenas com a base editorial
            local. O painel público continua completo; a fila de aprovação, o login e a auditoria só
            existem quando as variáveis do Supabase estão definidas.
          </AvisoErro>
        </div>
      </Moldura>
    );
  }

  const usuario = await getUsuario();

  /* ---------- 2. sem sessão ---------- */
  if (!usuario) {
    return (
      <Moldura>
        <p className="mt-2 max-w-texto text-sm leading-leitura text-cinza">
          Publicar uma pesquisa na série é um ato registrado: entra na auditoria e aparece na linha
          do tempo pública. Por isso o acesso é por link de uso único enviado por e-mail, e só para
          endereços previamente autorizados no servidor.
        </p>
        {erroLogin ? (
          <div className="mt-4 max-w-texto">
            <AvisoErro>
              {erroLogin === "sem-configuracao"
                ? "login indisponível neste ambiente."
                : "não foi possível concluir o login com esse link — ele pode ter expirado ou já ter sido usado. Peça um novo abaixo."}
            </AvisoErro>
          </div>
        ) : null}
        <FormLogin />
      </Moldura>
    );
  }

  const admin = await getAdmin();

  /* ---------- 3. sessão sem permissão ---------- */
  if (!admin) {
    return (
      <Moldura>
        <div className="mt-4 max-w-texto space-y-3">
          <AvisoErro>
            a conta <b>{usuario.email}</b> não está autorizada a administrar a série. Nada foi
            alterado e o acesso ficou registrado.
          </AvisoErro>
          <BotaoSair />
        </div>
      </Moldura>
    );
  }

  /* ---------- 4. administrador ---------- */
  const [pendentes, publicadas, auditoria, hojeMs] = await Promise.all([
    getPendentes(),
    getPesquisasPublicadas(),
    getAuditoria(),
    instanteDoRender(),
  ]);

  const base = rodarModelo(publicadas, PARAMS_PADRAO, hojeMs);

  const fila = pendentes.map((p) => {
    const convertida = paraPesquisa(p);
    return {
      p,
      depois: convertida ? rodarModelo([...publicadas, convertida], PARAMS_PADRAO, hojeMs) : null,
    };
  });

  return (
    <Moldura>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-sm text-cinza">
          conectado como <b className="text-tinta">{admin.email}</b>
        </p>
        <BotaoSair />
      </div>

      <Secao>
        <Cartao titulo="Coletor automático" destaque="confirma">
          <p className="mb-3 text-sm text-cinza">
            Busca rodadas novas dos institutos e as coloca na fila como <b>pendentes</b> — nada é
            publicado sem aprovação (R3). O cron já faz isso uma vez por dia; este botão serve para
            antecipar.
          </p>
          <BotaoAtualizar />
        </Cartao>
      </Secao>

      <Secao>
        <Cartao
          titulo={`Fila de aprovação (${fila.length}) · o que cada pesquisa faz com o agregado`}
          destaque="alerta"
        >
          {fila.length === 0 ? (
            <Vazio titulo="Nada aguardando aprovação.">
              Quando o coletor encontrar uma rodada nova, ela aparece aqui com o efeito que teria
              sobre a margem e sobre a probabilidade — antes de você decidir.
            </Vazio>
          ) : (
            <ul className="space-y-4">
              {fila.map(({ p, depois }) => {
                const descricao = `${p.instituto} · campo ${fmtData(p.inicio)}–${fmtData(p.fim)}`;
                return (
                  <li key={p.id} className="rounded-cartao border border-linha bg-mini p-cartao">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-sm font-bold text-tinta">{descricao}</h3>
                      <span className="font-mono text-xs text-cinza">
                        origem {p.origem} · recebida em{" "}
                        {formatInTimeZone(Date.parse(p.criadoEm), TZ, "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>

                    <p className="mt-1 font-mono text-xs text-cinza">
                      2ºT {fmt(p.t2.lula)}%×{fmt(p.t2.flavio)}% · 1ºT{" "}
                      {p.t1 && p.t1.lula !== null
                        ? `${fmt(p.t1.lula)}%×${fmt(p.t1.flavio)}%`
                        : "n/d"}{" "}
                      · n {p.n ?? "n/d"} · ±{fmt(p.moe)} · TSE {p.tse ?? "n/d"}
                    </p>
                    <p className="mt-1 font-mono text-xs break-all text-cinza">
                      fonte: {p.fonte ?? "não informada"}
                    </p>

                    {base && depois ? (
                      <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
                        <div className="rounded-controle border border-linha bg-cartao p-2">
                          <dt className="text-cinza uppercase">margem 2ºT</dt>
                          <dd className="text-dado">
                            {fmtSinal(base.margem)} → {fmtSinal(depois.margem)}
                          </dd>
                          <dd className="text-cinza">
                            variação {fmtSinal(depois.margem - base.margem)} p.p.
                          </dd>
                        </div>
                        <div className="rounded-controle border border-linha bg-cartao p-2">
                          <dt className="text-cinza uppercase">chance de Lula (dia)</dt>
                          <dd className="text-dado">
                            {pct(base.eleito.dia.l)} → {pct(depois.eleito.dia.l)}
                          </dd>
                          <dd className="text-cinza">
                            variação{" "}
                            {fmtSinal(
                              Math.round(depois.eleito.dia.l * 100) -
                                Math.round(base.eleito.dia.l * 100),
                              0,
                            )}{" "}
                            p.p.
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="mt-3">
                        <AvisoErro>
                          não foi possível simular o efeito desta linha no agregado — confira os
                          números do 2º turno antes de aprovar.
                        </AvisoErro>
                      </p>
                    )}

                    {p.bruto ? (
                      <details className="mt-3 text-xs">
                        <summary className="font-semibold text-cinza">
                          Resposta crua da IA (texto não verificado)
                        </summary>
                        <pre className="mt-1 max-h-64 overflow-auto rounded-controle bg-cartao p-2 font-mono text-xs whitespace-pre-wrap text-tinta">
                          <code>{JSON.stringify(p.bruto, null, 2)}</code>
                        </pre>
                      </details>
                    ) : null}

                    <AcoesPendente id={p.id} descricao={descricao} />
                  </li>
                );
              })}
            </ul>
          )}
        </Cartao>
      </Secao>

      <Secao>
        <Cartao titulo="Inclusão manual (entra publicada, com auditoria)" destaque="tinta">
          <FormInclusao />
        </Cartao>
      </Secao>

      <Secao>
        <Cartao titulo={`Série publicada (${publicadas.length})`}>
          <ul className="divide-y divide-linha">
            {publicadas.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                <span className="font-mono text-xs text-cinza">
                  <b className="font-sans text-sm text-tinta">{p.instituto}</b> ·{" "}
                  {fmtData(p.inicio)}–{fmtData(p.fim)} · 2ºT {fmt(p.t2.lula)}%×{fmt(p.t2.flavio)}% ·{" "}
                  {p.tse}
                </span>
                {UUID.test(p.id) ? (
                  <BotaoRemover
                    id={p.id}
                    descricao={`${p.instituto} (campo até ${fmtData(p.fim)})`}
                  />
                ) : (
                  <span className="font-mono text-xs text-cinza">base editorial</span>
                )}
              </li>
            ))}
          </ul>
        </Cartao>
      </Secao>

      <Secao>
        <Cartao titulo={`Auditoria completa (${auditoria.length} registros mais recentes)`}>
          {auditoria.length === 0 ? (
            <Vazio titulo="Nenhum registro de auditoria ainda.">
              Toda aprovação, rejeição, inclusão e remoção grava uma linha aqui, com o e-mail de
              quem executou. O feed público de /historico mostra os mesmos eventos sem o ator.
            </Vazio>
          ) : (
            <ul className="space-y-2">
              {auditoria.map((l) => (
                <li key={l.id} className="border-t border-linha pt-2">
                  <p className="font-mono text-xs text-cinza">
                    {formatInTimeZone(Date.parse(l.em), TZ, "dd/MM/yyyy HH:mm")} ·{" "}
                    <b className="text-tinta">{l.acao}</b> · {l.entidade}
                    {l.entidadeId ? ` ${l.entidadeId}` : ""} · por {l.ator}
                  </p>
                  {l.detalhes ? (
                    <details className="mt-1 text-xs">
                      <summary className="text-cinza">detalhes</summary>
                      <pre className="mt-1 max-h-64 overflow-auto rounded-controle bg-mini p-2 font-mono text-xs whitespace-pre-wrap text-tinta">
                        <code>{JSON.stringify(l.detalhes, null, 2)}</code>
                      </pre>
                    </details>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Cartao>
      </Secao>
    </Moldura>
  );
}

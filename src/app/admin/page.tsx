/**
 * /admin — a única porta de escrita da série (R2/R3).
 *
 * Quatro estados, nesta ordem: sem configuração de banco (R8) · sem sessão ·
 * com sessão mas fora de `ADMIN_EMAILS` · administrador.
 *
 * A checagem aqui é para ESCOLHER A TELA. A autorização de verdade é
 * revalidada dentro de cada Server Action e de cada leitura privilegiada —
 * uma Server Action é um endpoint POST público.
 *
 * Superfície interna, MESMA paleta e mesmo piso de acessibilidade do painel,
 * com densidade maior. E a regra que vale aqui como em qualquer lugar: não
 * existe verde de sucesso nem vermelho de perigo (docs/DESIGN-V2.md §5.8) —
 * vermelho e azul são dos candidatos, em toda superfície, e um print do /admin
 * não pode ser lido como tomando partido (R4).
 */
import type { Metadata } from "next";
import { formatInTimeZone } from "date-fns-tz";
import {
  Aviso,
  Bloco,
  Chip,
  LinkInterno,
  Nicho,
  Secao,
  Subtitulo,
  Vazio,
} from "@/components/ui/blocos";
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
import { fmt, fmtData, fmtSinal, rodarModelo } from "@/lib/modelo";
import { inteiroEmCem } from "@/components/ui/textos";
import { supabaseConfigurado } from "@/lib/supabase/publico";
import { getUsuario } from "@/lib/supabase/sessao";
import { instanteDoRender } from "../_lib/relogio";
import { getAuditoria } from "./auditoria";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administração",
  description: "Fila de aprovação da lista de pesquisas.",
  robots: { index: false, follow: false },
};

const TZ = "America/Sao_Paulo";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Secao>
        <Bloco>
          <p className="text-etiqueta text-ameixa">Área restrita · aprovação humana da lista</p>
          <h1 className="mt-1 text-pergunta text-tinta">Administração</h1>
        </Bloco>
      </Secao>
      {children}
      <Secao>
        <LinkInterno href="/" className="text-corpo font-semibold">
          ← voltar ao painel
        </LinkInterno>
      </Secao>
    </main>
  );
}

/** Pendente → `Pesquisa` para simular a média com ela dentro. */
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
        <Secao>
          <Bloco className="max-w-texto">
            <Aviso>
              admin indisponível sem configuração — este ambiente roda apenas com a lista guardada
              no próprio site. O painel público continua completo; a fila de aprovação, o login e a
              auditoria só existem quando as variáveis do Supabase estão definidas.
            </Aviso>
          </Bloco>
        </Secao>
      </Moldura>
    );
  }

  const usuario = await getUsuario();

  /* ---------- 2. sem sessão ---------- */
  if (!usuario) {
    return (
      <Moldura>
        <Secao>
          <Bloco className="max-w-texto">
            <p className="text-corpo text-tinta-media">
              Publicar uma pesquisa na lista é um ato registrado: entra na auditoria e aparece na
              página pública do que já mudou. Por isso o acesso é por link de uso único enviado por
              e-mail, e só para endereços previamente autorizados no servidor.
            </p>
            {erroLogin ? (
              <div className="mt-4">
                <Aviso>
                  {erroLogin === "sem-configuracao"
                    ? "login indisponível neste ambiente."
                    : "não foi possível concluir o login com esse link — ele pode ter expirado ou já ter sido usado. Peça um novo abaixo."}
                </Aviso>
              </div>
            ) : null}
            <FormLogin />
          </Bloco>
        </Secao>
      </Moldura>
    );
  }

  const admin = await getAdmin();

  /* ---------- 3. sessão sem permissão ---------- */
  if (!admin) {
    return (
      <Moldura>
        <Secao>
          <Bloco className="max-w-texto">
            <Aviso>
              a conta <b>{usuario.email}</b> não está autorizada a administrar a lista. Nada foi
              alterado e o acesso ficou registrado.
            </Aviso>
            <div className="mt-3">
              <BotaoSair />
            </div>
          </Bloco>
        </Secao>
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
      <Secao>
        <Bloco>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-corpo text-tinta-media">
              conectado como <b className="font-semibold text-tinta">{admin.email}</b>
            </p>
            <BotaoSair />
          </div>
        </Bloco>
      </Secao>

      <Secao>
        <Bloco>
          <Subtitulo>Coletor automático</Subtitulo>
          <p className="mt-1 mb-3 max-w-texto text-corpo text-tinta-media">
            Busca pesquisas novas dos institutos e as coloca na fila como{" "}
            <b className="font-semibold text-tinta">pendentes</b> — nada é publicado sem aprovação
            (R3). O cron já faz isso uma vez por dia; este botão serve para antecipar.
          </p>
          <BotaoAtualizar />
        </Bloco>
      </Secao>

      <Secao>
        <Bloco>
          <Subtitulo>
            Fila de aprovação ({fila.length}) · o que cada pesquisa faz com a média
          </Subtitulo>
          {fila.length === 0 ? (
            <div className="mt-3">
              <Vazio titulo="Nada aguardando aprovação.">
                Quando o coletor encontrar uma pesquisa nova, ela aparece aqui com o efeito que
                teria sobre a diferença e sobre a chance — antes de você decidir.
              </Vazio>
            </div>
          ) : (
            <ul className="mt-3 space-y-4">
              {fila.map(({ p, depois }) => {
                const descricao = `${p.instituto} · campo ${fmtData(p.inicio)}–${fmtData(p.fim)}`;
                return (
                  <li key={p.id}>
                    <Nicho>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-secao text-tinta">{descricao}</h3>
                        <span className="text-micro text-tinta-media numeros">
                          <Chip tom="atencao" className="mr-2">
                            pendente
                          </Chip>
                          origem {p.origem} · recebida em{" "}
                          {formatInTimeZone(Date.parse(p.criadoEm), TZ, "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>

                      <p className="mt-1 text-micro text-tinta-media numeros">
                        2º turno {fmt(p.t2.lula)}% × {fmt(p.t2.flavio)}% · 1º turno{" "}
                        {p.t1 && p.t1.lula !== null
                          ? `${fmt(p.t1.lula)}% × ${fmt(p.t1.flavio)}%`
                          : "n/d"}{" "}
                        · {p.n ?? "n/d"} pessoas · folga {fmt(p.moe)} · TSE {p.tse ?? "n/d"}
                      </p>
                      <p className="mt-1 text-micro break-all text-tinta-media">
                        fonte: {p.fonte ?? "não informada"}
                      </p>

                      {base && depois ? (
                        <dl className="mt-3 grid grid-cols-2 gap-2 text-micro numeros">
                          <div className="rounded-campo bg-placa p-3">
                            <dt className="text-etiqueta text-tinta-media">
                              diferença no 2º turno
                            </dt>
                            <dd className="text-dado text-tinta">
                              {fmtSinal(base.margem)} → {fmtSinal(depois.margem)}
                            </dd>
                            <dd className="text-tinta-media">
                              variação {fmtSinal(depois.margem - base.margem)} pontos
                            </dd>
                          </div>
                          <div className="rounded-campo bg-placa p-3">
                            <dt className="text-etiqueta text-tinta-media">
                              chance de Lula (dia da votação)
                            </dt>
                            <dd className="text-dado text-tinta">
                              {inteiroEmCem(base.eleito.dia.l)} →{" "}
                              {inteiroEmCem(depois.eleito.dia.l)} em 100
                            </dd>
                            <dd className="text-tinta-media">
                              variação{" "}
                              {fmtSinal(
                                inteiroEmCem(depois.eleito.dia.l) - inteiroEmCem(base.eleito.dia.l),
                                0,
                              )}
                            </dd>
                          </div>
                        </dl>
                      ) : (
                        <div className="mt-3">
                          <Aviso>
                            não foi possível simular o efeito desta linha na média — confira os
                            números do 2º turno antes de aprovar.
                          </Aviso>
                        </div>
                      )}

                      {p.bruto ? (
                        <details className="mt-3">
                          <summary className="inline-flex min-h-toque items-center text-micro font-semibold text-ameixa">
                            Resposta crua da IA (texto não verificado)
                          </summary>
                          <pre className="mt-1 max-h-64 overflow-auto rounded-campo bg-placa p-3 text-micro whitespace-pre-wrap text-tinta">
                            <code>{JSON.stringify(p.bruto, null, 2)}</code>
                          </pre>
                        </details>
                      ) : null}

                      <AcoesPendente id={p.id} descricao={descricao} />
                    </Nicho>
                  </li>
                );
              })}
            </ul>
          )}
        </Bloco>
      </Secao>

      <Secao>
        <Bloco>
          <Subtitulo>Inclusão manual (entra publicada, com auditoria)</Subtitulo>
          <div className="mt-3">
            <FormInclusao />
          </div>
        </Bloco>
      </Secao>

      <Secao>
        <Bloco>
          <Subtitulo>Lista publicada ({publicadas.length})</Subtitulo>
          <ul className="mt-3">
            {publicadas.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-filete py-2"
              >
                <span className="text-micro text-tinta-media numeros">
                  <Chip tom="ameixa" className="mr-2">
                    publicada
                  </Chip>
                  <b className="text-corpo font-semibold text-tinta">{p.instituto}</b> ·{" "}
                  {fmtData(p.inicio)}–{fmtData(p.fim)} · 2º turno {fmt(p.t2.lula)}% ×{" "}
                  {fmt(p.t2.flavio)}% · {p.tse}
                </span>
                {UUID.test(p.id) ? (
                  <BotaoRemover
                    id={p.id}
                    descricao={`${p.instituto} (campo até ${fmtData(p.fim)})`}
                  />
                ) : (
                  <span className="text-micro text-tinta-media">lista guardada no site</span>
                )}
              </li>
            ))}
          </ul>
        </Bloco>
      </Secao>

      <Secao>
        <Bloco>
          <Subtitulo>Auditoria completa ({auditoria.length} registros mais recentes)</Subtitulo>
          {auditoria.length === 0 ? (
            <div className="mt-3">
              <Vazio titulo="Nenhum registro de auditoria ainda.">
                Toda aprovação, rejeição, inclusão e remoção grava uma linha aqui, com o e-mail de
                quem executou. A página pública mostra os mesmos eventos sem o ator.
              </Vazio>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {auditoria.map((l) => (
                <li key={l.id} className="border-t border-filete pt-2">
                  <p className="text-micro text-tinta-media numeros">
                    {formatInTimeZone(Date.parse(l.em), TZ, "dd/MM/yyyy HH:mm")} ·{" "}
                    <b className="font-semibold text-tinta">{l.acao}</b> · {l.entidade}
                    {l.entidadeId ? ` ${l.entidadeId}` : ""} · por {l.ator}
                  </p>
                  {l.detalhes ? (
                    <details className="mt-1">
                      <summary className="inline-flex min-h-toque items-center text-micro text-ameixa">
                        detalhes
                      </summary>
                      <pre className="mt-1 max-h-64 overflow-auto rounded-campo bg-nicho p-3 text-micro whitespace-pre-wrap text-tinta">
                        <code>{JSON.stringify(l.detalhes, null, 2)}</code>
                      </pre>
                    </details>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Bloco>
      </Secao>
    </Moldura>
  );
}

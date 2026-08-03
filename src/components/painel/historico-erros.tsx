/**
 * Histórico de erros das pesquisas (urna × véspera) — Server Component.
 *
 * A tabela, os dois cartões e o bloco "por que o 1ºT importa AGORA" são texto
 * fixo e ficam no servidor; só a curva de sensibilidade e o Replay 2022, que
 * recalculam com os parâmetros do leitor, são client components.
 */
import { Cartao } from "@/components/ui/cartao";
import { LinkExterno } from "@/components/ui/basicos";
import { FONTES_ERROS } from "@/data/fontes-erros";
import { HISTORICO_ERROS } from "@/data/historico-erros";
import { CurvaSensibilidade } from "./curva-sensibilidade";
import { Replay2022 } from "./replay-2022";

export function HistoricoErros() {
  return (
    <Cartao
      idTitulo="titulo-historico-erros"
      titulo="Histórico de erros das pesquisas (urna × véspera)"
      descricao="E se repetir em 2026?"
      destaque="tinta"
    >
      {/* ---------- 390px: cartões empilhados (§7.5) ----------
          A coluna ERRO é a razão de existir do bloco: em tabela ela sumia por
          completo abaixo de md, sem afordância de rolagem. Como cartão, ela é o
          par rótulo→valor mais forte, sempre visível. */}
      <ul className="flex flex-col gap-3 md:hidden" aria-label="Histórico de erros por pleito">
        {HISTORICO_ERROS.map((h) => (
          <li key={h.pleito} className="rounded-cartao border border-linha bg-cartao p-cartao">
            <h3 className="text-sm font-bold text-tinta">{h.pleito}</h3>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="font-mono text-xs tracking-etiqueta text-cinza uppercase">
                  Urna (válidos)
                </dt>
                <dd className="mt-0.5 font-mono text-xs leading-compacto text-tinta">{h.urna}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs tracking-etiqueta text-cinza uppercase">
                  Pesquisas de véspera
                </dt>
                <dd className="mt-0.5 font-mono text-xs leading-compacto text-tinta">{h.pesq}</dd>
              </div>
              <div className="border-t border-dashed border-linha pt-2">
                <dt className="font-mono text-xs tracking-etiqueta text-cinza uppercase">Erro</dt>
                <dd className="mt-0.5 text-sm leading-compacto text-tinta">{h.erro}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      {/* ---------- md+: tabela completa ---------- */}
      <div
        className="relative hidden overflow-x-auto md:block rolagem-x"
        role="group"
        tabIndex={0}
        aria-labelledby="titulo-historico-erros"
      >
        <table className="w-full font-mono text-xs">
          <caption className="sr-only">
            Comparação, pleito a pleito, entre o resultado das urnas e as pesquisas divulgadas na
            véspera, com o erro medido.
          </caption>
          <thead>
            <tr className="text-left text-cinza uppercase">
              <th scope="col" className="py-2 pr-3 font-medium">
                Pleito
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Urna (válidos)
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Pesquisas de véspera
              </th>
              <th scope="col" className="py-2 font-medium">
                Erro
              </th>
            </tr>
          </thead>
          <tbody>
            {HISTORICO_ERROS.map((h) => (
              <tr key={h.pleito} className="border-t border-linha">
                <th
                  scope="row"
                  className="py-2 pr-3 text-left font-sans font-semibold whitespace-nowrap text-tinta"
                >
                  {h.pleito}
                </th>
                <td className="py-2 pr-3">{h.urna}</td>
                <td className="py-2 pr-3">{h.pesq}</td>
                <td className="py-2">{h.erro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-compacto md:grid-cols-2">
        <div className="rounded-controle border border-alerta bg-alerta-fundo p-3">
          <b>Por que pode se repetir:</b>{" "}
          <span className="text-rodape-texto">
            o padrão é estrutural, não pontual — em 2018 e 2022 as pesquisas subestimaram a direita
            (recusa de resposta desse eleitorado, decisão de última hora, voto útil no 1º turno). A
            polarização e o método das casas seguem parecidos, e nada garante que a correção veio.
          </span>
        </div>
        <div className="rounded-controle border border-confirma bg-confirma-fundo p-3">
          <b>Por que pode ser menor:</b>{" "}
          <span className="text-confirma-texto">
            a disputa decisiva de 2026 é o 2º turno — onde o erro histórico é muito menor (0,4–6,2
            p.p. em 2022; quase zero em 2018). O candidato da direita é outro (Flávio, não Jair), a
            transferência do «voto envergonhado» é incerta, e a direção do erro não é lei.
          </span>
        </div>
      </div>

      <div className="mt-3 rounded-controle border border-dashed border-cinza bg-mini p-3">
        <h3 className="text-sm font-bold text-tinta">
          Por que o erro do 1º turno importa AGORA (mesmo sendo o do 2ºT o menor)
        </h3>
        <p className="mt-1 text-xs leading-leitura text-cinza">
          O erro pequeno da decisão de 2022 (+3,1) só existiu porque, entre os turnos, os institutos
          ganharam um gabarito perfeito — o resultado real do 1º turno — e recalibraram com ele.{" "}
          <b className="text-tinta">
            As pesquisas que alimentam este painel hoje ainda não passaram por calibragem nenhuma
          </b>
          : são o mesmo tipo de instrumento que produziu o +6,3. Por isso o erro do 1ºT entra três
          vezes no modelo: (1) ancora a incerteza sistemática do retrato atual, pré-calibragem
          (padrão 4,0, entre os estados calibrado e não calibrado); (2) muda a cara do 1º turno
          projetado — folga de ~9 p.p. vira chegada de ~2,5, alterando a chance de definição em
          04/10 e a dinâmica da campanha; (3) define o teto observado do erro do setor, usado no
          cartão «teste-limite». O +3,1 só vira a referência certa depois de 04/10, quando o
          gabarito voltar a existir.
        </p>
        <p className="mt-2 text-xs leading-leitura text-cinza">
          <b className="text-tinta">E as correções persistem entre eleições?</b> O histórico diz: só
          em parte. Ajustes estruturais (pesos de escolaridade, religião, amostragem) são
          permanentes — mas a arma que salvou o 2ºT de 2022, reponderar pelo voto real
          recém-apurado, não é portátil: o gabarito envelhece e o viés de não-resposta é alvo móvel.
          Os dois testes disponíveis: <b className="text-tinta">2018→2022</b> — apesar dos ajustes
          pós-2018, o erro do 1º turno voltou em 2022, na mesma direção e tamanho parecido; e{" "}
          <b className="text-tinta">2024 (SP, 2ºT)</b> — dois anos após a correção, Datafolha e
          Quaest subestimaram a margem de Nunes em 4,7 e 8,7 p.p. (Futura cravou). Correção parcial
          e desigual, não regressão total nem cura. Traduzindo em crença → número (chance de Lula no
          dia da votação):{" "}
          <b className="text-tinta">
            correção mantida (σ≈3) → ~86% · parcial (σ=4, padrão) → ~83% · regressão ao 1ºT (σ≈6) →
            ~79%
          </b>
          . Escolha a sua no slider de erro sistemático, logo acima.
        </p>
      </div>

      <CurvaSensibilidade />
      <Replay2022 />

      <details className="mt-3 text-xs">
        <summary className="font-semibold text-cinza">Fontes do histórico de erros</summary>
        <ul className="mt-1 font-mono text-cinza">
          {FONTES_ERROS.map((f) => (
            <li key={f.url} className="flex min-h-toque items-center">
              <LinkExterno href={f.url}>{f.nome}</LinkExterno>
            </li>
          ))}
        </ul>
      </details>
    </Cartao>
  );
}

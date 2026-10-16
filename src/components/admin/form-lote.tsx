"use client";

/**
 * Importação em lote (2º turno, out/2026): cola um array JSON no formato do
 * coletor, vê a prévia do funil (aceitas, recusadas e por quê) e só então
 * publica. O servidor processa o texto DE NOVO ao publicar — a prévia daqui é
 * só leitura.
 */
import { useState, useTransition } from "react";
import { Botao } from "@/components/ui/blocos";
import { previaLote, publicarLote, type ResultadoLote } from "@/lib/admin/acoes";

const EXEMPLO =
  '[{"instituto":"Datafolha","contratante":"Folha de S.Paulo","inicio":"2026-10-13","fim":"2026-10-14",' +
  '"n":2520,"moe":2,"tse":"BR-00466/2026","l2":45,"f2":47,"bn2":8,"fonte":"https://..."}]';

export function FormLote() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<ResultadoLote | null>(null);
  const [publicado, setPublicado] = useState(false);
  const [pendente, iniciar] = useTransition();

  const analisar = () =>
    iniciar(async () => {
      setPublicado(false);
      setResultado(await previaLote(texto));
    });
  const publicar = () =>
    iniciar(async () => {
      setResultado(await publicarLote(texto));
      setPublicado(true);
    });

  const podePublicar = !publicado && resultado?.ok && resultado.aceitas.length > 0;

  return (
    <div>
      <label htmlFor="lote-json" className="mb-1 block text-micro text-tinta-media">
        Array JSON — mesmos campos do coletor; l2/f2 em voto TOTAL, bn2 = branco/nulo/não sabe do 2º
        turno; outros1 opcional
      </label>
      <textarea
        id="lote-json"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setResultado(null);
          setPublicado(false);
        }}
        rows={8}
        placeholder={EXEMPLO}
        className="w-full rounded-campo bg-placa p-3 font-mono text-micro text-tinta shadow-[inset_0_0_0_1px_var(--color-contorno)]"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Botao type="button" onClick={analisar} disabled={pendente || !texto.trim()}>
          {pendente && !podePublicar ? "Analisando…" : "Pré-visualizar"}
        </Botao>
        {podePublicar ? (
          <Botao type="button" onClick={publicar} disabled={pendente}>
            {pendente ? "Publicando…" : `Publicar ${resultado.aceitas.length}`}
          </Botao>
        ) : null}
      </div>

      {resultado ? (
        <div role="status" aria-live="polite" className="mt-3 text-micro numeros">
          {!resultado.ok ? (
            <p className="rounded-nicho bg-atencao-fundo px-4 py-2 text-tinta">
              ⚠ {resultado.erro}
            </p>
          ) : (
            <>
              {resultado.mensagem ? (
                <p className="rounded-nicho bg-ameixa-bruma px-4 py-2 text-tinta">
                  {resultado.mensagem}
                </p>
              ) : null}
              <p className="mt-2 font-semibold text-tinta">
                {publicado ? "Publicadas" : "Passam no funil"}: {resultado.aceitas.length}
              </p>
              <ul className="mt-1 list-disc pl-5 text-tinta-media">
                {resultado.aceitas.map((a) => (
                  <li key={`${a.instituto}|${a.fim}`}>
                    {a.instituto} · {a.fim} · Lula {a.l2} × Flávio {a.f2}
                    {a.bn2 !== null ? ` · branco/nulo ${a.bn2}` : ""}
                    {a.temT1 ? " · com 1º turno" : ""}
                    {a.avisos.length ? ` · ${a.avisos.join("; ")}` : ""}
                  </li>
                ))}
              </ul>
              {resultado.rejeitadas.length ? (
                <>
                  <p className="mt-2 font-semibold text-tinta">
                    Recusadas: {resultado.rejeitadas.length}
                  </p>
                  <ul className="mt-1 list-disc pl-5 text-tinta-media">
                    {resultado.rejeitadas.map((r, i) => (
                      <li key={i}>{[r.instituto, r.fim, r.motivo].filter(Boolean).join(" · ")}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

import "server-only";

/**
 * Leitura do `audit_log` COMPLETO — só para o /admin.
 *
 * O feed público (`/historico`) usa a view `audit_publico`, que não projeta o
 * `ator`. Aqui usamos o service role, então a checagem de admin é revalidada no
 * corpo da função (defesa em profundidade, igual às Server Actions).
 */
import { exigirAdmin } from "@/lib/admin/auth";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export interface LinhaAuditoria {
  id: string;
  em: string;
  ator: string;
  acao: string;
  entidade: string;
  entidadeId: string | null;
  detalhes: unknown;
}

export async function getAuditoria(limite = 60): Promise<LinhaAuditoria[]> {
  await exigirAdmin();
  const supabase = criarClienteAdmin();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("audit_log")
      .select("id,em,ator,acao,entidade,entidade_id,detalhes")
      .order("em", { ascending: false })
      .limit(Math.min(Math.max(limite, 1), 200))
      .returns<
        {
          id: number;
          em: string;
          ator: string;
          acao: string;
          entidade: string;
          entidade_id: string | null;
          detalhes: unknown;
        }[]
      >();
    if (error) throw new Error(error.message);
    return (data ?? []).map((l) => ({
      id: String(l.id),
      em: l.em,
      ator: l.ator,
      acao: l.acao,
      entidade: l.entidade,
      entidadeId: l.entidade_id,
      detalhes: l.detalhes,
    }));
  } catch (erro) {
    console.error("[admin] auditoria indisponível:", erro);
    return [];
  }
}

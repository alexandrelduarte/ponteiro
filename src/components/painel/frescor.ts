/**
 * Selo de frescor (R3 / docs/DESIGN.md §8.5) — substitui o botão público
 * "Atualizar agora" do protótipo. É informativo: não é botão, não tem
 * afordância de clique.
 *
 * Calculado no SERVIDOR e entregue já formatado ao componente, para que o
 * cliente não precise ler o relógio (nada de mismatch de hidratação).
 */
import { formatInTimeZone } from "date-fns-tz";
import { ULTIMA_ATUALIZACAO } from "@/data/constantes";
import type { Frescor } from "@/lib/dados";

const TZ = "America/Sao_Paulo";
const DIA_MS = 864e5;

export interface SeloFrescor {
  texto: string;
  /** verificação com mais de 48h (ou ausente) → cores de alerta */
  alerta: boolean;
}

function diaEm(ms: number): string {
  return formatInTimeZone(ms, TZ, "yyyy-MM-dd");
}

function ddmm(iso: string): string {
  const [, m, d] = iso.split("-");
  return d && m ? `${d}/${m}` : iso;
}

/** Texto do selo a partir do estado do banco (ou do seed, sem Supabase). */
export function montarSelo(frescor: Frescor, agoraMs: number): SeloFrescor {
  const partes: string[] = [];
  let alerta = false;

  if (frescor.verificadoEm) {
    const verificadoMs = Date.parse(frescor.verificadoEm);
    const horas = Number.isFinite(verificadoMs) ? (agoraMs - verificadoMs) / 36e5 : Infinity;

    if (!Number.isFinite(horas) || horas > 48) {
      alerta = true;
      const dias = Number.isFinite(horas) ? Math.floor(horas / 24) : null;
      partes.push(
        dias === null
          ? "última verificação automática em data desconhecida"
          : `última verificação automática há ${dias} dia${dias === 1 ? "" : "s"}`,
      );
    } else {
      const hora = formatInTimeZone(verificadoMs, TZ, "HH");
      const dia = diaEm(verificadoMs);
      const hoje = diaEm(agoraMs);
      const ontem = diaEm(agoraMs - DIA_MS);
      const quando =
        dia === hoje
          ? "hoje"
          : dia === ontem
            ? "ontem"
            : `em ${formatInTimeZone(verificadoMs, TZ, "dd/MM")}`;
      partes.push(`verificado automaticamente ${quando} às ${hora}h`);
    }
  } else {
    // Sem banco (R8): a série exibida é o seed editorial.
    partes.push(`base editorial de ${ULTIMA_ATUALIZACAO}`);
  }

  if (frescor.ultimaPesquisaFim) {
    partes.push(`última pesquisa incluída em ${ddmm(frescor.ultimaPesquisaFim)}`);
  }

  return { texto: partes.join(" · "), alerta };
}

/**
 * Histórico de erros das pesquisas (urna × véspera) — extraído do protótipo, textos preservados.
 */
import type { ErroPleito } from "./tipos";

export const HISTORICO_ERROS: ErroPleito[] = [
  {
    pleito: "2018 · 1º turno",
    urna: "Bolsonaro 46,0% dos válidos",
    pesq: "Ibope e Datafolha na véspera: ~36%",
    erro: "direita subestimada em ~10 p.p. — o maior erro recente",
  },
  {
    pleito: "2018 · 2º turno",
    urna: "Bolsonaro 55,1% × Haddad 44,9%",
    pesq: "Datafolha 55×45 · Ibope 54×46",
    erro: "acerto (erro ≈ 0–1 p.p.)",
  },
  {
    pleito: "2022 · 1º turno",
    urna: "Lula +5,2 p.p. (48,4% × 43,2%)",
    pesq: "Datafolha e Ipec na véspera: Lula +14 p.p.",
    erro: "margem inflada ~9 p.p. pró-esquerda; os mais próximos: Paraná (+7,1) e AtlasIntel (+9,2)",
  },
  {
    pleito: "2022 · 2º turno",
    urna: "Lula +1,8 p.p. (50,9% × 49,1%)",
    pesq: "erros de 0,4 a 6,2 p.p. conforme o instituto",
    erro: "pequeno a moderado; quando errou, errou pró-esquerda (Datafolha e Quaest, 52×48, acertaram na margem)",
  },
  {
    pleito: "2024 · SP (teste pós-correção)",
    urna: "1ºT: empate triplo confirmado · 2ºT: Nunes 59,4% × Boulos 40,6%",
    pesq: "véspera do 2ºT: Datafolha 57×43 · Quaest 55×45 · Futura 59,7×40,3",
    erro: "dois anos após a «correção», Datafolha e Quaest subestimaram a direita de novo (4,7 e 8,7 p.p. na margem); Futura cravou — correção parcial e desigual entre casas",
  },
];

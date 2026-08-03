import "server-only";

/**
 * O único ponto do produto que lê o relógio para alimentar o modelo.
 *
 * Existe por três razões: (1) `rodarModelo` é determinístico em `hojeMs`, então
 * o instante precisa ser fixado UMA vez por render e descer por prop — é isso
 * que faz o HTML do servidor e a hidratação baterem número a número; (2) ler o
 * relógio direto no corpo de um componente é impureza (a regra
 * `react-hooks/purity` reclama, com razão); (3) concentrar aqui deixa óbvio,
 * numa busca, quem depende do tempo.
 */
export async function instanteDoRender(): Promise<number> {
  return Date.now();
}

import type { NextConfig } from "next";

/* ==========================================================================
 * CABEÇALHOS DE SEGURANÇA — aplicados a TODAS as rotas (SECURITY.md).
 *
 * As decisões abaixo foram tomadas contra o artefato REAL (`next build`), não
 * contra o que a documentação promete. O que o build produz hoje:
 *
 *   - ~24 blocos `<script>` INLINE por página com o payload RSC
 *     (`self.__next_f.push([...])`), sem nonce, dentro de HTML estático/ISR;
 *   - nenhum `<style>` inline nas páginas do produto, mas o 404 e o
 *     global-error do próprio Next trazem um `<style>` embutido;
 *   - 16 atributos `style=` já no HTML do servidor, mais os que o Recharts
 *     escreve em runtime nos elementos SVG;
 *   - todo JS e CSS servido de `/_next/static` (mesma origem) e as fontes
 *     self-hospedadas por `next/font` (nenhum request a terceiro).
 * ========================================================================== */

const ehDesenvolvimento = process.env.NODE_ENV === "development";

/**
 * Origem do Supabase DERIVADA do ambiente — nunca escrita à mão aqui.
 * Sem `NEXT_PUBLIC_SUPABASE_URL` no build (R8: o site roda com o seed local),
 * `connect-src` fica só com `'self'`.
 */
function origensSupabase(): string[] {
  const bruta = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!bruta) return [];
  try {
    const u = new URL(bruta);
    if (u.protocol !== "https:" && u.protocol !== "http:") return [];
    // O `wss:` é o MESMO host (auth/realtime do supabase-js, se um dia o
    // cliente for usado no navegador): não amplia a superfície de ataque.
    return [u.origin, `${u.protocol === "https:" ? "wss" : "ws"}://${u.host}`];
  } catch {
    return [];
  }
}

/**
 * Content-Security-Policy.
 *
 * `script-src 'self' 'unsafe-inline'` — POR QUÊ, e por que não é preguiça:
 *
 *   1. NONCE está descartado por construção. O nonce precisa ser único por
 *      requisição, e `/`, `/historico` e `/metodologia` são estáticas com ISR
 *      (revalidate 5min) servidas pelo CDN: o mesmo HTML — logo, o mesmo nonce
 *      — iria para milhares de leitores, o que é pior que não ter nonce.
 *      Torná-las dinâmicas só para ter nonce derrubaria o cache de borda, que é
 *      justamente a mitigação de A5 (DDoS/custo) no SECURITY.md.
 *   2. HASHES também estão descartados por construção. O payload RSC inline
 *      carrega `hojeMs` (timestamp do prerender) e os números do modelo: o
 *      conteúdo — e portanto o SHA-256 — muda a cada revalidação do ISR. Um
 *      hash fixo no cabeçalho quebraria o site na primeira regeneração.
 *      Também não há como calculá-los em `headers()`: essa função é avaliada
 *      ANTES das páginas serem geradas.
 *   3. O que resta é `'unsafe-inline'` — e o que ele NÃO permite continua
 *      valendo e é a maior parte da defesa real: nenhum script de outra
 *      origem, nenhum `data:`/`blob:` executável, nenhum `eval` em produção,
 *      `object-src 'none'`, `base-uri 'self'` (bloqueia sequestro de URL
 *      relativa) e `form-action 'self'` (bloqueia exfiltração por formulário).
 *      A porta que `'unsafe-inline'` deixa aberta exige uma injeção de HTML
 *      para ser usada — e o produto não tem nenhuma: zero
 *      `dangerouslySetInnerHTML` fora do JSON-LD, cujo conteúdo é gerado por
 *      nós com `<` escapado (ameaça A6 no SECURITY.md).
 *
 * `style-src 'self' 'unsafe-inline'` — o React e o Recharts escrevem atributos
 * `style=` (16 já no HTML do servidor), e as páginas de erro do próprio Next
 * trazem um `<style>` embutido. Restringir com `style-src-elem`/`style-src-attr`
 * foi considerado e recusado: as diretivas `-elem`/`-attr` não têm suporte
 * uniforme entre navegadores e, onde não são reconhecidas, o navegador cai de
 * volta em `style-src` — o resultado seria um site quebrado no Firefox em troca
 * de proteção contra injeção de CSS, que aqui depende da mesma injeção de HTML
 * que não existe.
 *
 * `'unsafe-eval'` entra APENAS em desenvolvimento (o HMR do Turbopack avalia
 * módulos com `eval`). Em produção ele nunca é emitido — e é assim que fica,
 * mesmo sabendo que o Zod 4 SONDA a capacidade de `eval` no cliente
 * (`$ZodObjectJIT` compila validadores com `new Function` e cai no
 * interpretador quando a CSP nega). A sonda é engolida por um `try/catch` e o
 * painel funciona por completo — o que sobra é um evento
 * `securitypolicyviolation` por carga de `/`. Afrouxar a CSP inteira para
 * calar um probe seria trocar defesa real por silêncio; a correção certa é do
 * lado do produto (`z.config({ jitless: true })` no único componente cliente
 * que importa Zod). Registrado no retorno da Fase 7.
 */
function politicaDeConteudo(): string {
  const script = ["'self'", "'unsafe-inline'", ...(ehDesenvolvimento ? ["'unsafe-eval'"] : [])];

  const diretivas: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": script,
    "style-src": ["'self'", "'unsafe-inline'"],
    // `data:` cobre ícones/SVG embutidos; nenhuma imagem vem de terceiro.
    "img-src": ["'self'", "data:"],
    // next/font self-hospeda: nada de fonts.gstatic.com em runtime.
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...origensSupabase()],
    "manifest-src": ["'self'"],
    // O produto não embute nem é embutido: A8 (defacement por clickjacking).
    "frame-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };

  return Object.entries(diretivas)
    .map(([nome, valores]) => `${nome} ${valores.join(" ")}`)
    .join("; ");
}

const cabecalhosSeguranca = [
  {
    key: "Content-Security-Policy",
    value: politicaDeConteudo(),
  },
  {
    // 2 anos + subdomínios + preload. É um COMPROMISSO: depois de entrar na
    // lista de preload, todo subdomínio precisa falar https. Ver README.
    // Sobre http (e2e local) o navegador ignora este cabeçalho por especificação.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // Mínima: o produto não usa nenhuma dessas capacidades.
    // `interest-cohort` (FLoC) é um token que o Chrome atual não implementa
    // mais. Foi mantido depois de VERIFICADO no Chromium que ele não gera
    // "Unrecognized feature" no console (o e2e reprova console sujo): custa
    // nada e continua valendo para quem ainda honra o opt-out.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Espelho legado de `frame-ancestors 'none'` para UAs antigos.
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  // Não anuncia a stack para quem varre a internet atrás de versão vulnerável.
  poweredByHeader: false,
  async headers() {
    // /embed é a ÚNICA rota que pode ser emoldurada (widget de imprensa):
    // ela define os próprios cabeçalhos no route handler (CSP com
    // frame-ancestors *). Todo o resto mantém X-Frame-Options DENY.
    return [{ source: "/((?!embed$).*)", headers: cabecalhosSeguranca }];
  },
};

export default nextConfig;

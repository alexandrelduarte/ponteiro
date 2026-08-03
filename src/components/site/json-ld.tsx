/**
 * JSON-LD (schema.org).
 *
 * Único ponto do produto com `dangerouslySetInnerHTML`, e por exigência do
 * formato: o conteúdo de um `<script type="application/ld+json">` é texto bruto
 * e o React escaparia as aspas se fosse passado como filho, quebrando o JSON.
 * É o padrão recomendado pela documentação do Next.js.
 *
 * Segurança: o objeto é 100% controlado por nós (constantes do produto e
 * números do modelo) — nunca entra texto de usuário. Ainda assim `<` é
 * escapado, o que torna impossível fechar a tag `</script>` a partir do dado.
 */
export function JsonLd({ dados }: { dados: Record<string, unknown> }) {
  const json = JSON.stringify(dados).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

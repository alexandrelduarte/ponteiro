import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Protótipo de referência (fonte da verdade, não é código do app):
    "agregador-presidencial-2026.jsx",
    // Cópia verbatim das funções originais para os golden tests:
    "tests/reference/**",
  ]),
]);

export default eslintConfig;

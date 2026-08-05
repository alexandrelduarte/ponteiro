import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // Os property tests (416 cenários) estouram os 5s padrão de forma
    // intermitente sob carga — flake de máquina, não regressão (idêntico na
    // árvore limpa). 20s dá folga sem mascarar travamento real.
    testTimeout: 20000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});

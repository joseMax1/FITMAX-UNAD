import { defineConfig, devices } from "@playwright/test";

// Pruebas de FITMAX.
//  - "unit": funciones puras de lib/ (no necesitan servidor ni navegador).
//  - "escritorio" y "movil": casos CP-01 a CP-12 contra la app corriendo en E2E_BASE_URL.
// Ver docs/pruebas.md para preparar la base de datos y el servidor simulado de Anthropic.
export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // Un solo worker: los casos comparten la base de datos de prueba y el límite de intentos.
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/resultados.json" }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    locale: "es-CO",
    timezoneId: "America/Bogota",
    screenshot: "on",
    trace: "retain-on-failure",
  },
  globalTeardown: "./tests/e2e/limpieza.ts",
  projects: [
    { name: "unit", testMatch: /unit\/.*\.spec\.ts/ },
    { name: "escritorio", testMatch: /e2e\/.*\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
    { name: "movil", testMatch: /e2e\/.*\.spec\.ts/, use: { ...devices["Pixel 7"] } },
  ],
});

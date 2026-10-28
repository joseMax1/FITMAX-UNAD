import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { crearUsuario, iniciarSesion, evidencia } from "./utilidades";

// Requiere la app iniciada con ANTHROPIC_BASE_URL apuntando a tests/mocks/anthropic-simulado.mjs.
// No usa la API real de Anthropic: valida el flujo, el manejo de errores y los datos enviados.
const LOG = process.env.MOCK_LOG || "test-results/mock-anthropic-ultima-peticion.json";

test("CP-10 consulta al asistente con respuesta, rechazo y error de API key", async ({ page }, info) => {
  const u = await crearUsuario("Valentina Privada");
  await iniciarSesion(page, u);
  await page.goto("/ia");
  const campo = page.getByPlaceholder("Pregúntale a Claude…");

  // a) Respuesta en streaming que queda guardada.
  await campo.fill("¿Qué entreno hoy?");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("Hola, hoy toca entrenar fuerte.")).toBeVisible();
  // La pregunta y la respuesta se guardan al cerrar el stream: se espera a que queden en el historial.
  await expect.poll(async () => (await (await page.request.get("/api/chat")).json()).length).toBe(2);
  await page.reload();
  await expect(page.getByText("¿Qué entreno hoy?")).toBeVisible();
  await expect(page.getByText("Hola, hoy toca entrenar fuerte.")).toBeVisible();
  await evidencia(page, info, "CP-10a-respuesta-guardada");

  // b) Minimización: el contexto enviado a la IA no lleva nombre, correo ni id del usuario.
  const enviado = JSON.stringify(JSON.parse(fs.readFileSync(LOG, "utf8")).body);
  expect(enviado).toContain("años");
  for (const dato of [u.nombre, "Valentina", u.email, u.id]) expect(enviado).not.toContain(dato);

  // c) Rechazo del modelo: aviso claro y la pregunta vuelve al campo, sin guardarse.
  await campo.fill("por favor rechaza esto");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("Claude no puede responder esa pregunta. Intenta reformularla.")).toBeVisible();
  await expect(campo).toHaveValue("por favor rechaza esto");

  // d) API key inválida: mensaje entendible, sin detalles internos ni la clave.
  await campo.fill("simular-401");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("La ANTHROPIC_API_KEY no es válida. Revisa el archivo .env.")).toBeVisible();
  await evidencia(page, info, "CP-10b-errores-controlados");

  const historial = await (await page.request.get("/api/chat")).json();
  expect(historial.map((m: { content: string }) => m.content)).toEqual(["¿Qué entreno hoy?", "Hola, hoy toca entrenar fuerte."]);

  // e) Mensaje vacío o demasiado largo se rechaza en el servidor.
  expect((await page.request.post("/api/chat", { data: { message: "  " } })).status()).toBe(400);
  expect((await page.request.post("/api/chat", { data: { message: "x".repeat(4001) } })).status()).toBe(400);
});

// Se ejecuta solo si hay una segunda instancia de la app SIN ANTHROPIC_API_KEY (E2E_SIN_CLAVE_URL).
test("CP-10 sin API key configurada el chat avisa y no se rompe", async ({ browser }, info) => {
  const url = process.env.E2E_SIN_CLAVE_URL;
  test.skip(!url, "Define E2E_SIN_CLAVE_URL para ejecutar este caso");
  const ctx = await browser.newContext({ baseURL: url });
  const page = await ctx.newPage();
  const u = await crearUsuario();
  await iniciarSesion(page, u);
  await page.goto("/ia");
  await page.getByPlaceholder("Pregúntale a Claude…").fill("Hola");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText(/Claude no está configurado/)).toBeVisible();
  await expect(page.getByPlaceholder("Pregúntale a Claude…")).toHaveValue("Hola");
  await evidencia(page, info, "CP-10c-sin-api-key");
  await ctx.close();
});

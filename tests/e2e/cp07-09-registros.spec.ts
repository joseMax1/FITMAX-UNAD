import { test, expect } from "@playwright/test";
import { crearUsuario, iniciarSesion, evidencia } from "./utilidades";

test("CP-07 registrar un alimento y ver los totales del día", async ({ page }, info) => {
  const u = await crearUsuario();
  await iniciarSesion(page, u);
  await page.goto("/nutricion");
  await expect(page.locator(".text-3xl").first()).toHaveText("0");

  await page.getByRole("button", { name: "Agregar" }).first().click(); // Desayuno
  await page.getByPlaceholder(/Buscar alimento/).fill("frijoles"); // sin tilde
  await page.getByRole("button", { name: /Fríjoles rojos cocidos/ }).click();
  await page.getByLabel(/Cantidad en gramos/).fill("200");
  await expect(page.getByText("254 kcal", { exact: false }).first()).toBeVisible(); // 127 kcal/100 g × 2
  await page.getByRole("button", { name: "Agregar", exact: true }).last().click();

  await expect(page.getByText("Fríjoles rojos cocidos")).toBeVisible();
  await expect(page.locator(".text-3xl").first()).toHaveText("254");
  await page.reload();
  await expect(page.getByText("Fríjoles rojos cocidos")).toBeVisible();
  await expect(page.locator(".text-3xl").first()).toHaveText("254");
  await evidencia(page, info, "CP-07-comida-registrada");

  // Gramos inválidos se rechazan en el servidor.
  const r = await page.request.post("/api/comidas", { data: { tipo: "DESAYUNO", foodId: "x", gramos: -5 } });
  expect(r.status()).toBe(400);
});

test("CP-08 registrar peso y medidas y verlos en el historial", async ({ page }, info) => {
  const u = await crearUsuario();
  await iniciarSesion(page, u);
  await page.goto("/progreso");

  await page.getByPlaceholder("Peso hoy (kg)").fill("abc");
  await page.getByRole("button", { name: "Registrar peso" }).click();
  await expect(page.locator(".text-accent", { hasText: /peso/i }).first()).toBeVisible();

  await page.getByPlaceholder("Peso hoy (kg)").fill("61,5");
  await page.getByRole("button", { name: "Registrar peso" }).click();
  await expect(page.getByText("61.5 kg").first()).toBeVisible();
  await page.getByPlaceholder("Peso hoy (kg)").fill("61");
  await page.getByRole("button", { name: "Registrar peso" }).click();
  await expect(page.getByText("61 kg").first()).toBeVisible();
  await expect(page.locator(".recharts-line")).toHaveCount(1);
  await evidencia(page, info, "CP-08-peso-y-grafica");

  await page.getByRole("tab", { name: "Medidas" }).click();
  await page.getByLabel("Cintura (cm)").fill("72");
  await page.getByLabel("% grasa (%)").fill("24,5");
  await page.getByRole("button", { name: "Guardar medidas" }).click();
  await expect(page.getByText("Cintura 72cm · % grasa 24.5%")).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: "Medidas" }).click();
  await expect(page.getByText("Cintura 72cm · % grasa 24.5%")).toBeVisible();
  await evidencia(page, info, "CP-08-medidas-historial");

  // El perfil queda con el último peso.
  expect((await (await page.request.get("/api/profile")).json()).peso).toBe(61);
});

test("CP-09 registrar hidratación y check-in de bienestar", async ({ page }, info) => {
  const u = await crearUsuario();
  await iniciarSesion(page, u);
  await page.goto("/bienestar");
  await expect(page.getByText("0 / 2500 ml")).toBeVisible();
  await page.getByRole("button", { name: "+250 ml" }).click();
  await expect(page.getByText("250 / 2500 ml")).toBeVisible();
  await page.getByRole("button", { name: "+500 ml" }).click();
  await expect(page.getByText("750 / 2500 ml")).toBeVisible();

  await page.getByLabel(/Horas de sueño/).fill("7,5");
  for (const [escala, valor] of [["Calidad del sueño", "4"], ["Energía", "4"], ["Estrés", "2"], ["Dolor muscular", "2"]]) {
    await page.getByRole("group", { name: escala }).getByRole("button", { name: valor, exact: true }).click();
  }
  await page.getByRole("button", { name: "Guardar check-in" }).click();
  await expect(page.getByText("Check-in guardado ✓")).toBeVisible();

  await page.reload();
  await expect(page.getByText("750 / 2500 ml")).toBeVisible();
  await expect(page.getByText("Tu check-in de hoy")).toBeVisible();
  await expect(page.getByText("4 / 5")).toBeVisible(); // (4+4+4+4+4)/5
  await evidencia(page, info, "CP-09-bienestar");

  const r = await page.request.post("/api/agua", { data: { ml: 99999 } });
  expect(r.status()).toBe(400);
});

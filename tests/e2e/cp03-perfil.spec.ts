import { test, expect } from "@playwright/test";
import { crearUsuario, iniciarSesion, evidencia } from "./utilidades";

test("CP-03 editar perfil, guardar y recuperar tras recargar", async ({ page }, info) => {
  const u = await crearUsuario();
  await iniciarSesion(page, u);
  await page.getByRole("link", { name: "Mi perfil y metas" }).click();
  await page.waitForURL("**/perfil");

  await page.getByLabel("Nombre").fill("Valentina Editada");
  await page.getByLabel("Peso objetivo (kg)").fill("58,5");
  await page.getByLabel("Agua (ml/día)").fill("3000");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Guardado ✓")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Nombre")).toHaveValue("Valentina Editada");
  await expect(page.getByLabel("Peso objetivo (kg)")).toHaveValue("58.5");
  await expect(page.getByLabel("Agua (ml/día)")).toHaveValue("3000");
  await evidencia(page, info, "CP-03-perfil-recuperado");

  // La API no devuelve el hash de la contraseña y valida rangos en el servidor.
  const perfil = await page.request.get("/api/profile");
  expect(await perfil.text()).not.toContain("passwordHash");
  const invalido = await page.request.patch("/api/profile", { data: { edad: 5 } });
  expect(invalido.status()).toBe(400);
  expect((await invalido.json()).error).toContain("edad");
});

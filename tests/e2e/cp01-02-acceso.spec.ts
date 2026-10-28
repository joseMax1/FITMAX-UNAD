import { test, expect } from "@playwright/test";
import { crearUsuario, iniciarSesion, evidencia, CLAVE_PRUEBA, DOMINIO_PRUEBA } from "./utilidades";

test.describe("CP-01 Inicio de sesión", () => {
  test("CP-01a credenciales válidas llevan al dashboard", async ({ page }, info) => {
    const u = await crearUsuario();
    await iniciarSesion(page, u);
    await expect(page).toHaveURL(/\/dashboard$/);
    await evidencia(page, info, "CP-01a-dashboard-tras-login");
  });

  test("CP-01b contraseña incorrecta muestra error y no entra", async ({ page }, info) => {
    const u = await crearUsuario();
    await page.goto("/login");
    await page.getByPlaceholder("Correo").fill(u.email);
    await page.getByPlaceholder("Contraseña").fill("otra-clave-123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Correo o contraseña incorrectos")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
    await evidencia(page, info, "CP-01b-login-rechazado");
  });

  test("CP-01c registro desde la interfaz con contraseña corta se rechaza y con 8 caracteres entra", async ({ page }, info) => {
    const email = `reg${Date.now().toString(36)}@${DOMINIO_PRUEBA}`;
    await page.goto("/register");
    await page.getByPlaceholder("Nombre").fill("Registro Prueba");
    await page.getByPlaceholder("Correo").fill(email);
    const clave = page.getByPlaceholder(/Contraseña/);
    await clave.fill("corta");
    await page.getByRole("button", { name: /Crear cuenta/i }).click();
    // La validación del navegador (minLength=8) impide enviar el formulario.
    expect(await clave.evaluate((el: HTMLInputElement) => el.validity.tooShort)).toBe(true);
    await expect(page).toHaveURL(/\/register/);
    await clave.fill(CLAVE_PRUEBA);
    await page.getByRole("button", { name: /Crear cuenta/i }).click();
    await page.waitForURL("**/dashboard");
    await evidencia(page, info, "CP-01c-registro-exitoso");
  });
});

test.describe("CP-02 Rutas privadas sin sesión", () => {
  for (const ruta of ["/dashboard", "/entrenar", "/nutricion", "/progreso", "/bienestar", "/perfil", "/ia"]) {
    test(`CP-02 ${ruta} redirige a /login`, async ({ page }) => {
      await page.goto(ruta);
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    });
  }

  test("CP-02 las APIs privadas responden 401 sin sesión y no filtran datos", async ({ request }) => {
    const casos: [string, string][] = [
      ["GET", "/api/profile"], ["GET", "/api/resumen"], ["GET", "/api/comidas"], ["GET", "/api/workouts"],
      ["GET", "/api/medidas"], ["GET", "/api/agua"], ["GET", "/api/bienestar"], ["GET", "/api/chat"],
      ["POST", "/api/chat"], ["GET", "/api/cuenta"], ["DELETE", "/api/cuenta"], ["PUT", "/api/rutinas"],
    ];
    for (const [metodo, ruta] of casos) {
      const r = await request.fetch(ruta, { method: metodo, data: metodo === "GET" ? undefined : {} });
      expect(r.status(), `${metodo} ${ruta}`).toBe(401);
      expect(await r.text()).not.toContain("passwordHash");
    }
  });
});

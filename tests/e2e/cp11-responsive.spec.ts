import { test, expect } from "@playwright/test";
import { crearUsuario, iniciarSesion, evidencia } from "./utilidades";

// Se ejecuta en los proyectos "escritorio" (1280×720) y "movil" (Pixel 7, 412×915).
test("CP-11 las pantallas se adaptan sin desbordes horizontales", async ({ page }, info) => {
  const u = await crearUsuario();
  await iniciarSesion(page, u);
  for (const ruta of ["/dashboard", "/entrenar", "/nutricion", "/progreso", "/bienestar", "/perfil", "/ia"]) {
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");
    const { ancho, vista } = await page.evaluate(() => ({ ancho: document.documentElement.scrollWidth, vista: window.innerWidth }));
    expect(ancho, `${ruta}: ancho del contenido ${ancho}px en una vista de ${vista}px`).toBeLessThanOrEqual(vista + 1);
    if (ruta !== "/ia") {
      for (const enlace of ["Inicio", "Entrenar", "Nutrición", "Progreso", "Bienestar"]) {
        await expect(page.getByRole("link", { name: enlace, exact: true })).toBeVisible();
      }
    }
    await evidencia(page, info, `CP-11${ruta.replace("/", "-")}`);
  }
});

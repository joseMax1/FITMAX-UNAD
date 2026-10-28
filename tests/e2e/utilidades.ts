import { expect, type Page, type TestInfo } from "@playwright/test";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Todos los usuarios de prueba usan este dominio reservado y se borran al terminar (limpieza.ts).
export const DOMINIO_PRUEBA = "e2e.fitmax.test";
// Contraseña solo para cuentas de prueba creadas y borradas por la suite; no es una credencial real.
export const CLAVE_PRUEBA = "Prueba-Fitmax-2026";

export type UsuarioPrueba = { id: string; email: string; password: string; nombre: string };

/** Crea un usuario de prueba directamente en la base (sin pasar por el límite de registros). */
export async function crearUsuario(nombre = "Valentina Prueba"): Promise<UsuarioPrueba> {
  const email = `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}@${DOMINIO_PRUEBA}`;
  const u = await prisma.user.create({
    data: {
      email, nombre, passwordHash: await bcrypt.hash(CLAVE_PRUEBA, 10),
      sexo: "M", edad: 28, peso: 62, altura: 165, objetivo: "Hipertrofia", nivel: "Intermedio", diasSemana: 4,
    },
  });
  return { id: u.id, email, password: CLAVE_PRUEBA, nombre };
}

/** Inicia sesión por la pantalla de login, como lo haría una persona. */
export async function iniciarSesion(page: Page, u: UsuarioPrueba) {
  await page.goto("/login");
  await page.getByPlaceholder("Correo").fill(u.email);
  await page.getByPlaceholder("Contraseña").fill(u.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page.getByText(u.nombre).first()).toBeVisible();
}

/** Guarda una captura como evidencia del caso, adjunta al reporte y en test-results/evidencias/. */
export async function evidencia(page: Page, info: TestInfo, nombre: string) {
  const ruta = `test-results/evidencias/${info.project.name}/${nombre}.png`;
  await page.screenshot({ path: ruta, fullPage: true });
  await info.attach(nombre, { path: ruta, contentType: "image/png" });
}

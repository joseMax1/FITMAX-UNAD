import { test, expect } from "@playwright/test";
import { crearUsuario, iniciarSesion, evidencia } from "./utilidades";
import { claveDia } from "@/lib/fecha";

test("CP-04 configurar la rutina semanal y verla en la semana", async ({ page }, info) => {
  const u = await crearUsuario();
  await iniciarSesion(page, u);
  await page.goto("/entrenar");
  await page.getByRole("tab", { name: "Rutina" }).click();

  // Sábado (índice 5) es descanso en la plantilla de 4 días: se convierte en día de entrenamiento.
  const sabado = page.locator("div.rounded-xl", { has: page.getByText("Sábado", { exact: true }) });
  await sabado.getByRole("button").first().click();
  await sabado.getByPlaceholder(/Nombre del día/).fill("Full body E2E");
  await sabado.locator("select").selectOption({ label: "Press banca" });
  await sabado.getByRole("button", { name: "Agregar" }).click();
  await sabado.locator("select").selectOption({ label: "Dominadas" });
  await sabado.getByRole("button", { name: "Agregar" }).click();
  await expect(sabado.getByText("2 ej.")).toBeVisible();
  await page.getByRole("button", { name: "Guardar rutina" }).click();
  await expect(page.getByText("Rutina guardada ✓")).toBeVisible();

  await page.reload();
  await page.getByRole("tab", { name: "Semana" }).click();
  await page.getByRole("button", { name: /Sábado.*Full body E2E/ }).click();
  await expect(page.getByText("Sábado: Full body E2E")).toBeVisible();
  await expect(page.getByText("Press banca").first()).toBeVisible();
  await evidencia(page, info, "CP-04-rutina-semanal");

  // El servidor rechaza dos días con el mismo día de la semana.
  const r = await page.request.put("/api/rutinas", { data: { dias: [{ diaSemana: 1, nombre: "A", ejercicios: [] }, { diaSemana: 1, nombre: "B", ejercicios: [] }] } });
  expect(r.status()).toBe(400);
});

test("CP-05 navegar el calendario por meses y ver un entrenamiento registrado", async ({ page }, info) => {
  const u = await crearUsuario();
  await iniciarSesion(page, u);
  const guardado = await page.request.post("/api/workouts", {
    data: { dia: "Pierna E2E", duracionMin: 45, ejercicios: [{ nombre: "Sentadilla", sets: [{ kg: 60, reps: 8 }, { kg: 60, reps: 8 }] }] },
  });
  expect(guardado.ok()).toBe(true);

  await page.goto("/entrenar");
  await page.getByRole("tab", { name: "Calendario" }).click();
  const hoy = claveDia();
  const titulo = (mes: string) => new Date(`${mes}-01T12:00:00Z`).toLocaleDateString("es-CO", { month: "long", year: "numeric", timeZone: "UTC" });
  const mesActual = hoy.slice(0, 7);
  const [y, m] = mesActual.split("-").map(Number);
  const siguiente = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
  const anterior = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);

  await expect(page.getByText(titulo(mesActual), { exact: true })).toBeVisible();
  await expect(page.getByText("1 días entrenados este mes")).toBeVisible();
  await page.getByRole("button", { name: String(Number(hoy.slice(8))), exact: true }).click();
  await expect(page.getByText("Pierna E2E")).toBeVisible();
  await expect(page.getByText("60×8, 60×8")).toBeVisible();
  await evidencia(page, info, "CP-05-calendario-mes-actual");

  await page.getByRole("button", { name: "Mes siguiente" }).click();
  await expect(page.getByText(titulo(siguiente), { exact: true })).toBeVisible();
  await expect(page.getByText("0 días entrenados este mes")).toBeVisible();
  await page.getByRole("button", { name: "Mes anterior" }).click();
  await page.getByRole("button", { name: "Mes anterior" }).click();
  await expect(page.getByText(titulo(anterior), { exact: true })).toBeVisible();
  await evidencia(page, info, "CP-05-calendario-mes-anterior");
});

test("CP-06 buscar y filtrar ejercicios", async ({ page }, info) => {
  const u = await crearUsuario();
  await iniciarSesion(page, u);
  await page.goto("/entrenar");
  await page.getByRole("tab", { name: "Ejercicios" }).click();
  const tarjetas = page.locator("details");
  await expect(tarjetas).toHaveCount(30);

  // Búsqueda sin tilde encuentra "Jalón al pecho".
  await page.getByPlaceholder("Buscar ejercicio…").fill("jalon");
  await expect(tarjetas).toHaveCount(1);
  await expect(tarjetas.first()).toContainText("Jalón al pecho");
  await evidencia(page, info, "CP-06-busqueda-sin-tilde");

  // Filtro por grupo muscular.
  await page.getByPlaceholder("Buscar ejercicio…").fill("");
  await page.getByRole("button", { name: "Pecho", exact: true }).click();
  const n = await tarjetas.count();
  expect(n).toBeGreaterThan(0);
  expect(n).toBeLessThan(30);
  for (let i = 0; i < n; i++) await expect(tarjetas.nth(i).locator("summary")).toContainText("Pecho");
  await page.getByPlaceholder("Buscar ejercicio…").fill("zzz-no-existe");
  await expect(tarjetas).toHaveCount(0);
  await evidencia(page, info, "CP-06-filtro-grupo");
});

test("CP-04b registrar una sesión completa en el modo entrenamiento", async ({ page }, info) => {
  const u = await crearUsuario();
  await iniciarSesion(page, u);
  await page.goto("/entrenar");
  await page.getByRole("button", { name: /^Lunes/ }).click();
  await page.getByRole("button", { name: "Iniciar modo entrenamiento" }).click();

  await page.getByPlaceholder("kg").fill("40");
  await page.getByPlaceholder("reps").fill("10");
  await page.getByRole("button", { name: "Registrar serie" }).click();
  await expect(page.getByRole("button", { name: "Saltar descanso" })).toBeVisible(); // cronómetro de descanso
  await page.getByRole("button", { name: "Saltar descanso" }).click();
  await evidencia(page, info, "CP-04b-modo-entrenamiento");

  while (await page.getByRole("button", { name: "Siguiente ejercicio" }).isVisible()) {
    await page.getByRole("button", { name: "Siguiente ejercicio" }).click();
  }
  await page.getByRole("button", { name: "Terminar", exact: true }).click();
  await page.getByRole("button", { name: "Guardar entrenamiento" }).click();

  const mes = claveDia().slice(0, 7);
  await expect.poll(async () => (await (await page.request.get(`/api/workouts?mes=${mes}`)).json()).length).toBe(1);
  const [sesion] = await (await page.request.get(`/api/workouts?mes=${mes}`)).json();
  expect(sesion.sets).toEqual([expect.objectContaining({ kg: 40, reps: 10 })]);
});

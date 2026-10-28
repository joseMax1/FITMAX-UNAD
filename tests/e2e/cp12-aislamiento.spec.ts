import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/prisma";
import { crearUsuario, iniciarSesion } from "./utilidades";

// FITMAX no tiene rol de administrador ni rutas /admin. CP-12 se adapta a lo que sí aplica:
// un usuario autenticado no puede leer, modificar ni borrar datos de otro (IDOR) y no existe
// ninguna ruta administrativa expuesta.
test("CP-12 un usuario no accede a los datos de otro ni a rutas administrativas", async ({ browser }) => {
  const a = await crearUsuario("Usuaria A");
  const b = await crearUsuario("Usuario B");
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const pa = await ctxA.newPage();
  const pb = await ctxB.newPage();
  await iniciarSesion(pa, a);
  await iniciarSesion(pb, b);

  // A crea datos propios.
  const alimento = await (await pa.request.post("/api/alimentos", { data: { nombre: "Arepa privada A", kcal: 200, proteina: 5, carbos: 30, grasa: 6 } })).json();
  const item = await (await pa.request.post("/api/comidas", { data: { tipo: "DESAYUNO", foodId: alimento.id, gramos: 100 } })).json();
  const ejercicio = await (await pa.request.post("/api/ejercicios", { data: { nombre: "Ejercicio privado A", grupo: "Pecho" } })).json();
  const medida = await (await pa.request.post("/api/medidas", { data: { cintura: 70 } })).json();
  const agua = await (await pa.request.post("/api/agua", { data: { ml: 300 } })).json();
  expect([alimento.id, item.id, ejercicio.id, medida.id, agua.id].every(Boolean)).toBe(true);

  // B intenta borrar los registros de A: 404 y los datos siguen intactos.
  expect((await pb.request.delete(`/api/comidas?itemId=${item.id}`)).status()).toBe(404);
  expect((await pb.request.delete(`/api/ejercicios?id=${ejercicio.id}`)).status()).toBe(404);
  expect((await pb.request.delete(`/api/medidas?id=${medida.id}`)).status()).toBe(404);
  expect((await pb.request.delete(`/api/agua?id=${agua.id}`)).status()).toBe(404);
  expect(await prisma.mealItem.count({ where: { id: item.id } })).toBe(1);
  expect(await prisma.exercise.count({ where: { id: ejercicio.id } })).toBe(1);
  expect(await prisma.bodyMeasurement.count({ where: { id: medida.id } })).toBe(1);
  expect(await prisma.waterLog.count({ where: { id: agua.id } })).toBe(1);

  // B no ve el alimento ni el ejercicio de A, ni puede usarlos.
  const listaAlimentos = JSON.stringify(await (await pb.request.get("/api/alimentos?q=arepa")).json());
  expect(listaAlimentos).not.toContain("Arepa privada A");
  expect(JSON.stringify(await (await pb.request.get("/api/ejercicios")).json())).not.toContain("Ejercicio privado A");
  expect((await pb.request.post("/api/comidas", { data: { tipo: "ALMUERZO", foodId: alimento.id, gramos: 100 } })).status()).toBe(404);
  await pb.request.put("/api/rutinas", { data: { dias: [{ diaSemana: 0, nombre: "X", ejercicios: [{ exerciseId: ejercicio.id, series: 3, reps: "10", descansoSeg: 60 }] }] } });
  expect(await prisma.routineExercise.count({ where: { exerciseId: ejercicio.id } })).toBe(0);
  await pb.request.post("/api/workouts", { data: { dia: "X", ejercicios: [{ nombre: "Intento de B", exerciseId: ejercicio.id, sets: [{ kg: 10, reps: 10 }] }] } });
  expect(await prisma.setLog.count({ where: { exerciseId: ejercicio.id } })).toBe(0);

  // La exportación de B solo contiene datos de B.
  const exportB = await (await pb.request.get("/api/cuenta")).text();
  expect(exportB).toContain(b.email);
  for (const dato of [a.email, a.id, "Arepa privada A", "Ejercicio privado A"]) expect(exportB).not.toContain(dato);
  expect(exportB).not.toContain("passwordHash");

  // No hay rutas administrativas expuestas.
  for (const ruta of ["/admin", "/api/admin", "/api/users"]) {
    expect((await pb.request.get(ruta)).status(), ruta).toBe(404);
  }

  // Borrar la cuenta exige la contraseña correcta.
  expect((await pb.request.delete("/api/cuenta", { data: { password: "incorrecta" } })).status()).toBe(403);
  expect((await pb.request.delete("/api/cuenta", { data: { password: b.password } })).status()).toBe(200);
  expect(await prisma.user.count({ where: { id: b.id } })).toBe(0);
  expect(await prisma.user.count({ where: { id: a.id } })).toBe(1);
  await ctxA.close();
  await ctxB.close();
});

import { test, expect } from "@playwright/test";
import { registroSchema, perfilSchema, pesoSchema, workoutSchema, rutinaSchema } from "@/lib/validacion";
import { permitir, ipDe } from "@/lib/limite";

test.describe("validación en el servidor (zod)", () => {
  test("registro: correo en minúsculas, contraseña de al menos 8 y números con coma", () => {
    const ok = registroSchema.safeParse({ email: " Ana@Correo.COM ", password: "12345678", nombre: "Ana", peso: "61,5" });
    expect(ok.success && ok.data.email).toBe("ana@correo.com");
    expect(ok.success && ok.data.peso).toBe(61.5);
    expect(registroSchema.safeParse({ email: "ana@correo.com", password: "1234567", nombre: "Ana" }).success).toBe(false);
    expect(registroSchema.safeParse({ email: "no-es-correo", password: "12345678", nombre: "Ana" }).success).toBe(false);
    expect(registroSchema.safeParse({ email: "a@b.co", password: "12345678", nombre: "Ana", objetivo: "Volar" }).success).toBe(false);
  });
  test("perfil: rangos y campos vacíos vuelven al cálculo automático", () => {
    const r = perfilSchema.safeParse({ metaKcal: "", edad: "30" });
    expect(r.success && r.data).toMatchObject({ metaKcal: null, edad: 30 });
    expect(perfilSchema.safeParse({ edad: 5 }).success).toBe(false);
    expect(perfilSchema.safeParse({ metaAguaMl: 20000 }).success).toBe(false);
  });
  test("peso fuera de rango o no numérico se rechaza", () => {
    expect(pesoSchema.safeParse({ peso: "abc" }).success).toBe(false);
    expect(pesoSchema.safeParse({ peso: 500 }).success).toBe(false);
    expect(pesoSchema.safeParse({ peso: "81,5" }).success).toBe(true);
  });
  test("entrenamiento y rutina con límites", () => {
    expect(workoutSchema.safeParse({ dia: "Pierna", ejercicios: [{ nombre: "Sentadilla", sets: [{ kg: 60, reps: 0 }] }] }).success).toBe(false);
    expect(workoutSchema.safeParse({ dia: "Pierna", ejercicios: [{ nombre: "Sentadilla", sets: [{ kg: 60, reps: 8 }] }] }).success).toBe(true);
    expect(rutinaSchema.safeParse({ dias: [{ diaSemana: 7, ejercicios: [] }] }).success).toBe(false);
  });
});

test.describe("límite de intentos", () => {
  test("bloquea al superar el máximo dentro de la ventana", () => {
    const clave = `prueba:${Math.random()}`;
    expect([1, 2, 3].map(() => permitir(clave, 3, 60_000))).toEqual([true, true, true]);
    expect(permitir(clave, 3, 60_000)).toBe(false);
  });
  test("toma la IP del proxy", () => {
    expect(ipDe(new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }))).toBe("203.0.113.5");
    expect(ipDe(new Headers())).toBe("local");
  });
});

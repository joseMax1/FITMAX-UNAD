import { z } from "zod";
import { NextResponse } from "next/server";

export const SEXOS = ["H", "M"] as const;
export const OBJETIVOS = ["Hipertrofia", "Recomposición corporal", "Pérdida de grasa / Definición", "Fuerza", "Mantenimiento"] as const;
export const NIVELES = ["Principiante", "Intermedio", "Avanzado"] as const;

// Acepta números o textos numéricos ("81,5" incluido) desde formularios.
const numero = (min: number, max: number) =>
  z.preprocess((v) => (typeof v === "string" ? Number(v.replace(",", ".")) : v), z.number().finite().min(min).max(max));
const entero = (min: number, max: number) => numero(min, max).transform((n) => Math.round(n));
// "" o null => null (usar valor calculado); ausente => sin cambio.
const opcional = <T extends z.ZodTypeAny>(s: T) => z.preprocess((v) => (v === "" ? null : v), s.nullable()).optional();

export const registroSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido").max(120),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72, "La contraseña es demasiado larga"),
  nombre: z.string().trim().min(1, "Escribe tu nombre").max(60),
  sexo: z.enum(SEXOS).default("H"),
  objetivo: z.enum(OBJETIVOS).default("Hipertrofia"),
  edad: entero(13, 100).default(25),
  peso: numero(25, 350).default(70),
  altura: numero(100, 250).default(170),
  nivel: z.enum(NIVELES).default("Intermedio"),
  diasSemana: entero(2, 6).default(4),
});

export const perfilSchema = z.object({
  nombre: z.string().trim().min(1).max(60).optional(),
  sexo: z.enum(SEXOS).optional(),
  objetivo: z.enum(OBJETIVOS).optional(),
  nivel: z.enum(NIVELES).optional(),
  edad: entero(13, 100).optional(),
  peso: numero(25, 350).optional(),
  altura: numero(100, 250).optional(),
  diasSemana: entero(2, 6).optional(),
  metaAguaMl: entero(500, 8000).optional(),
  metaSuenoH: numero(4, 12).optional(),
  pesoObjetivo: opcional(numero(25, 350)),
  metaKcal: opcional(entero(800, 6000)),
  metaProteina: opcional(entero(20, 400)),
});

export const pesoSchema = z.object({ peso: numero(20, 400) });

export const workoutSchema = z.object({
  dia: z.string().trim().min(1).max(80),
  routineDayId: z.string().max(40).nullish(),
  duracionMin: z.preprocess((v) => (v === "" ? undefined : v), entero(1, 600).optional()),
  notas: z.string().max(500).nullish(),
  rpeSesion: z.preprocess((v) => (v === "" ? undefined : v), entero(1, 10).optional()),
  ejercicios: z
    .array(
      z.object({
        nombre: z.string().trim().min(1).max(80),
        exerciseId: z.string().max(40).nullish(),
        sets: z.array(z.object({ kg: numero(0, 1000), reps: entero(1, 200) })).max(50),
      })
    )
    .max(40),
});

export const rutinaSchema = z.object({
  nombre: z.string().trim().max(60).optional(),
  dias: z
    .array(
      z.object({
        diaSemana: z.number().int().min(0).max(6),
        nombre: z.string().trim().max(60).default(""),
        ejercicios: z
          .array(
            z.object({
              exerciseId: z.string().max(40),
              series: z.preprocess((v) => (v === "" || v == null ? 3 : v), entero(1, 10)),
              reps: z.string().trim().max(30).default("8-12"),
              descansoSeg: z.preprocess((v) => (v === "" || v == null ? 90 : v), entero(0, 600)),
            })
          )
          .max(20)
          .default([]),
      })
    )
    .max(7),
});

/** Lee el JSON del cuerpo y lo valida; devuelve los datos o una respuesta 400 con el primer error. */
export async function leerJson<T extends z.ZodTypeAny>(req: Request, schema: T) {
  const crudo = await req.json().catch(() => undefined);
  if (crudo === undefined) return { error: NextResponse.json({ error: "El cuerpo de la petición no es JSON válido" }, { status: 400 }) } as const;
  const r = schema.safeParse(crudo);
  if (!r.success) {
    const p = r.error.issues[0];
    const campo = p?.path.join(".");
    return { error: NextResponse.json({ error: `Dato inválido${campo ? ` en "${campo}"` : ""}: ${p?.message ?? "revisa los valores"}` }, { status: 400 }) } as const;
  }
  return { data: r.data as z.infer<T> } as const;
}

export const noAutenticado = () => NextResponse.json({ error: "No autenticado" }, { status: 401 });

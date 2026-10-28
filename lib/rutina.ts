import { prisma } from "./prisma";
import { asegurarCatalogo } from "./seed";
import { SPLITS, DIAS_SEMANA } from "./exercises";
import { indiceDiaSemana } from "./fecha";

const INCLUDE = {
  dias: {
    orderBy: { diaSemana: "asc" as const },
    include: { ejercicios: { orderBy: { orden: "asc" as const }, include: { exercise: true } } },
  },
};

/** Crea una rutina a partir de la plantilla de SPLITS (2 ejercicios por grupo muscular). */
export async function crearRutinaPlantilla(userId: string, diasSemana: number) {
  await asegurarCatalogo();
  const split = SPLITS[diasSemana] || SPLITS[4];
  const globales = await prisma.exercise.findMany({ where: { userId: null } });
  await prisma.routine.updateMany({ where: { userId, activa: true }, data: { activa: false } });
  return prisma.routine.create({
    data: {
      userId,
      nombre: `Plantilla ${split.length} días`,
      dias: {
        create: split.map((grupos, i) => ({
          diaSemana: i,
          nombre: grupos.join(" + "),
          ejercicios: {
            create: grupos
              .flatMap((g) => globales.filter((e) => e.grupo === g).slice(0, 2))
              .map((e, orden) => ({
                exerciseId: e.id, orden, series: e.seriesSugeridas, reps: e.repsSugeridas, descansoSeg: e.descansoSeg,
              })),
          },
        })),
      },
    },
    include: INCLUDE,
  });
}

/** Rutina activa del usuario; si no tiene, se crea desde la plantilla. */
export async function rutinaActiva(userId: string, diasSemana: number) {
  const r = await prisma.routine.findFirst({ where: { userId, activa: true }, include: INCLUDE, orderBy: { createdAt: "desc" } });
  return r ?? crearRutinaPlantilla(userId, diasSemana);
}

export type RutinaCompleta = Awaited<ReturnType<typeof rutinaActiva>>;

/** Lo que toca hoy según la rutina activa. */
export function diaDeRutina(rutina: RutinaCompleta, idx = indiceDiaSemana()) {
  const dia = rutina.dias.find((d) => d.diaSemana === idx && d.ejercicios.length > 0) ?? null;
  return { nombre: DIAS_SEMANA[idx], dia };
}

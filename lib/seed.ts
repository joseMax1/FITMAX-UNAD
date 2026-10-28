import { prisma } from "./prisma";
import { EJERCICIOS } from "./exercises";
import { ALIMENTOS_BASE } from "./foods";

// Carga la biblioteca de ejercicios y alimentos la primera vez que se necesitan,
// así no hace falta correr un comando de seed aparte.
let pendiente: Promise<void> | null = null;

export function asegurarCatalogo() {
  if (!pendiente) {
    pendiente = sembrar().catch((e) => {
      pendiente = null;
      throw e;
    });
  }
  return pendiente;
}

async function sembrar() {
  const ejercicios = await prisma.exercise.count({ where: { userId: null } });
  if (ejercicios === 0) {
    await prisma.exercise.createMany({
      data: EJERCICIOS.map((e) => ({
        slug: e.id, nombre: e.nombre, grupo: e.grupo, equipo: e.equipo, dificultad: e.dificultad,
        seriesSugeridas: e.series, repsSugeridas: e.reps, descansoSeg: e.descanso, tip: e.tip,
      })),
    });
  }
  const alimentos = await prisma.food.count({ where: { userId: null } });
  if (alimentos === 0) {
    await prisma.food.createMany({ data: ALIMENTOS_BASE });
  }
}

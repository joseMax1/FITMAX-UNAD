import { prisma } from "./prisma";
import { calcularMacros } from "./nutrition";
import { claveDia, claveLunes, rangoAmplio } from "./fecha";

type UserBase = {
  id: string; peso: number; altura: number; edad: number; sexo: string; objetivo: string; diasSemana: number;
  metaKcal: number | null; metaProteina: number | null; metaAguaMl: number; metaSuenoH: number; pesoObjetivo: number | null;
};

/** Metas diarias: las que el usuario fijó, o las calculadas. */
export function metasDe(user: UserBase) {
  const m = calcularMacros(user);
  return {
    kcal: user.metaKcal ?? m.kcal,
    proteina: user.metaProteina ?? m.proteina,
    carbos: m.carbos,
    grasa: m.grasa,
    aguaMl: user.metaAguaMl,
    suenoH: user.metaSuenoH,
  };
}

/** Totales de comida de un día. */
export async function totalesComida(userId: string, fecha: string) {
  const items = await prisma.mealItem.findMany({ where: { mealLog: { userId, fecha } } });
  const t = items.reduce(
    (a, i) => ({ kcal: a.kcal + i.kcal, proteina: a.proteina + i.proteina, carbos: a.carbos + i.carbos, grasa: a.grasa + i.grasa }),
    { kcal: 0, proteina: 0, carbos: 0, grasa: 0 }
  );
  return { kcal: Math.round(t.kcal), proteina: Math.round(t.proteina), carbos: Math.round(t.carbos), grasa: Math.round(t.grasa) };
}

/** Resumen de hoy y de la semana para el Dashboard y para el contexto de Claude. */
export async function resumenHoy(user: UserBase) {
  const hoy = claveDia();
  const lunes = claveLunes();
  const [comida, agua, bienestar, entrenos, ultimoPeso] = await Promise.all([
    totalesComida(user.id, hoy),
    prisma.waterLog.aggregate({ where: { userId: user.id, fecha: hoy }, _sum: { ml: true } }),
    prisma.wellnessLog.findUnique({ where: { userId_fecha: { userId: user.id, fecha: hoy } } }),
    prisma.workoutLog.findMany({ where: { userId: user.id, date: rangoAmplio(lunes, hoy) }, select: { date: true } }),
    prisma.weightLog.findFirst({ where: { userId: user.id }, orderBy: { date: "desc" } }),
  ]);
  const diasEntrenados = new Set(entrenos.map((w) => claveDia(w.date)).filter((k) => k >= lunes && k <= hoy));
  return {
    fecha: hoy,
    metas: metasDe(user),
    comida,
    aguaMl: agua._sum.ml ?? 0,
    bienestar,
    entrenosSemana: diasEntrenados.size,
    entrenoHoy: diasEntrenados.has(hoy),
    peso: ultimoPeso?.peso ?? user.peso,
  };
}

/** Puntaje de recuperación 1-5 a partir del check-in, con una sugerencia. */
export function recuperacion(b: { horasSueno: number | null; calidadSueno: number | null; energia: number | null; estres: number | null; dolorMuscular: number | null } | null) {
  if (!b) return null;
  const partes: number[] = [];
  if (b.horasSueno != null) partes.push(b.horasSueno >= 8 ? 5 : b.horasSueno >= 7 ? 4 : b.horasSueno >= 6 ? 3 : b.horasSueno >= 5 ? 2 : 1);
  if (b.calidadSueno != null) partes.push(b.calidadSueno);
  if (b.energia != null) partes.push(b.energia);
  if (b.estres != null) partes.push(6 - b.estres);
  if (b.dolorMuscular != null) partes.push(6 - b.dolorMuscular);
  if (!partes.length) return null;
  const puntaje = Math.round((partes.reduce((a, n) => a + n, 0) / partes.length) * 10) / 10;
  const sugerencia =
    puntaje >= 4 ? "Buena recuperación: puedes entrenar con intensidad alta hoy."
    : puntaje >= 3 ? "Recuperación media: entrena, pero baja un poco el volumen o deja 1-2 repeticiones en reserva."
    : "Recuperación baja: prioriza descanso activo (caminar, movilidad, estiramientos) y duerme más esta noche.";
  return { puntaje, sugerencia };
}

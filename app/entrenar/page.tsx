import AppShell from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { usuarioActual } from "@/lib/session";
import { rutinaActiva } from "@/lib/rutina";
import { indiceDiaSemana, claveDia } from "@/lib/fecha";
import EntrenarClient, { DiaRutina, EjercicioLib, Historial } from "./EntrenarClient";

export default async function EntrenarPage() {
  const user = await usuarioActual();
  const rutina = await rutinaActiva(user.id, user.diasSemana);
  const [ejercicios, sets] = await Promise.all([
    prisma.exercise.findMany({ where: { OR: [{ userId: null }, { userId: user.id }] }, orderBy: [{ grupo: "asc" }, { nombre: "asc" }] }),
    prisma.setLog.findMany({
      where: { workoutLog: { userId: user.id } },
      select: { ejercicio: true, kg: true, reps: true, workoutLog: { select: { date: true } } },
      orderBy: { workoutLog: { date: "asc" } },
    }),
  ]);

  // Historial por nombre de ejercicio: récord de peso, 1RM estimado (Epley) y último peso usado.
  const historial: Record<string, Historial> = {};
  for (const s of sets) {
    const h = (historial[s.ejercicio] ??= { mejorKg: 0, mejorE1rm: 0, ultimoKg: 0, sesiones: [] });
    const e1rm = Math.round(s.kg * (1 + s.reps / 30) * 10) / 10;
    h.mejorKg = Math.max(h.mejorKg, s.kg);
    h.mejorE1rm = Math.max(h.mejorE1rm, e1rm);
    h.ultimoKg = s.kg;
    const fecha = claveDia(s.workoutLog.date);
    const ult = h.sesiones[h.sesiones.length - 1];
    if (ult && ult.fecha === fecha) ult.series.push(`${s.kg}×${s.reps}`);
    else h.sesiones.push({ fecha, series: [`${s.kg}×${s.reps}`] });
  }
  for (const h of Object.values(historial)) h.sesiones = h.sesiones.slice(-5).reverse();

  const dias: DiaRutina[] = rutina.dias.map((d) => ({
    id: d.id,
    diaSemana: d.diaSemana,
    nombre: d.nombre,
    ejercicios: d.ejercicios.map((re) => ({
      exerciseId: re.exerciseId, nombre: re.exercise.nombre, grupo: re.exercise.grupo, tip: re.exercise.tip,
      series: re.series, reps: re.reps, descansoSeg: re.descansoSeg,
    })),
  }));
  const lib: EjercicioLib[] = ejercicios.map((e) => ({
    id: e.id, nombre: e.nombre, grupo: e.grupo, equipo: e.equipo, dificultad: e.dificultad, tip: e.tip,
    series: e.seriesSugeridas, reps: e.repsSugeridas, descanso: e.descansoSeg, propio: e.userId !== null,
  }));

  return (
    <AppShell user={user}>
      <EntrenarClient dias={dias} biblioteca={lib} historial={historial} hoyIdx={indiceDiaSemana()} hoy={claveDia()} />
    </AppShell>
  );
}

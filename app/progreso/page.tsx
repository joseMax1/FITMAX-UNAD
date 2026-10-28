import AppShell from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { usuarioActual } from "@/lib/session";
import { claveDia, sumarDias, indiceDiaSemana } from "@/lib/fecha";
import ProgresoClient from "./ProgresoClient";

export default async function ProgresoPage() {
  const user = await usuarioActual();
  const [weightLogs, medidas, workouts] = await Promise.all([
    prisma.weightLog.findMany({ where: { userId: user.id }, orderBy: { date: "asc" } }),
    prisma.bodyMeasurement.findMany({ where: { userId: user.id }, orderBy: { date: "asc" } }),
    prisma.workoutLog.findMany({ where: { userId: user.id }, include: { sets: true }, orderBy: { date: "asc" } }),
  ]);

  // Fuerza: mejor 1RM estimado (Epley) por ejercicio y por sesión.
  const fuerza: Record<string, { fecha: string; e1rm: number; kg: number }[]> = {};
  // Volumen: kg × reps por semana (lunes a domingo).
  const volumen = new Map<string, number>();
  for (const w of workouts) {
    const fecha = claveDia(w.date);
    const lunes = sumarDias(fecha, -indiceDiaSemana(w.date));
    const mejor = new Map<string, { e1rm: number; kg: number }>();
    for (const s of w.sets) {
      const e1rm = Math.round(s.kg * (1 + s.reps / 30) * 10) / 10;
      const prev = mejor.get(s.ejercicio);
      if (!prev || e1rm > prev.e1rm) mejor.set(s.ejercicio, { e1rm, kg: s.kg });
      volumen.set(lunes, (volumen.get(lunes) ?? 0) + s.kg * s.reps);
    }
    for (const [ej, v] of Array.from(mejor)) (fuerza[ej] ??= []).push({ fecha: fecha.slice(5), ...v });
  }
  const semanas = Array.from({ length: 8 }, (_, i) => sumarDias(sumarDias(claveDia(), -indiceDiaSemana()), -7 * (7 - i)));

  return (
    <AppShell user={user}>
      <ProgresoClient
        pesoObjetivo={user.pesoObjetivo}
        weightLogs={weightLogs.map((w) => ({ fecha: claveDia(w.date).slice(5), peso: w.peso }))}
        medidas={medidas.map((m) => ({ id: m.id, fecha: claveDia(m.date), cintura: m.cintura, cadera: m.cadera, pecho: m.pecho, brazo: m.brazo, muslo: m.muslo, cuello: m.cuello, grasaPct: m.grasaPct }))}
        fuerza={fuerza}
        volumen={semanas.map((s) => ({ semana: s.slice(5), kg: Math.round(volumen.get(s) ?? 0) }))}
        historial={workouts.slice(-10).reverse().map((w) => ({
          dia: w.dia, fecha: claveDia(w.date), duracionMin: w.duracionMin, series: w.sets.length,
          ejercicios: Array.from(new Set(w.sets.map((s) => s.ejercicio))),
        }))}
      />
    </AppShell>
  );
}

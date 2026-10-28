import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { leerJson, noAutenticado, workoutSchema } from "@/lib/validacion";
import { claveDia, claveDiaAnterior, rangoAmplio, sumarDias } from "@/lib/fecha";

/** ?mes=YYYY-MM devuelve las sesiones de ese mes (para el calendario); sin parámetro, las últimas 20. */
export async function GET(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAutenticado();
  const mes = new URL(req.url).searchParams.get("mes");
  if (mes && /^\d{4}-\d{2}$/.test(mes)) {
    const desde = `${mes}-01`;
    const hasta = sumarDias(sumarDias(desde, 31).slice(0, 8) + "01", -1);
    const logs = await prisma.workoutLog.findMany({
      where: { userId, date: rangoAmplio(desde, hasta) },
      include: { sets: { orderBy: { orden: "asc" } } },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(
      logs.map((w) => ({ ...w, fecha: claveDia(w.date) })).filter((w) => w.fecha.startsWith(mes))
    );
  }
  const logs = await prisma.workoutLog.findMany({
    where: { userId },
    include: { sets: { orderBy: { orden: "asc" } } },
    orderBy: { date: "desc" },
    take: 20,
  });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAutenticado();
  const r = await leerJson(req, workoutSchema);
  if ("error" in r) return r.error;
  const { dia, ejercicios, routineDayId, duracionMin, notas, rpeSesion } = r.data;
  const validos = new Set(
    (await prisma.exercise.findMany({ where: { OR: [{ userId: null }, { userId }] }, select: { id: true } })).map((e) => e.id)
  );
  const sets = ejercicios.flatMap((e, ei) =>
    e.sets.map((s, si) => ({
      ejercicio: e.nombre,
      exerciseId: e.exerciseId && validos.has(e.exerciseId) ? e.exerciseId : null,
      kg: s.kg, reps: s.reps, orden: ei * 100 + si,
    }))
  );
  if (!sets.length) {
    return NextResponse.json({ error: "Registra al menos una serie antes de terminar" }, { status: 400 });
  }

  const workout = await prisma.workoutLog.create({
    data: {
      userId,
      dia,
      // Solo se acepta un día de rutina que pertenezca al mismo usuario.
      routineDayId: routineDayId && (await prisma.routineDay.count({ where: { id: routineDayId, routine: { userId } } })) ? routineDayId : null,
      duracionMin: duracionMin ?? null,
      notas: notas?.trim() || null,
      rpeSesion: rpeSesion ?? null,
      sets: { create: sets },
    },
    include: { sets: true },
  });

  // Racha calculada con el día local (APP_TZ), no con el reloj UTC del servidor.
  const hoy = claveDia();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const ultimo = user?.lastTrainDate ? claveDia(user.lastTrainDate) : null;
  let nuevaRacha = 1;
  if (ultimo === claveDiaAnterior(hoy)) nuevaRacha = (user?.streak || 0) + 1;
  else if (ultimo === hoy) nuevaRacha = user?.streak || 1;

  await prisma.user.update({
    where: { id: userId },
    // Solo el primer entrenamiento del día suma XP.
    data: { xp: { increment: ultimo === hoy ? 0 : 20 }, streak: nuevaRacha, lastTrainDate: new Date() },
  });

  return NextResponse.json(workout);
}

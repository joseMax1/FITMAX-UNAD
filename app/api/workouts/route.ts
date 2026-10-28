import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { claveDia, claveDiaAnterior, rangoAmplio, sumarDias } from "@/lib/fecha";

/** ?mes=YYYY-MM devuelve las sesiones de ese mes (para el calendario); sin parámetro, las últimas 20. */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id;
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
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id;
  const { dia, ejercicios, routineDayId, duracionMin, notas, rpeSesion } = await req.json();
  // ejercicios: [{ nombre, exerciseId?, sets: [{kg, reps}] }]
  if (typeof dia !== "string" || !Array.isArray(ejercicios)) {
    return NextResponse.json({ error: "Datos de entrenamiento inválidos" }, { status: 400 });
  }
  const validos = new Set(
    (await prisma.exercise.findMany({ where: { OR: [{ userId: null }, { userId }] }, select: { id: true } })).map((e) => e.id)
  );
  const sets = ejercicios.flatMap((e: any, ei: number) =>
    (Array.isArray(e?.sets) ? e.sets : [])
      .filter((s: any) => Number.isFinite(+s?.kg) && +s.kg >= 0 && Number.isInteger(+s?.reps) && +s.reps > 0)
      .map((s: any, si: number) => ({
        ejercicio: String(e.nombre), exerciseId: validos.has(e.exerciseId) ? e.exerciseId : null,
        kg: +s.kg, reps: +s.reps, orden: ei * 100 + si,
      }))
  );
  if (!sets.length) {
    return NextResponse.json({ error: "Registra al menos una serie antes de terminar" }, { status: 400 });
  }

  const workout = await prisma.workoutLog.create({
    data: {
      userId,
      dia: dia.slice(0, 80),
      routineDayId: typeof routineDayId === "string" && (await prisma.routineDay.count({ where: { id: routineDayId, routine: { userId } } }))
        ? routineDayId : null,
      duracionMin: Number.isFinite(+duracionMin) && +duracionMin > 0 ? Math.min(600, Math.round(+duracionMin)) : null,
      notas: typeof notas === "string" && notas.trim() ? notas.trim().slice(0, 500) : null,
      rpeSesion: Number.isFinite(+rpeSesion) && +rpeSesion >= 1 ? Math.min(10, Math.round(+rpeSesion)) : null,
      sets: { create: sets },
    },
    include: { sets: true },
  });

  // Racha calculada con el día local (APP_TZ), no con el reloj UTC del servidor.
  const hoy = claveDia();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const ultimo = user?.lastTrainDate ? claveDia(user.lastTrainDate) : null;
  let nuevaRacha = 1;
  if (ultimo === claveDiaAnterior(hoy)) nuevaRacha = (user!.streak || 0) + 1;
  else if (ultimo === hoy) nuevaRacha = user!.streak || 1;

  await prisma.user.update({
    where: { id: userId },
    // Solo el primer entrenamiento del día suma XP.
    data: { xp: { increment: ultimo === hoy ? 0 : 20 }, streak: nuevaRacha, lastTrainDate: new Date() },
  });

  return NextResponse.json(workout);
}

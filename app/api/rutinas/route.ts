import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { rutinaActiva, crearRutinaPlantilla } from "@/lib/rutina";

const noAuth = () => NextResponse.json({ error: "No autenticado" }, { status: 401 });

export async function GET() {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return noAuth();
  return NextResponse.json(await rutinaActiva(userId, user.diasSemana));
}

/** Regenera la rutina desde la plantilla (por ejemplo, tras cambiar los días por semana). */
export async function POST() {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return noAuth();
  return NextResponse.json(await crearRutinaPlantilla(userId, user.diasSemana));
}

/**
 * Reemplaza los días de la rutina activa.
 * body: { nombre?, dias: [{ diaSemana, nombre, ejercicios: [{ exerciseId, series, reps, descansoSeg }] }] }
 */
export async function PUT(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return noAuth();
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.dias)) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const ids = new Set(
    (await prisma.exercise.findMany({ where: { OR: [{ userId: null }, { userId }] }, select: { id: true } })).map((e) => e.id)
  );
  const vistos = new Set<number>();
  const dias: { diaSemana: number; nombre: string; ejercicios: { create: { exerciseId: string; orden: number; series: number; reps: string; descansoSeg: number }[] } }[] = [];
  for (const d of body.dias) {
    const diaSemana = Number(d?.diaSemana);
    if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6 || vistos.has(diaSemana)) {
      return NextResponse.json({ error: "Día de la semana inválido" }, { status: 400 });
    }
    vistos.add(diaSemana);
    const ejercicios = (Array.isArray(d.ejercicios) ? d.ejercicios : [])
      .filter((e: any) => ids.has(e?.exerciseId))
      .map((e: any, orden: number) => ({
        exerciseId: e.exerciseId,
        orden,
        series: Math.min(10, Math.max(1, Math.round(+e.series) || 3)),
        reps: String(e.reps || "8-12").slice(0, 30),
        descansoSeg: Math.min(600, Math.max(0, Math.round(+e.descansoSeg) || 90)),
      }));
    if (!ejercicios.length) continue; // día sin ejercicios = descanso
    dias.push({ diaSemana, nombre: String(d.nombre || "Entrenamiento").slice(0, 60), ejercicios: { create: ejercicios } });
  }

  const actual = await rutinaActiva(userId, user.diasSemana);
  const rutina = await prisma.$transaction(async (tx) => {
    await tx.routineDay.deleteMany({ where: { routineId: actual.id } });
    return tx.routine.update({
      where: { id: actual.id },
      data: { nombre: body.nombre ? String(body.nombre).slice(0, 60) : actual.nombre, dias: { create: dias } },
    });
  });
  return NextResponse.json({ ok: true, id: rutina.id });
}

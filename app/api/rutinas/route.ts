import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { rutinaActiva, crearRutinaPlantilla } from "@/lib/rutina";
import { leerJson, rutinaSchema } from "@/lib/validacion";

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
  const r = await leerJson(req, rutinaSchema);
  if ("error" in r) return r.error;
  const body = r.data;

  const ids = new Set(
    (await prisma.exercise.findMany({ where: { OR: [{ userId: null }, { userId }] }, select: { id: true } })).map((e) => e.id)
  );
  if (new Set(body.dias.map((d) => d.diaSemana)).size !== body.dias.length) {
    return NextResponse.json({ error: "Día de la semana repetido" }, { status: 400 });
  }
  const dias = body.dias
    .map((d) => ({
      diaSemana: d.diaSemana,
      nombre: d.nombre || "Entrenamiento",
      // Solo ejercicios globales o del propio usuario.
      ejercicios: { create: d.ejercicios.filter((e) => ids.has(e.exerciseId)).map((e, orden) => ({ ...e, orden })) },
    }))
    .filter((d) => d.ejercicios.create.length > 0); // día sin ejercicios = descanso

  const actual = await rutinaActiva(userId, user.diasSemana);
  const rutina = await prisma.$transaction(async (tx) => {
    await tx.routineDay.deleteMany({ where: { routineId: actual.id } });
    return tx.routine.update({
      where: { id: actual.id },
      data: { nombre: body.nombre || actual.nombre, dias: { create: dias } },
    });
  });
  return NextResponse.json({ ok: true, id: rutina.id });
}

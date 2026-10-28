import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { asegurarCatalogo } from "@/lib/seed";

const noAuth = () => NextResponse.json({ error: "No autenticado" }, { status: 401 });

export async function GET() {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  await asegurarCatalogo();
  const ejercicios = await prisma.exercise.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: [{ grupo: "asc" }, { nombre: "asc" }],
  });
  return NextResponse.json(ejercicios);
}

export async function POST(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const b = await req.json().catch(() => ({}));
  const nombre = typeof b.nombre === "string" ? b.nombre.trim() : "";
  const grupo = typeof b.grupo === "string" ? b.grupo.trim() : "";
  if (!nombre || !grupo) return NextResponse.json({ error: "Nombre y grupo muscular son obligatorios" }, { status: 400 });
  const ejercicio = await prisma.exercise.create({
    data: {
      userId,
      slug: `custom_${Date.now().toString(36)}`,
      nombre: nombre.slice(0, 80),
      grupo: grupo.slice(0, 40),
      equipo: String(b.equipo || "Otro").slice(0, 40),
      dificultad: String(b.dificultad || "Intermedio").slice(0, 20),
      seriesSugeridas: Math.min(10, Math.max(1, Math.round(+b.series) || 3)),
      repsSugeridas: String(b.reps || "8-12").slice(0, 30),
      descansoSeg: Math.min(600, Math.max(0, Math.round(+b.descanso) || 90)),
      tip: String(b.tip || "").slice(0, 300),
    },
  });
  return NextResponse.json(ejercicio);
}

export async function DELETE(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const id = new URL(req.url).searchParams.get("id") || "";
  const ej = await prisma.exercise.findFirst({ where: { id, userId } });
  if (!ej) return NextResponse.json({ error: "Solo puedes borrar ejercicios que creaste" }, { status: 404 });
  const enUso = await prisma.routineExercise.count({ where: { exerciseId: id } });
  if (enUso) return NextResponse.json({ error: "Quítalo primero de tu rutina" }, { status: 409 });
  await prisma.exercise.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

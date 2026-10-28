import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { leerJson, noAutenticado, perfilSchema } from "@/lib/validacion";

// Campos del perfil que se pueden devolver al navegador (nunca el hash de la contraseña).
const PUBLICO = {
  id: true, email: true, nombre: true, sexo: true, objetivo: true, edad: true, peso: true, altura: true, nivel: true,
  diasSemana: true, xp: true, streak: true, lastTrainDate: true, createdAt: true,
  pesoObjetivo: true, metaAguaMl: true, metaSuenoH: true, metaKcal: true, metaProteina: true,
} as const;

export async function GET() {
  const userId = await userIdApi();
  if (!userId) return noAutenticado();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: PUBLICO });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAutenticado();
  const r = await leerJson(req, perfilSchema);
  if ("error" in r) return r.error;
  const user = await prisma.user.update({ where: { id: userId }, data: r.data, select: PUBLICO });
  return NextResponse.json(user);
}

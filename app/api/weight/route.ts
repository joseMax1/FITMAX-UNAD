import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { leerJson, noAutenticado, pesoSchema } from "@/lib/validacion";

export async function GET() {
  const userId = await userIdApi();
  if (!userId) return noAutenticado();
  const logs = await prisma.weightLog.findMany({ where: { userId }, orderBy: { date: "asc" } });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAutenticado();
  const r = await leerJson(req, pesoSchema);
  if ("error" in r) return r.error;
  const { peso } = r.data;

  // El perfil se actualiza también, para que los macros y Claude usen el peso actual.
  const [log] = await prisma.$transaction([
    prisma.weightLog.create({ data: { userId, peso } }),
    prisma.user.update({ where: { id: userId }, data: { peso } }),
  ]);
  return NextResponse.json(log);
}

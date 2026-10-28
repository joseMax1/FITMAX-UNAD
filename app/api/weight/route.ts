import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const logs = await prisma.weightLog.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id;
  const peso = Number((await req.json()).peso);
  if (!Number.isFinite(peso) || peso < 20 || peso > 400) {
    return NextResponse.json({ error: "Ingresa un peso válido en kg" }, { status: 400 });
  }

  // El perfil se actualiza también, para que los macros y Claude usen el peso actual.
  const [log] = await prisma.$transaction([
    prisma.weightLog.create({ data: { userId, peso } }),
    prisma.user.update({ where: { id: userId }, data: { peso } }),
  ]);
  return NextResponse.json(log);
}

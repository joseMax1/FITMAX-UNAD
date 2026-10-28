import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { claveDia, claveValida } from "@/lib/fecha";

const noAuth = () => NextResponse.json({ error: "No autenticado" }, { status: 401 });

export async function GET(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const fecha = claveValida(new URL(req.url).searchParams.get("fecha"));
  const registros = await prisma.waterLog.findMany({ where: { userId, fecha }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ fecha, registros, totalMl: registros.reduce((a, r) => a + r.ml, 0) });
}

export async function POST(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const b = (await req.json().catch(() => null)) ?? {};
  const ml = Math.round(Number(b.ml));
  if (!Number.isFinite(ml) || ml <= 0 || ml > 3000) return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
  const registro = await prisma.waterLog.create({ data: { userId, ml, fecha: claveDia() } });
  return NextResponse.json(registro);
}

export async function DELETE(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const id = new URL(req.url).searchParams.get("id") || "";
  const { count } = await prisma.waterLog.deleteMany({ where: { id, userId } });
  return count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "No encontrado" }, { status: 404 });
}

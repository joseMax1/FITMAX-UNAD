import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";

const noAuth = () => NextResponse.json({ error: "No autenticado" }, { status: 401 });
const CAMPOS = ["cintura", "cadera", "pecho", "brazo", "muslo", "cuello", "grasaPct"] as const;

export async function GET() {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  return NextResponse.json(await prisma.bodyMeasurement.findMany({ where: { userId }, orderBy: { date: "asc" } }));
}

export async function POST(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const b = await req.json().catch(() => ({}));
  const data: Partial<Record<(typeof CAMPOS)[number], number>> = {};
  for (const k of CAMPOS) {
    if (b[k] === "" || b[k] == null) continue;
    const n = Number(String(b[k]).replace(",", "."));
    const max = k === "grasaPct" ? 70 : 300;
    if (!Number.isFinite(n) || n <= 0 || n > max) return NextResponse.json({ error: `Valor inválido en ${k}` }, { status: 400 });
    data[k] = n;
  }
  if (!Object.keys(data).length) return NextResponse.json({ error: "Ingresa al menos una medida" }, { status: 400 });
  return NextResponse.json(await prisma.bodyMeasurement.create({ data: { userId, ...data } }));
}

export async function DELETE(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const id = new URL(req.url).searchParams.get("id") || "";
  const { count } = await prisma.bodyMeasurement.deleteMany({ where: { id, userId } });
  return count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "No encontrado" }, { status: 404 });
}

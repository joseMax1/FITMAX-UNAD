import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { asegurarCatalogo } from "@/lib/seed";

const noAuth = () => NextResponse.json({ error: "No autenticado" }, { status: 401 });

export async function GET(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  await asegurarCatalogo();
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  const alimentos = await prisma.food.findMany({
    where: {
      OR: [{ userId: null }, { userId }],
      ...(q ? { nombre: { contains: q, mode: "insensitive" as const } } : {}),
    },
    orderBy: { nombre: "asc" },
    take: 50,
  });
  return NextResponse.json(alimentos);
}

/** Alimento personalizado. Macros por 100 g. */
export async function POST(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const b = await req.json().catch(() => ({}));
  const nombre = typeof b.nombre === "string" ? b.nombre.trim() : "";
  const nums = ["kcal", "proteina", "carbos", "grasa"].map((k) => Number(b[k]));
  if (!nombre || nums.some((n) => !Number.isFinite(n) || n < 0)) {
    return NextResponse.json({ error: "Nombre y macros (por 100 g) son obligatorios" }, { status: 400 });
  }
  const [kcal, proteina, carbos, grasa] = nums;
  const gramos = Number(b.gramos) > 0 ? Number(b.gramos) : 100;
  const food = await prisma.food.create({
    data: { userId, nombre: nombre.slice(0, 80), porcion: String(b.porcion || `${gramos} g`).slice(0, 40), gramos, kcal, proteina, carbos, grasa },
  });
  return NextResponse.json(food);
}

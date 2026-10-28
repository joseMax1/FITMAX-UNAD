import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { asegurarCatalogo } from "@/lib/seed";
import { normalizar } from "@/lib/texto";

const noAuth = () => NextResponse.json({ error: "No autenticado" }, { status: 401 });

export async function GET(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  await asegurarCatalogo();
  const q = normalizar((new URL(req.url).searchParams.get("q") || "").slice(0, 60));
  // El catálogo es pequeño (70 globales + propios): se filtra en memoria para ignorar tildes.
  const alimentos = await prisma.food.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json((q ? alimentos.filter((a) => normalizar(a.nombre).includes(q)) : alimentos).slice(0, 50));
}

/** Alimento personalizado. Macros por 100 g. */
export async function POST(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const b = (await req.json().catch(() => null)) ?? {};
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

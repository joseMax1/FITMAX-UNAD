import { NextResponse } from "next/server";
import { MealType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { claveValida } from "@/lib/fecha";
import { macrosPorGramos } from "@/lib/foods";
import { totalesComida } from "@/lib/resumen";

const noAuth = () => NextResponse.json({ error: "No autenticado" }, { status: 401 });

export async function GET(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const fecha = claveValida(new URL(req.url).searchParams.get("fecha"));
  const [comidas, totales] = await Promise.all([
    prisma.mealLog.findMany({ where: { userId, fecha }, include: { items: true }, orderBy: { createdAt: "asc" } }),
    totalesComida(userId, fecha),
  ]);
  return NextResponse.json({ fecha, comidas, totales });
}

/** body: { fecha?, tipo, foodId, gramos }  (macros calculados desde el alimento) */
export async function POST(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const b = await req.json().catch(() => ({}));
  const fecha = claveValida(b.fecha);
  const tipo = b.tipo as MealType;
  const gramos = Number(b.gramos);
  if (!Object.values(MealType).includes(tipo)) return NextResponse.json({ error: "Tipo de comida inválido" }, { status: 400 });
  if (!Number.isFinite(gramos) || gramos <= 0 || gramos > 3000) return NextResponse.json({ error: "Cantidad en gramos inválida" }, { status: 400 });
  const food = await prisma.food.findFirst({ where: { id: String(b.foodId || ""), OR: [{ userId: null }, { userId }] } });
  if (!food) return NextResponse.json({ error: "Alimento no encontrado" }, { status: 404 });

  const comida =
    (await prisma.mealLog.findFirst({ where: { userId, fecha, tipo } })) ??
    (await prisma.mealLog.create({ data: { userId, fecha, tipo } }));
  const item = await prisma.mealItem.create({
    data: { mealLogId: comida.id, foodId: food.id, nombre: food.nombre, gramos, ...macrosPorGramos(food, gramos) },
  });
  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const itemId = new URL(req.url).searchParams.get("itemId") || "";
  const item = await prisma.mealItem.findFirst({ where: { id: itemId, mealLog: { userId } } });
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  await prisma.mealItem.delete({ where: { id: itemId } });
  const restantes = await prisma.mealItem.count({ where: { mealLogId: item.mealLogId } });
  if (!restantes) await prisma.mealLog.delete({ where: { id: item.mealLogId } });
  return NextResponse.json({ ok: true });
}

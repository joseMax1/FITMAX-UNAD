import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { resumenHoy, recuperacion } from "@/lib/resumen";

export async function GET() {
  const userId = await userIdApi();
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const r = await resumenHoy(user);
  return NextResponse.json({ ...r, recuperacion: recuperacion(r.bienestar) });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { claveDia, sumarDias } from "@/lib/fecha";

const noAuth = () => NextResponse.json({ error: "No autenticado" }, { status: 401 });

/** Últimos 14 días de check-ins. */
export async function GET() {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const desde = sumarDias(claveDia(), -13);
  const registros = await prisma.wellnessLog.findMany({ where: { userId, fecha: { gte: desde } }, orderBy: { fecha: "asc" } });
  return NextResponse.json(registros);
}

/** Crea o actualiza el check-in de hoy. */
export async function PUT(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAuth();
  const b = (await req.json().catch(() => null)) ?? {};
  const escala = (v: unknown) => {
    const n = Math.round(Number(v));
    return v === null || v === undefined || v === "" || !Number.isFinite(n) ? null : Math.min(5, Math.max(1, n));
  };
  const horas = Number(b.horasSueno);
  const data = {
    horasSueno: b.horasSueno === "" || b.horasSueno == null || !Number.isFinite(horas) ? null : Math.min(16, Math.max(0, horas)),
    calidadSueno: escala(b.calidadSueno),
    energia: escala(b.energia),
    estres: escala(b.estres),
    dolorMuscular: escala(b.dolorMuscular),
    notas: typeof b.notas === "string" && b.notas.trim() ? b.notas.trim().slice(0, 500) : null,
  };
  const fecha = claveDia();
  const registro = await prisma.wellnessLog.upsert({
    where: { userId_fecha: { userId, fecha } },
    create: { userId, fecha, ...data },
    update: data,
  });
  return NextResponse.json(registro);
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  const { passwordHash, ...perfil } = user;
  return NextResponse.json(perfil);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const body = await req.json();
  const texto = ["nombre", "sexo", "objetivo", "nivel"];
  const numeros = ["edad", "peso", "altura", "diasSemana", "metaAguaMl", "metaSuenoH"];
  const opcionales = ["pesoObjetivo", "metaKcal", "metaProteina"]; // vacío = usar el valor calculado
  const data: Record<string, unknown> = {};
  for (const k of texto) if (typeof body[k] === "string" && body[k].trim()) data[k] = body[k].trim();
  for (const k of numeros) if (k in body && body[k] !== "" && body[k] !== null && Number.isFinite(+body[k]) && +body[k] > 0) data[k] = k === "edad" || k === "diasSemana" ? Math.round(+body[k]) : +body[k];
  for (const k of opcionales) {
    if (!(k in body)) continue;
    if (body[k] === "" || body[k] === null) data[k] = null;
    else if (Number.isFinite(+body[k]) && +body[k] > 0) data[k] = k === "pesoObjetivo" ? +body[k] : Math.round(+body[k]);
  }
  if (typeof data.metaAguaMl === "number") data.metaAguaMl = Math.min(8000, Math.max(500, Math.round(data.metaAguaMl)));
  if (typeof data.diasSemana === "number") data.diasSemana = Math.min(6, Math.max(2, data.diasSemana));

  const { passwordHash, ...perfil } = await prisma.user.update({ where: { id: (session.user as any).id }, data });
  return NextResponse.json(perfil);
}

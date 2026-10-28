import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { leerJson, registroSchema } from "@/lib/validacion";
import { permitir, ipDe } from "@/lib/limite";

export async function POST(req: Request) {
  // Máximo 5 registros por IP cada hora.
  if (!permitir(`registro:${ipDe(req.headers)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados registros desde esta conexión. Intenta más tarde." }, { status: 429 });
  }
  const r = await leerJson(req, registroSchema);
  if ("error" in r) return r.error;
  const { password, ...datos } = r.data;

  const existing = await prisma.user.findUnique({ where: { email: datos.email } });
  if (existing) {
    return NextResponse.json({ error: "Ese correo ya está registrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { ...datos, passwordHash } });
  return NextResponse.json({ id: user.id, email: user.email });
}

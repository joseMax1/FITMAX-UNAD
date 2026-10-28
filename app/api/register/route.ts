import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { password, nombre, sexo, objetivo, edad, peso, altura, nivel, diasSemana } = body;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !password || !nombre) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }
  if (String(password).length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ese correo ya está registrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email, passwordHash, nombre: String(nombre).trim(),
      sexo: sexo || "H",
      objetivo: objetivo || "Hipertrofia",
      edad: +edad || 25,
      peso: +peso || 70,
      altura: +altura || 170,
      nivel: nivel || "Intermedio",
      diasSemana: Math.min(6, Math.max(2, +diasSemana || 4)),
    },
  });

  return NextResponse.json({ id: user.id, email: user.email });
}

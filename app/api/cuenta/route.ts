import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { leerJson, noAutenticado } from "@/lib/validacion";
import { permitir } from "@/lib/limite";

// Exporta todos los datos del usuario en JSON (derecho de acceso, Ley 1581 de 2012).
export async function GET() {
  const userId = await userIdApi();
  if (!userId) return noAutenticado();
  const datos = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      routines: { include: { dias: { include: { ejercicios: true } } } },
      workoutLogs: { include: { sets: true } },
      exercises: true,
      foods: true,
      meals: { include: { items: true } },
      weightLogs: true,
      measurements: true,
      waterLogs: true,
      wellness: true,
      chatMessages: true,
    },
  });
  if (!datos) return noAutenticado();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...sinClave } = datos;
  return new NextResponse(JSON.stringify({ exportadoEl: new Date().toISOString(), datos: sinClave }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="fitmax-mis-datos.json"`,
    },
  });
}

// Elimina la cuenta y, en cascada, todos sus registros. Pide la contraseña como confirmación.
export async function DELETE(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAutenticado();
  if (!permitir(`borrar:${userId}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
  }
  const r = await leerJson(req, z.object({ password: z.string().min(1, "Escribe tu contraseña").max(72) }));
  if (r.error) return r.error;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) return noAutenticado();
  if (!(await bcrypt.compare(r.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 403 });
  }
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { noAutenticado } from "@/lib/validacion";

/** Devuelve la imagen solo a su dueño; nunca queda en cachés compartidas. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await userIdApi();
  if (!userId) return noAutenticado();
  const { id } = await params;
  const foto = await prisma.progressPhoto.findFirst({ where: { id, userId }, select: { mime: true, data: true } });
  if (!foto) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return new Response(new Uint8Array(foto.data), {
    headers: { "Content-Type": foto.mime, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
}

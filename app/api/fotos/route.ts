import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { leerJson, noAutenticado } from "@/lib/validacion";
import { permitir } from "@/lib/limite";
import { claveDia } from "@/lib/fecha";

const MAX_BYTES = 1_500_000;
const MAX_FOTOS = 60;

// Tipo real según los primeros bytes (no se confía en el tipo que declara el navegador).
function tipoImagen(b: Buffer) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

const fotoSchema = z.object({
  imagen: z.string().max(Math.ceil((MAX_BYTES * 4) / 3) + 100, "La imagen supera 1,5 MB"),
  nota: z.string().trim().max(200).optional(),
});

/** Lista de fotos del usuario (sin la imagen; se pide aparte en /api/fotos/:id). */
export async function GET() {
  const userId = await userIdApi();
  if (!userId) return noAutenticado();
  const fotos = await prisma.progressPhoto.findMany({
    where: { userId },
    select: { id: true, fecha: true, nota: true, bytes: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(fotos);
}

/** body: { imagen: "data:image/jpeg;base64,...", nota? } */
export async function POST(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAutenticado();
  if (!permitir(`fotos:${userId}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Subiste muchas fotos seguidas. Espera un momento." }, { status: 429 });
  }
  const r = await leerJson(req, fotoSchema);
  if (r.error) return r.error;
  const base64 = r.data.imagen.replace(/^data:[^;]+;base64,/, "");
  const data = Buffer.from(base64, "base64");
  const mime = tipoImagen(data);
  if (!mime) return NextResponse.json({ error: "Formato no permitido: usa JPG, PNG o WebP" }, { status: 400 });
  if (data.length > MAX_BYTES) return NextResponse.json({ error: "La imagen supera 1,5 MB" }, { status: 400 });
  if ((await prisma.progressPhoto.count({ where: { userId } })) >= MAX_FOTOS) {
    return NextResponse.json({ error: `Llegaste al máximo de ${MAX_FOTOS} fotos. Borra alguna para subir otra.` }, { status: 409 });
  }
  const foto = await prisma.progressPhoto.create({
    data: { userId, fecha: claveDia(), mime, bytes: data.length, data, nota: r.data.nota || null },
    select: { id: true, fecha: true, nota: true, bytes: true, createdAt: true },
  });
  return NextResponse.json(foto);
}

export async function DELETE(req: Request) {
  const userId = await userIdApi();
  if (!userId) return noAutenticado();
  const id = new URL(req.url).searchParams.get("id") || "";
  const { count } = await prisma.progressPhoto.deleteMany({ where: { id, userId } });
  return count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "No encontrado" }, { status: 404 });
}

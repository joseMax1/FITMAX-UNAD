import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

/** Usuario de la sesión para páginas del servidor; si no hay sesión, redirige al login. */
export async function usuarioActual() {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  const user = id ? await prisma.user.findUnique({ where: { id } }) : null;
  if (!user) redirect("/login");
  return user;
}

/** Id del usuario para rutas /api; null si no hay sesión. Toda consulta debe filtrar por este id. */
export async function userIdApi() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

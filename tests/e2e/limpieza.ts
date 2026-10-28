import { prisma } from "@/lib/prisma";
import { DOMINIO_PRUEBA } from "./utilidades";

// Borra (en cascada) todas las cuentas creadas por la suite. No toca ninguna otra cuenta.
export default async function limpieza() {
  if (!process.env.DATABASE_URL && !process.env.E2E_BASE_URL) return;
  const { count } = await prisma.user.deleteMany({ where: { email: { endsWith: `@${DOMINIO_PRUEBA}` } } });
  console.log(`Limpieza: ${count} cuentas de prueba eliminadas.`);
  await prisma.$disconnect();
}

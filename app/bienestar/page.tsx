import AppShell from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { usuarioActual } from "@/lib/session";
import { claveDia, sumarDias } from "@/lib/fecha";
import { recuperacion } from "@/lib/resumen";
import BienestarClient from "./BienestarClient";

export default async function BienestarPage() {
  const user = await usuarioActual();
  const hoy = claveDia();
  const [agua, checkins, aguaSemana] = await Promise.all([
    prisma.waterLog.findMany({ where: { userId: user.id, fecha: hoy }, orderBy: { createdAt: "asc" } }),
    prisma.wellnessLog.findMany({ where: { userId: user.id, fecha: { gte: sumarDias(hoy, -13) } }, orderBy: { fecha: "asc" } }),
    prisma.waterLog.groupBy({ by: ["fecha"], where: { userId: user.id, fecha: { gte: sumarDias(hoy, -6) } }, _sum: { ml: true } }),
  ]);
  const deHoy = checkins.find((c) => c.fecha === hoy) ?? null;
  const dias7 = Array.from({ length: 7 }, (_, i) => sumarDias(hoy, i - 6));

  return (
    <AppShell user={user}>
      <BienestarClient
        metaAguaMl={user.metaAguaMl}
        metaSuenoH={user.metaSuenoH}
        agua={agua.map((a) => ({ id: a.id, ml: a.ml, hora: a.createdAt.toISOString() }))}
        checkin={deHoy && { horasSueno: deHoy.horasSueno, calidadSueno: deHoy.calidadSueno, energia: deHoy.energia, estres: deHoy.estres, dolorMuscular: deHoy.dolorMuscular, notas: deHoy.notas }}
        recuperacion={recuperacion(deHoy)}
        historial={dias7.map((f) => {
          const c = checkins.find((x) => x.fecha === f);
          return { dia: f.slice(5), sueno: c?.horasSueno ?? null, agua: aguaSemana.find((a) => a.fecha === f)?._sum.ml ?? 0, puntaje: recuperacion(c ?? null)?.puntaje ?? null };
        })}
      />
    </AppShell>
  );
}

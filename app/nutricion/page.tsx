import AppShell from "@/components/AppShell";
import { usuarioActual } from "@/lib/session";
import { metasDe } from "@/lib/resumen";
import { claveDia } from "@/lib/fecha";
import { MENU_ECONOMICO } from "@/lib/nutrition";
import NutricionClient from "./NutricionClient";

export default async function NutricionPage() {
  const user = await usuarioActual();
  return (
    <AppShell user={user}>
      <NutricionClient metas={metasDe(user)} hoy={claveDia()} menu={MENU_ECONOMICO} personalizadas={user.metaKcal != null || user.metaProteina != null} />
    </AppShell>
  );
}

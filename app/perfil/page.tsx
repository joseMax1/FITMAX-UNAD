import AppShell from "@/components/AppShell";
import { usuarioActual } from "@/lib/session";
import { calcularMacros } from "@/lib/nutrition";
import PerfilClient from "./PerfilClient";

export default async function PerfilPage() {
  const user = await usuarioActual();
  const perfil = {
    nombre: user.nombre, email: user.email, sexo: user.sexo, objetivo: user.objetivo, edad: user.edad, peso: user.peso,
    altura: user.altura, nivel: user.nivel, diasSemana: user.diasSemana, pesoObjetivo: user.pesoObjetivo,
    metaAguaMl: user.metaAguaMl, metaSuenoH: user.metaSuenoH, metaKcal: user.metaKcal, metaProteina: user.metaProteina,
  };
  return (
    <AppShell user={user}>
      <PerfilClient perfil={perfil} calculado={calcularMacros(user)} />
    </AppShell>
  );
}

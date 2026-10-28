import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import ClaudeFab from "./ClaudeFab";

/** Estructura común de las pantallas con sesión: barra superior, contenido, navegación y botón de Claude. */
export default function AppShell({ user, children, flex = false }: { user: { nombre: string; objetivo: string }; children: React.ReactNode; flex?: boolean }) {
  return (
    <div className={`min-h-screen bg-bg text-white pb-24 max-w-md mx-auto ${flex ? "flex flex-col" : ""}`}>
      <TopBar nombre={user.nombre} objetivo={user.objetivo} />
      <div className={`px-4 pt-3 ${flex ? "flex-1 flex flex-col" : "space-y-4"}`}>{children}</div>
      <BottomNav />
      <ClaudeFab />
    </div>
  );
}

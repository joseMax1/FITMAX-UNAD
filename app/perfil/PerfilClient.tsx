"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type Perfil = {
  nombre: string; email: string; sexo: string; objetivo: string; edad: number; peso: number; altura: number; nivel: string; diasSemana: number;
  pesoObjetivo: number | null; metaAguaMl: number; metaSuenoH: number; metaKcal: number | null; metaProteina: number | null;
};

const OBJETIVOS = ["Hipertrofia", "Recomposición corporal", "Pérdida de grasa / Definición", "Fuerza", "Mantenimiento"];
const NIVELES = ["Principiante", "Intermedio", "Avanzado"];

export default function PerfilClient({ perfil, calculado }: { perfil: Perfil; calculado: { kcal: number; proteina: number } }) {
  const router = useRouter();
  const [f, setF] = useState(() => Object.fromEntries(Object.entries(perfil).map(([k, v]) => [k, v == null ? "" : String(v)])) as Record<keyof Perfil, string>);
  const [estado, setEstado] = useState("");
  const set = (k: keyof Perfil, v: string) => { setF({ ...f, [k]: v }); setEstado(""); };

  async function guardar() {
    setEstado("Guardando…");
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) }).catch(() => null);
    if (!res?.ok) return setEstado("No se pudo guardar.");
    setEstado(+f.diasSemana !== perfil.diasSemana
      ? "Guardado ✓. Cambiaste los días por semana: actualiza tu rutina en Entrenar → Rutina."
      : "Guardado ✓");
    router.refresh();
  }

  const [borrando, setBorrando] = useState(false);
  const [clave, setClave] = useState("");
  const [estadoBorrar, setEstadoBorrar] = useState("");

  async function eliminarCuenta() {
    setEstadoBorrar("Eliminando…");
    const res = await fetch("/api/cuenta", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: clave }) }).catch(() => null);
    if (!res) return setEstadoBorrar("Sin conexión. Intenta de nuevo.");
    if (!res.ok) return setEstadoBorrar((await res.json().catch(() => null))?.error ?? "No se pudo eliminar.");
    await signOut({ callbackUrl: "/login" });
  }

  const input = "w-full mt-1 px-3 py-2 rounded-lg bg-card2 border border-border text-sm text-white";
  const label = "block text-xs text-sub";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black uppercase">Mi perfil</h2>
      <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
        <label className={label}>Nombre<input className={input} value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></label>
        <div className="text-xs text-sub">Correo: {perfil.email}</div>
        <div className="grid grid-cols-2 gap-2">
          <label className={label}>Sexo
            <select className={input} value={f.sexo} onChange={(e) => set("sexo", e.target.value)}><option value="H">Hombre</option><option value="M">Mujer</option></select>
          </label>
          <label className={label}>Nivel
            <select className={input} value={f.nivel} onChange={(e) => set("nivel", e.target.value)}>{NIVELES.map((n) => <option key={n}>{n}</option>)}</select>
          </label>
        </div>
        <label className={label}>Objetivo
          <select className={input} value={f.objetivo} onChange={(e) => set("objetivo", e.target.value)}>{OBJETIVOS.map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <label className={label}>Edad<input className={input} inputMode="numeric" value={f.edad} onChange={(e) => set("edad", e.target.value)} /></label>
          <label className={label}>Peso (kg)<input className={input} inputMode="decimal" value={f.peso} onChange={(e) => set("peso", e.target.value)} /></label>
          <label className={label}>Altura (cm)<input className={input} inputMode="numeric" value={f.altura} onChange={(e) => set("altura", e.target.value)} /></label>
        </div>
        <label className={label}>Días de entrenamiento por semana: {f.diasSemana}
          <input type="range" min={2} max={6} value={f.diasSemana} onChange={(e) => set("diasSemana", e.target.value)} className="w-full mt-1" />
        </label>
      </div>

      <h2 className="text-lg font-black uppercase">Mis metas</h2>
      <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
        <label className={label}>Peso objetivo (kg)<input className={input} inputMode="decimal" value={f.pesoObjetivo} placeholder="Sin definir" onChange={(e) => set("pesoObjetivo", e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className={label}>Calorías por día<input className={input} inputMode="numeric" value={f.metaKcal} placeholder={`${calculado.kcal} (calculado)`} onChange={(e) => set("metaKcal", e.target.value)} /></label>
          <label className={label}>Proteína (g/día)<input className={input} inputMode="numeric" value={f.metaProteina} placeholder={`${calculado.proteina} (calculado)`} onChange={(e) => set("metaProteina", e.target.value)} /></label>
          <label className={label}>Agua (ml/día)<input className={input} inputMode="numeric" value={f.metaAguaMl} onChange={(e) => set("metaAguaMl", e.target.value)} /></label>
          <label className={label}>Sueño (h/noche)<input className={input} inputMode="decimal" value={f.metaSuenoH} onChange={(e) => set("metaSuenoH", e.target.value)} /></label>
        </div>
        <div className="text-[11px] text-sub">Deja calorías y proteína vacías para usar el cálculo automático según tu peso y objetivo.</div>
      </div>

      <button onClick={guardar} className="w-full py-3 rounded-xl font-bold bg-accent text-white">Guardar cambios</button>
      {estado && <div className="text-sm text-center text-sub">{estado}</div>}

      <h2 className="text-lg font-black uppercase">Mis datos</h2>
      <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
        <a href="/api/cuenta" download className="block w-full py-2 rounded-xl text-center text-sm font-bold bg-card2 border border-border">Descargar mis datos (JSON)</a>
        {!borrando ? (
          <button onClick={() => setBorrando(true)} className="w-full py-2 rounded-xl text-sm font-bold text-red-400 border border-red-400/40">Eliminar mi cuenta</button>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-sub">Se borrarán tu perfil, entrenamientos, comidas, medidas, bienestar y chat. No se puede deshacer. Escribe tu contraseña para confirmar.</div>
            <input className={input} type="password" autoComplete="current-password" placeholder="Contraseña" value={clave} onChange={(e) => { setClave(e.target.value); setEstadoBorrar(""); }} />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setBorrando(false); setClave(""); setEstadoBorrar(""); }} className="py-2 rounded-xl text-sm bg-card2 border border-border">Cancelar</button>
              <button onClick={eliminarCuenta} disabled={!clave} className="py-2 rounded-xl text-sm font-bold bg-red-500 text-white disabled:opacity-40">Eliminar definitivamente</button>
            </div>
            {estadoBorrar && <div className="text-sm text-center text-red-400">{estadoBorrar}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

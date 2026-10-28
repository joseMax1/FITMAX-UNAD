"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, Trash2, Moon, BatteryCharging } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Barra from "@/components/Barra";

type Checkin = { horasSueno: number | null; calidadSueno: number | null; energia: number | null; estres: number | null; dolorMuscular: number | null; notas: string | null };
type Props = {
  metaAguaMl: number;
  metaSuenoH: number;
  agua: { id: string; ml: number; hora: string }[];
  checkin: Checkin | null;
  recuperacion: { puntaje: number; sugerencia: string } | null;
  historial: { dia: string; sueno: number | null; agua: number; puntaje: number | null }[];
};

const EJE = { fontSize: 10, fill: "#8B909C" };
const TOOLTIP = { contentStyle: { background: "#20232A", border: "1px solid #2B2E36", borderRadius: 8 }, labelStyle: { color: "#8B909C" }, cursor: { fill: "#20232A" } };
const ESCALAS: { k: "calidadSueno" | "energia" | "estres" | "dolorMuscular"; label: string; bajo: string; alto: string }[] = [
  { k: "calidadSueno", label: "Calidad del sueño", bajo: "Mala", alto: "Excelente" },
  { k: "energia", label: "Energía", bajo: "Agotado", alto: "Con toda" },
  { k: "estres", label: "Estrés", bajo: "Tranquilo", alto: "Muy alto" },
  { k: "dolorMuscular", label: "Dolor muscular", bajo: "Nada", alto: "Mucho" },
];

export default function BienestarClient(p: Props) {
  const router = useRouter();
  const total = p.agua.reduce((a, r) => a + r.ml, 0);
  const [enviando, setEnviando] = useState(false);
  const [otro, setOtro] = useState("");
  const [form, setForm] = useState<Checkin>(p.checkin ?? { horasSueno: null, calidadSueno: null, energia: null, estres: null, dolorMuscular: null, notas: null });
  const [estado, setEstado] = useState("");

  async function sumarAgua(ml: number) {
    if (!(ml > 0) || enviando) return;
    setEnviando(true);
    await fetch("/api/agua", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ml }) }).catch(() => null);
    setEnviando(false);
    setOtro("");
    router.refresh();
  }

  async function quitarAgua(id: string) {
    await fetch(`/api/agua?id=${id}`, { method: "DELETE" }).catch(() => null);
    router.refresh();
  }

  async function guardarCheckin() {
    setEstado("Guardando…");
    const res = await fetch("/api/bienestar", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => null);
    setEstado(res?.ok ? "Check-in guardado ✓" : "No se pudo guardar.");
    if (res?.ok) router.refresh();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black uppercase flex items-center gap-2"><Droplets size={18} className="text-accent2" /> Hidratación</h2>
      <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
        <div className="flex items-end justify-between">
          <div className="text-3xl font-black text-accent2 tabular-nums">{(total / 1000).toFixed(2)} L</div>
          <div className="text-xs text-sub">meta {(p.metaAguaMl / 1000).toFixed(1)} L · {Math.round((total / p.metaAguaMl) * 100)}%</div>
        </div>
        <Barra label="Hoy" valor={total} meta={p.metaAguaMl} unidad="ml" color="bg-accent2" />
        <div className="grid grid-cols-3 gap-2">
          {[250, 500, 750].map((ml) => (
            <button key={ml} disabled={enviando} onClick={() => sumarAgua(ml)} className="py-2 rounded-lg bg-card2 border border-border text-sm font-bold disabled:opacity-50">+{ml} ml</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input inputMode="numeric" value={otro} onChange={(e) => setOtro(e.target.value)} placeholder="Otra cantidad (ml)" className="flex-1 px-3 py-2 rounded-lg bg-card2 border border-border text-sm" />
          <button disabled={enviando} onClick={() => sumarAgua(Number(otro))} className="px-4 rounded-lg bg-accent2 text-white font-bold text-sm">Agregar</button>
        </div>
        {p.agua.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {p.agua.map((a) => (
              <button key={a.id} onClick={() => quitarAgua(a.id)} title="Quitar" className="text-[11px] px-2 py-1 rounded-full bg-card2 text-sub flex items-center gap-1">
                {new Date(a.hora).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })} · {a.ml} ml <Trash2 size={10} />
              </button>
            ))}
          </div>
        )}
      </div>

      <h2 className="text-lg font-black uppercase flex items-center gap-2 pt-1"><BatteryCharging size={18} className="text-accent" /> Recuperación</h2>
      {p.recuperacion && (
        <div className="rounded-2xl p-4 bg-card2 border border-border">
          <div className="text-xs uppercase font-semibold text-sub">Puntaje de hoy</div>
          <div className="text-2xl font-black">{p.recuperacion.puntaje} / 5</div>
          <div className="text-sm mt-1">{p.recuperacion.sugerencia}</div>
        </div>
      )}
      <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
        <div className="font-bold text-sm">{p.checkin ? "Tu check-in de hoy" : "¿Cómo amaneciste hoy?"}</div>
        <label className="block text-xs text-sub">
          <span className="flex items-center gap-1"><Moon size={12} /> Horas de sueño anoche (meta {p.metaSuenoH} h)</span>
          <input inputMode="decimal" value={form.horasSueno ?? ""} onChange={(e) => setForm({ ...form, horasSueno: e.target.value === "" ? null : Number(e.target.value.replace(",", ".")) })}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-card2 border border-border text-sm text-white" />
        </label>
        {ESCALAS.map((s) => (
          <div key={s.k}>
            <div className="text-xs text-sub mb-1">{s.label}</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setForm({ ...form, [s.k]: n })}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-bold border border-border ${form[s.k] === n ? "bg-accent text-white" : "bg-card2 text-sub"}`}>{n}</button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-sub mt-0.5"><span>{s.bajo}</span><span>{s.alto}</span></div>
          </div>
        ))}
        <textarea value={form.notas ?? ""} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Notas (opcional)" rows={2}
          className="w-full px-3 py-2 rounded-lg bg-card2 border border-border text-sm" />
        <button onClick={guardarCheckin} className="w-full py-2 rounded-lg bg-accent text-white font-bold text-sm">{p.checkin ? "Actualizar check-in" : "Guardar check-in"}</button>
        {estado && <div className="text-xs text-center text-sub">{estado}</div>}
      </div>

      <div className="rounded-2xl p-4 bg-card border border-border space-y-2">
        <div className="text-sm font-bold">Últimos 7 días: horas de sueño</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={p.historial}>
            <XAxis dataKey="dia" tick={EJE} />
            <YAxis tick={EJE} width={24} domain={[0, 12]} />
            <Tooltip {...TOOLTIP} />
            <ReferenceLine y={p.metaSuenoH} stroke="#4F9DDE" strokeDasharray="4 4" />
            <Bar dataKey="sueno" name="Horas" fill="#FF6B4A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-sm font-bold pt-2">Últimos 7 días: agua (ml)</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={p.historial}>
            <XAxis dataKey="dia" tick={EJE} />
            <YAxis tick={EJE} width={40} />
            <Tooltip {...TOOLTIP} />
            <ReferenceLine y={p.metaAguaMl} stroke="#4F9DDE" strokeDasharray="4 4" />
            <Bar dataKey="agua" name="Agua" fill="#4F9DDE" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

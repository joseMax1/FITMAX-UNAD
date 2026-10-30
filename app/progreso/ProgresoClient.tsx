"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { Plus, Trash2 } from "lucide-react";
import Tabs from "@/components/Tabs";
import Fotos from "./Fotos";

type Medida = { id: string; fecha: string; cintura: number | null; cadera: number | null; pecho: number | null; brazo: number | null; muslo: number | null; cuello: number | null; grasaPct: number | null };
type Props = {
  pesoObjetivo: number | null;
  weightLogs: { fecha: string; peso: number }[];
  medidas: Medida[];
  fuerza: Record<string, { fecha: string; e1rm: number; kg: number }[]>;
  volumen: { semana: string; kg: number }[];
  historial: { dia: string; fecha: string; duracionMin: number | null; series: number; ejercicios: string[] }[];
};
type Tab = "peso" | "medidas" | "fotos" | "fuerza" | "volumen" | "historial";

const EJE = { fontSize: 10, fill: "#8B909C" };
const TOOLTIP = { contentStyle: { background: "#20232A", border: "1px solid #2B2E36", borderRadius: 8 }, labelStyle: { color: "#8B909C" } };
const CAMPOS: { k: keyof Omit<Medida, "id" | "fecha">; label: string; unidad: string }[] = [
  { k: "cintura", label: "Cintura", unidad: "cm" },
  { k: "cadera", label: "Cadera", unidad: "cm" },
  { k: "pecho", label: "Pecho", unidad: "cm" },
  { k: "brazo", label: "Brazo", unidad: "cm" },
  { k: "muslo", label: "Muslo", unidad: "cm" },
  { k: "cuello", label: "Cuello", unidad: "cm" },
  { k: "grasaPct", label: "% grasa", unidad: "%" },
];

async function enviar(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  if (!res?.ok) return (await res?.json().catch(() => null))?.error || "No se pudo guardar.";
  return null;
}

export default function ProgresoClient(p: Props) {
  const [tab, setTab] = useState<Tab>("peso");
  return (
    <div className="space-y-4">
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[
        { id: "peso", label: "Peso" }, { id: "medidas", label: "Medidas" }, { id: "fotos", label: "Fotos" }, { id: "fuerza", label: "Fuerza" },
        { id: "volumen", label: "Volumen" }, { id: "historial", label: "Historial" },
      ]} />
      {tab === "peso" && <Peso logs={p.weightLogs} objetivo={p.pesoObjetivo} />}
      {tab === "medidas" && <Medidas medidas={p.medidas} />}
      {tab === "fotos" && <Fotos />}
      {tab === "fuerza" && <Fuerza fuerza={p.fuerza} />}
      {tab === "volumen" && <Volumen volumen={p.volumen} />}
      {tab === "historial" && <HistorialTab historial={p.historial} />}
    </div>
  );
}

function Peso({ logs, objetivo }: { logs: Props["weightLogs"]; objetivo: number | null }) {
  const router = useRouter();
  const [peso, setPeso] = useState("");
  const [error, setError] = useState("");
  const primero = logs[0]?.peso;
  const ultimo = logs[logs.length - 1]?.peso;

  async function registrar() {
    if (!peso) return;
    setError("");
    const err = await enviar("/api/weight", { peso: +peso.replace(",", ".") });
    if (err) return setError(err);
    setPeso("");
    router.refresh();
  }

  return (
    <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
      {logs.length > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-card2 p-2"><div className="font-black">{ultimo} kg</div><div className="text-[10px] text-sub">Actual</div></div>
          <div className="rounded-lg bg-card2 p-2"><div className="font-black">{ultimo != null && primero != null ? `${ultimo - primero > 0 ? "+" : ""}${Math.round((ultimo - primero) * 10) / 10}` : "-"} kg</div><div className="text-[10px] text-sub">Cambio total</div></div>
          <div className="rounded-lg bg-card2 p-2"><div className="font-black">{objetivo ?? "-"}{objetivo ? " kg" : ""}</div><div className="text-[10px] text-sub">Objetivo</div></div>
        </div>
      )}
      {logs.length > 1 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={logs}>
            <CartesianGrid stroke="#2B2E36" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" tick={EJE} />
            <YAxis tick={EJE} domain={["auto", "auto"]} width={36} />
            <Tooltip {...TOOLTIP} />
            {objetivo && <ReferenceLine y={objetivo} stroke="#4F9DDE" strokeDasharray="4 4" />}
            <Line type="monotone" dataKey="peso" stroke="#FF6B4A" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-sm text-sub">Registra al menos dos pesajes para ver tu gráfica.</div>
      )}
      <div className="flex gap-2">
        <input inputMode="decimal" placeholder="Peso hoy (kg)" value={peso} onChange={(e) => setPeso(e.target.value)} onKeyDown={(e) => e.key === "Enter" && registrar()}
          className="flex-1 px-3 py-2 rounded-lg bg-card2 border border-border" />
        <button onClick={registrar} aria-label="Registrar peso" className="px-4 rounded-lg text-white font-bold bg-accent"><Plus size={16} /></button>
      </div>
      {error && <div className="text-xs text-accent">{error}</div>}
      {!objetivo && <div className="text-[11px] text-sub">Define tu peso objetivo en tu perfil (toca tu nombre arriba).</div>}
    </div>
  );
}

function Medidas({ medidas }: { medidas: Medida[] }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [campo, setCampo] = useState<(typeof CAMPOS)[number]["k"]>("cintura");
  const [error, setError] = useState("");
  const ultima = medidas[medidas.length - 1];
  const serie = medidas.filter((m) => m[campo] != null).map((m) => ({ fecha: m.fecha.slice(5), valor: m[campo] }));

  async function guardar() {
    setError("");
    const err = await enviar("/api/medidas", form);
    if (err) return setError(err);
    setForm({});
    router.refresh();
  }

  async function borrar(id: string) {
    if (!confirm("¿Borrar este registro de medidas?")) return;
    await fetch(`/api/medidas?id=${id}`, { method: "DELETE" }).catch(() => null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
        <div className="font-bold text-sm">Registrar medidas de hoy</div>
        <div className="grid grid-cols-3 gap-2">
          {CAMPOS.map((c) => (
            <label key={c.k} className="text-[10px] text-sub">{c.label} ({c.unidad})
              <input inputMode="decimal" value={form[c.k] ?? ""} onChange={(e) => setForm({ ...form, [c.k]: e.target.value })}
                placeholder={ultima?.[c.k] != null ? String(ultima[c.k]) : ""}
                className="w-full mt-0.5 px-2 py-1.5 rounded bg-card2 border border-border text-sm text-white" />
            </label>
          ))}
        </div>
        {error && <div className="text-xs text-accent">{error}</div>}
        <button onClick={guardar} className="w-full py-2 rounded-lg bg-accent text-white font-bold text-sm">Guardar medidas</button>
      </div>

      <div className="rounded-2xl p-4 bg-card border border-border space-y-2">
        <div className="flex gap-1 overflow-x-auto">
          {CAMPOS.map((c) => (
            <button key={c.k} onClick={() => setCampo(c.k)} className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${campo === c.k ? "bg-accent2 text-white" : "bg-card2 text-sub"}`}>{c.label}</button>
          ))}
        </div>
        {serie.length > 1 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={serie}>
              <CartesianGrid stroke="#2B2E36" strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tick={EJE} />
              <YAxis tick={EJE} domain={["auto", "auto"]} width={36} />
              <Tooltip {...TOOLTIP} />
              <Line type="monotone" dataKey="valor" stroke="#4F9DDE" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <div className="text-sm text-sub">Necesitas al menos dos registros de esta medida para ver la gráfica.</div>}
      </div>

      {medidas.slice(-5).reverse().map((m) => (
        <div key={m.id} className="rounded-lg p-3 bg-card border border-border text-xs flex justify-between gap-2">
          <div>
            <div className="font-bold">{m.fecha}</div>
            <div className="text-sub">{CAMPOS.filter((c) => m[c.k] != null).map((c) => `${c.label} ${m[c.k]}${c.unidad}`).join(" · ")}</div>
          </div>
          <button onClick={() => borrar(m.id)} aria-label="Borrar" className="text-accent p-1"><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function Fuerza({ fuerza }: { fuerza: Props["fuerza"] }) {
  const ejercicios = Object.keys(fuerza).sort((a, b) => fuerza[b].length - fuerza[a].length);
  const [ej, setEj] = useState(ejercicios[0] ?? "");
  if (!ejercicios.length) return <div className="text-sm text-sub">Completa entrenamientos para ver tu evolución de fuerza.</div>;
  const datos = fuerza[ej] ?? [];
  const mejor = datos.reduce((a, d) => Math.max(a, d.e1rm), 0);
  return (
    <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
      <select value={ej} onChange={(e) => setEj(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card2 border border-border text-sm">
        {ejercicios.map((e) => <option key={e}>{e}</option>)}
      </select>
      <div className="text-sm">Mejor 1RM estimado: <b className="text-accent">{mejor} kg</b> <span className="text-sub text-xs">(fórmula de Epley)</span></div>
      {datos.length > 1 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={datos}>
            <CartesianGrid stroke="#2B2E36" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" tick={EJE} />
            <YAxis tick={EJE} domain={["auto", "auto"]} width={36} />
            <Tooltip {...TOOLTIP} />
            <Line type="monotone" dataKey="e1rm" name="1RM est." stroke="#FF6B4A" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="kg" name="Peso usado" stroke="#4F9DDE" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : <div className="text-sm text-sub">Registra este ejercicio en al menos dos sesiones para ver la gráfica.</div>}
    </div>
  );
}

function Volumen({ volumen }: { volumen: Props["volumen"] }) {
  return (
    <div className="rounded-2xl p-4 bg-card border border-border space-y-2">
      <div className="text-sm font-bold">Volumen semanal (kg × reps)</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={volumen}>
          <CartesianGrid stroke="#2B2E36" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="semana" tick={EJE} />
          <YAxis tick={EJE} width={44} />
          <Tooltip {...TOOLTIP} cursor={{ fill: "#20232A" }} />
          <Bar dataKey="kg" name="Volumen" fill="#FF6B4A" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-[11px] text-sub">Cada barra es una semana (fecha del lunes). Subir el volumen poco a poco es una señal de progreso.</div>
    </div>
  );
}

function HistorialTab({ historial }: { historial: Props["historial"] }) {
  return (
    <div className="space-y-2">
      {historial.map((w, i) => (
        <div key={i} className="rounded-lg p-3 bg-card border border-border">
          <div className="flex justify-between text-sm font-bold"><span>{w.dia}</span><span className="text-sub">{w.fecha}</span></div>
          <div className="text-xs mt-1 text-sub">{w.series} series{w.duracionMin ? ` · ${w.duracionMin} min` : ""} · {w.ejercicios.join(", ")}</div>
        </div>
      ))}
      {!historial.length && <div className="text-sm text-sub">Aún no has completado ningún entrenamiento.</div>}
    </div>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Search } from "lucide-react";
import Barra from "@/components/Barra";
import { TIPOS_COMIDA, macrosPorGramos } from "@/lib/foods";
import { sumarDias } from "@/lib/fecha";

type Metas = { kcal: number; proteina: number; carbos: number; grasa: number };
type Item = { id: string; nombre: string; gramos: number; kcal: number; proteina: number; carbos: number; grasa: number };
type Comida = { id: string; tipo: string; items: Item[] };
type Alimento = { id: string; nombre: string; porcion: string; gramos: number; kcal: number; proteina: number; carbos: number; grasa: number; userId: string | null };

export default function NutricionClient({ metas, hoy, menu, personalizadas }: { metas: Metas; hoy: string; menu: Record<string, string>; personalizadas: boolean }) {
  const [fecha, setFecha] = useState(hoy);
  const [comidas, setComidas] = useState<Comida[]>([]);
  const [totales, setTotales] = useState({ kcal: 0, proteina: 0, carbos: 0, grasa: 0 });
  const [cargando, setCargando] = useState(true);
  const [agregarA, setAgregarA] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    const d = await fetch(`/api/comidas?fecha=${fecha}`).then((r) => r.json()).catch(() => null);
    if (d?.comidas) {
      setComidas(d.comidas);
      setTotales(d.totales);
    }
    setCargando(false);
  }, [fecha]);

  useEffect(() => { cargar(); }, [cargar]);

  async function borrar(itemId: string) {
    await fetch(`/api/comidas?itemId=${itemId}`, { method: "DELETE" }).catch(() => null);
    cargar();
  }

  const etiquetaFecha = fecha === hoy ? "Hoy" : fecha === sumarDias(hoy, -1) ? "Ayer" : fecha;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setFecha(sumarDias(fecha, -1))} className="p-2 rounded-lg bg-card2" aria-label="Día anterior"><ChevronLeft size={16} /></button>
        <div className="font-black uppercase">{etiquetaFecha}</div>
        <button onClick={() => setFecha(sumarDias(fecha, 1))} disabled={fecha >= hoy} className="p-2 rounded-lg bg-card2 disabled:opacity-30" aria-label="Día siguiente"><ChevronRight size={16} /></button>
      </div>

      <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-black text-accent tabular-nums">{totales.kcal}</div>
            <div className="text-xs text-sub">de {metas.kcal} kcal</div>
          </div>
          <div className="text-right text-xs text-sub">
            {metas.kcal - totales.kcal >= 0 ? `Te quedan ${metas.kcal - totales.kcal} kcal` : `${totales.kcal - metas.kcal} kcal por encima`}
          </div>
        </div>
        <Barra label="Proteína" valor={totales.proteina} meta={metas.proteina} color="bg-accent" />
        <Barra label="Carbohidratos" valor={totales.carbos} meta={metas.carbos} color="bg-accent2" />
        <Barra label="Grasas" valor={totales.grasa} meta={metas.grasa} color="bg-yellow-500" />
        <div className="text-[11px] text-sub">
          {personalizadas ? "Metas personalizadas en tu perfil." : "Metas estimadas con tus datos (Mifflin-St Jeor); puedes ajustarlas en tu perfil."} No reemplaza a un nutricionista.
        </div>
      </div>

      {cargando && <div className="text-sm text-sub">Cargando…</div>}

      {TIPOS_COMIDA.map((t) => {
        const c = comidas.find((x) => x.tipo === t.id);
        const kcal = Math.round(c?.items.reduce((a, i) => a + i.kcal, 0) ?? 0);
        return (
          <div key={t.id} className="rounded-xl p-3 bg-card border border-border">
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm">{t.label} <span className="text-sub font-normal text-xs">{kcal ? `· ${kcal} kcal` : ""}</span></div>
              <button onClick={() => setAgregarA(t.id)} className="text-xs px-2 py-1 rounded-lg bg-card2 flex items-center gap-1"><Plus size={12} /> Agregar</button>
            </div>
            {c?.items.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-xs mt-2">
                <div>
                  <div>{i.nombre} <span className="text-sub">· {i.gramos} g</span></div>
                  <div className="text-sub">{Math.round(i.kcal)} kcal · P {i.proteina} · C {i.carbos} · G {i.grasa}</div>
                </div>
                <button onClick={() => borrar(i.id)} aria-label="Quitar" className="p-1 text-accent"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        );
      })}

      <details className="rounded-xl p-3 bg-card2 border border-border">
        <summary className="font-bold text-sm cursor-pointer">Ideas de menú económico</summary>
        <div className="space-y-2 mt-2">
          {Object.entries(menu).map(([k, v]) => (
            <div key={k} className="text-xs"><span className="font-semibold">{k}:</span> <span className="text-sub">{v}</span></div>
          ))}
        </div>
      </details>

      {agregarA && (
        <AgregarAlimento
          tipo={agregarA}
          fecha={fecha}
          onClose={() => setAgregarA(null)}
          onAdded={() => { setAgregarA(null); cargar(); }}
        />
      )}
    </div>
  );
}

function AgregarAlimento({ tipo, fecha, onClose, onAdded }: { tipo: string; fecha: string; onClose: () => void; onAdded: () => void }) {
  const [q, setQ] = useState("");
  const [lista, setLista] = useState<Alimento[]>([]);
  const [sel, setSel] = useState<Alimento | null>(null);
  const [gramos, setGramos] = useState("");
  const [error, setError] = useState("");
  const [nuevo, setNuevo] = useState<null | { nombre: string; kcal: string; proteina: string; carbos: string; grasa: string }>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`/api/alimentos?q=${encodeURIComponent(q)}`).then((r) => r.json()).then((d) => Array.isArray(d) && setLista(d)).catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  async function guardar() {
    if (!sel) return;
    setError("");
    const res = await fetch("/api/comidas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha, tipo, foodId: sel.id, gramos: Number(gramos.replace(",", ".")) }),
    }).catch(() => null);
    if (!res?.ok) return setError((await res?.json().catch(() => null))?.error || "No se pudo agregar.");
    onAdded();
  }

  async function crearAlimento() {
    if (!nuevo) return;
    setError("");
    const res = await fetch("/api/alimentos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nuevo) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) return setError(data?.error || "No se pudo crear.");
    setNuevo(null);
    setSel(data);
    setGramos(String(data.gramos));
  }

  const g = Number(gramos.replace(",", "."));
  const preview = sel && g > 0 ? macrosPorGramos(sel, g) : null;
  const label = TIPOS_COMIDA.find((t) => t.id === tipo)?.label;

  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-2xl bg-bg border-t border-border p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="font-black uppercase">Agregar a {label}</div>
          <button onClick={onClose} aria-label="Cerrar" className="p-1"><X size={18} /></button>
        </div>

        {sel ? (
          <div className="space-y-3">
            <div className="rounded-xl p-3 bg-card border border-border">
              <div className="font-bold text-sm">{sel.nombre}</div>
              <div className="text-xs text-sub">Por 100 g: {sel.kcal} kcal · P {sel.proteina} · C {sel.carbos} · G {sel.grasa}</div>
            </div>
            <label className="block text-xs text-sub">
              Cantidad en gramos (porción sugerida: {sel.porcion} = {sel.gramos} g)
              <input autoFocus inputMode="decimal" value={gramos} onChange={(e) => setGramos(e.target.value)} onKeyDown={(e) => e.key === "Enter" && guardar()}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-card2 border border-border text-white" />
            </label>
            {preview && <div className="text-sm"><b>{preview.kcal} kcal</b> · P {preview.proteina} g · C {preview.carbos} g · G {preview.grasa} g</div>}
            {error && <div className="text-xs text-accent">{error}</div>}
            <div className="flex gap-2">
              <button onClick={() => setSel(null)} className="flex-1 py-2 rounded-lg bg-card2 border border-border text-sm">Atrás</button>
              <button onClick={guardar} disabled={!preview} className="flex-1 py-2 rounded-lg bg-accent text-white font-bold text-sm disabled:opacity-40">Agregar</button>
            </div>
          </div>
        ) : nuevo ? (
          <div className="space-y-2">
            <div className="text-xs text-sub">Valores por cada 100 g (aparecen en la etiqueta nutricional).</div>
            <input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Nombre" className="w-full px-3 py-2 rounded-lg bg-card2 border border-border text-sm" />
            <div className="grid grid-cols-4 gap-2">
              {(["kcal", "proteina", "carbos", "grasa"] as const).map((k) => (
                <label key={k} className="text-[10px] text-sub">{k === "kcal" ? "kcal" : k === "proteina" ? "Prot. g" : k === "carbos" ? "Carb. g" : "Grasa g"}
                  <input inputMode="decimal" value={nuevo[k]} onChange={(e) => setNuevo({ ...nuevo, [k]: e.target.value.replace(",", ".") })}
                    className="w-full mt-0.5 px-2 py-1 rounded bg-card2 border border-border text-sm text-white" />
                </label>
              ))}
            </div>
            {error && <div className="text-xs text-accent">{error}</div>}
            <div className="flex gap-2">
              <button onClick={() => setNuevo(null)} className="flex-1 py-2 rounded-lg bg-card2 border border-border text-sm">Cancelar</button>
              <button onClick={crearAlimento} className="flex-1 py-2 rounded-lg bg-accent text-white font-bold text-sm">Crear alimento</button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-sub" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar alimento (arroz, huevo, pollo…)"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-card2 border border-border text-sm" />
            </div>
            <div className="space-y-1">
              {lista.map((a) => (
                <button key={a.id} onClick={() => { setSel(a); setGramos(String(a.gramos)); }}
                  className="w-full text-left rounded-lg p-2 bg-card border border-border">
                  <div className="text-sm font-semibold">{a.nombre} {a.userId && <span className="text-[10px] text-accent2">· propio</span>}</div>
                  <div className="text-[11px] text-sub">{a.porcion} ({a.gramos} g) · {Math.round(a.kcal * a.gramos / 100)} kcal</div>
                </button>
              ))}
              {!lista.length && <div className="text-xs text-sub">Sin resultados.</div>}
            </div>
            <button onClick={() => setNuevo({ nombre: q, kcal: "", proteina: "", carbos: "", grasa: "" })}
              className="w-full py-2 rounded-lg text-sm bg-card2 border border-border">¿No está? Crear alimento propio</button>
          </>
        )}
      </div>
    </div>
  );
}

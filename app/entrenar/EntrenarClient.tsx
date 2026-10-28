"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, ArrowLeft, Check, Plus, Trash2, ArrowUp, ArrowDown, Trophy, Play } from "lucide-react";
import Tabs from "@/components/Tabs";
import { DIAS_SEMANA } from "@/lib/exercises";

export type EjercicioRutina = {
  exerciseId: string; nombre: string; grupo: string; tip: string; series: number; reps: string; descansoSeg: number;
};
export type DiaRutina = { id: string; diaSemana: number; nombre: string; ejercicios: EjercicioRutina[] };
export type EjercicioLib = {
  id: string; nombre: string; grupo: string; equipo: string; dificultad: string; tip: string;
  series: number; reps: string; descanso: number; propio: boolean;
};
export type Historial = { mejorKg: number; mejorE1rm: number; ultimoKg: number; sesiones: { fecha: string; series: string[] }[] };

type Tab = "semana" | "calendario" | "rutina" | "biblioteca";

export default function EntrenarClient({
  dias, biblioteca, historial, hoyIdx, hoy,
}: { dias: DiaRutina[]; biblioteca: EjercicioLib[]; historial: Record<string, Historial>; hoyIdx: number; hoy: string }) {
  const [tab, setTab] = useState<Tab>("semana");
  const [entrenando, setEntrenando] = useState<DiaRutina | null>(null);

  if (entrenando) {
    return <ModoEntrenamiento dia={entrenando} historial={historial} onExit={() => setEntrenando(null)} />;
  }

  return (
    <div className="space-y-4">
      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "semana", label: "Semana" },
          { id: "calendario", label: "Calendario" },
          { id: "rutina", label: "Rutina" },
          { id: "biblioteca", label: "Ejercicios" },
        ]}
      />
      {tab === "semana" && <Semana dias={dias} hoyIdx={hoyIdx} onStart={setEntrenando} />}
      {tab === "calendario" && <Calendario hoy={hoy} />}
      {tab === "rutina" && <EditorRutina dias={dias} biblioteca={biblioteca} />}
      {tab === "biblioteca" && <Biblioteca biblioteca={biblioteca} historial={historial} />}
    </div>
  );
}

// ───────────────────────────── Semana ─────────────────────────────

function Semana({ dias, hoyIdx, onStart }: { dias: DiaRutina[]; hoyIdx: number; onStart: (d: DiaRutina) => void }) {
  const [sel, setSel] = useState<number | null>(dias.some((d) => d.diaSemana === hoyIdx) ? hoyIdx : null);
  const diaSel = dias.find((d) => d.diaSemana === sel) ?? null;
  return (
    <div className="space-y-2">
      {DIAS_SEMANA.map((nombre, i) => {
        const d = dias.find((x) => x.diaSemana === i);
        return (
          <button key={nombre} onClick={() => d && setSel(i)}
            className={`w-full flex items-center justify-between rounded-xl p-3 bg-card border ${sel === i ? "border-accent" : "border-border"} ${!d ? "opacity-50" : ""}`}>
            <div className="text-left">
              <div className="text-[11px] uppercase font-semibold text-sub">{nombre}{i === hoyIdx ? " · hoy" : ""}</div>
              <div className="font-bold text-sm">{d ? d.nombre : "Descanso"}</div>
            </div>
            {d && <span className="text-xs text-sub flex items-center gap-1">{d.ejercicios.length} ej. <ChevronRight size={14} /></span>}
          </button>
        );
      })}
      {diaSel && (
        <div className="rounded-xl p-4 bg-card2 border border-border">
          <div className="font-bold mb-2">{DIAS_SEMANA[diaSel.diaSemana]}: {diaSel.nombre}</div>
          <div className="space-y-2 mb-3">
            {diaSel.ejercicios.map((e) => (
              <div key={e.exerciseId} className="text-sm flex justify-between">
                <span>{e.nombre}</span>
                <span className="text-sub">{e.series}×{e.reps}</span>
              </div>
            ))}
          </div>
          <button onClick={() => onStart(diaSel)} className="w-full py-2 rounded-lg text-white font-bold text-sm bg-accent flex items-center justify-center gap-2">
            <Play size={14} /> Iniciar modo entrenamiento
          </button>
        </div>
      )}
      {!dias.length && <div className="text-sm text-sub">Tu rutina no tiene días. Configúrala en la pestaña Rutina.</div>}
    </div>
  );
}

// ─────────────────────────── Calendario ───────────────────────────

type Sesion = { id: string; fecha: string; dia: string; duracionMin: number | null; notas: string | null; rpeSesion: number | null; sets: { ejercicio: string; kg: number; reps: number }[] };

function Calendario({ hoy }: { hoy: string }) {
  const [mes, setMes] = useState(hoy.slice(0, 7));
  const [sesiones, setSesiones] = useState<Sesion[] | null>(null);
  const [sel, setSel] = useState<string | null>(null);

  useEffect(() => {
    setSesiones(null);
    fetch(`/api/workouts?mes=${mes}`).then((r) => r.json()).then((d) => setSesiones(Array.isArray(d) ? d : [])).catch(() => setSesiones([]));
  }, [mes]);

  const [y, m] = mes.split("-").map(Number);
  const primero = new Date(Date.UTC(y, m - 1, 1));
  const offset = (primero.getUTCDay() + 6) % 7; // lunes = 0
  const diasMes = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const porDia = new Map<string, Sesion[]>();
  for (const s of sesiones ?? []) porDia.set(s.fecha, [...(porDia.get(s.fecha) ?? []), s]);
  const nombreMes = primero.toLocaleDateString("es-CO", { month: "long", year: "numeric", timeZone: "UTC" });
  const mover = (d: number) => {
    const f = new Date(Date.UTC(y, m - 1 + d, 1));
    setMes(f.toISOString().slice(0, 7));
    setSel(null);
  };
  const delSel = sel ? porDia.get(sel) ?? [] : [];

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4 bg-card border border-border">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => mover(-1)} className="p-1 rounded bg-card2" aria-label="Mes anterior"><ChevronLeft size={16} /></button>
          <div className="font-bold capitalize">{nombreMes}</div>
          <button onClick={() => mover(1)} className="p-1 rounded bg-card2" aria-label="Mes siguiente"><ChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-sub mb-1">
          {["L", "M", "X", "J", "V", "S", "D"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }).map((_, i) => <div key={"v" + i} />)}
          {Array.from({ length: diasMes }).map((_, i) => {
            const clave = `${mes}-${String(i + 1).padStart(2, "0")}`;
            const tiene = porDia.has(clave);
            return (
              <button key={clave} onClick={() => setSel(clave)}
                className={`aspect-square rounded-lg text-xs flex items-center justify-center font-semibold
                  ${tiene ? "bg-accent text-white" : "bg-card2 text-sub"}
                  ${clave === hoy ? "ring-2 ring-accent2" : ""} ${sel === clave ? "outline outline-2 outline-white" : ""}`}>
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="text-xs text-sub mt-3">
          {sesiones === null ? "Cargando…" : `${porDia.size} días entrenados este mes`}
        </div>
      </div>
      {sel && (
        <div className="space-y-2">
          {!delSel.length && <div className="text-sm text-sub">Sin entrenamiento el {sel}.</div>}
          {delSel.map((s) => {
            const porEj = new Map<string, string[]>();
            for (const st of s.sets) porEj.set(st.ejercicio, [...(porEj.get(st.ejercicio) ?? []), `${st.kg}×${st.reps}`]);
            return (
              <div key={s.id} className="rounded-xl p-3 bg-card border border-border">
                <div className="flex justify-between text-sm font-bold">
                  <span>{s.dia}</span>
                  <span className="text-sub text-xs">{[s.duracionMin && `${s.duracionMin} min`, s.rpeSesion && `RPE ${s.rpeSesion}`].filter(Boolean).join(" · ")}</span>
                </div>
                <div className="mt-2 space-y-1">
                  {Array.from(porEj).map(([ej, series]) => (
                    <div key={ej} className="text-xs"><span className="font-semibold">{ej}:</span> <span className="text-sub">{series.join(", ")}</span></div>
                  ))}
                </div>
                {s.notas && <div className="text-xs text-sub italic mt-2">{s.notas}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Editor de rutina ─────────────────────────

type DiaEdit = { diaSemana: number; nombre: string; ejercicios: EjercicioRutina[] };

function EditorRutina({ dias, biblioteca }: { dias: DiaRutina[]; biblioteca: EjercicioLib[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<DiaEdit[]>(() =>
    DIAS_SEMANA.map((_, i) => {
      const d = dias.find((x) => x.diaSemana === i);
      return { diaSemana: i, nombre: d?.nombre ?? "", ejercicios: d ? d.ejercicios.map((e) => ({ ...e })) : [] };
    })
  );
  const [abierto, setAbierto] = useState<number | null>(null);
  const [agregar, setAgregar] = useState("");
  const [estado, setEstado] = useState("");

  function actualizar(i: number, fn: (d: DiaEdit) => DiaEdit) {
    setEdit((prev) => prev.map((d, j) => (j === i ? fn(d) : d)));
    setEstado("");
  }
  function cambiarEj(i: number, k: number, cambio: Partial<EjercicioRutina>) {
    actualizar(i, (x) => ({ ...x, ejercicios: x.ejercicios.map((y, j) => (j === k ? { ...y, ...cambio } : y)) }));
  }
  function mover(i: number, k: number, delta: number) {
    actualizar(i, (x) => {
      const a = [...x.ejercicios];
      [a[k + delta], a[k]] = [a[k], a[k + delta]];
      return { ...x, ejercicios: a };
    });
  }

  async function guardar() {
    setEstado("Guardando…");
    const payload = edit.map((d) => ({
      ...d,
      nombre: d.nombre || Array.from(new Set(d.ejercicios.map((e) => e.grupo))).join(" + "),
    }));
    const res = await fetch("/api/rutinas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dias: payload }),
    }).catch(() => null);
    if (!res?.ok) return setEstado("No se pudo guardar.");
    setEstado("Rutina guardada ✓");
    router.refresh();
  }

  async function regenerar() {
    if (!confirm("¿Reemplazar tu rutina por la plantilla según tus días por semana?")) return;
    const res = await fetch("/api/rutinas", { method: "POST" }).catch(() => null);
    if (res?.ok) location.reload();
    else setEstado("No se pudo aplicar la plantilla.");
  }

  const grupos = Array.from(new Set(biblioteca.map((e) => e.grupo)));

  return (
    <div className="space-y-2">
      <div className="text-xs text-sub">Toca un día para editarlo. Un día sin ejercicios es descanso.</div>
      {edit.map((d, i) => (
        <div key={i} className="rounded-xl bg-card border border-border">
          <button onClick={() => setAbierto(abierto === i ? null : i)} className="w-full flex items-center justify-between p-3">
            <div className="text-left">
              <div className="text-[11px] uppercase font-semibold text-sub">{DIAS_SEMANA[i]}</div>
              <div className="font-bold text-sm">{d.ejercicios.length ? d.nombre || "Entrenamiento" : "Descanso"}</div>
            </div>
            <span className="text-xs text-sub">{d.ejercicios.length} ej.</span>
          </button>
          {abierto === i && (
            <div className="px-3 pb-3 space-y-2">
              <input value={d.nombre} onChange={(e) => actualizar(i, (x) => ({ ...x, nombre: e.target.value }))} placeholder="Nombre del día (ej. Pecho + Tríceps)"
                className="w-full px-3 py-2 rounded-lg bg-card2 border border-border text-sm" />
              {d.ejercicios.map((e, k) => (
                <div key={e.exerciseId + k} className="rounded-lg bg-card2 p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{e.nombre}</span>
                    <div className="flex gap-1">
                      <button disabled={k === 0} aria-label="Subir" className="p-1 disabled:opacity-30" onClick={() => mover(i, k, -1)}><ArrowUp size={14} /></button>
                      <button disabled={k === d.ejercicios.length - 1} aria-label="Bajar" className="p-1 disabled:opacity-30" onClick={() => mover(i, k, 1)}><ArrowDown size={14} /></button>
                      <button aria-label="Quitar" className="p-1 text-accent"
                        onClick={() => actualizar(i, (x) => ({ ...x, ejercicios: x.ejercicios.filter((_, j) => j !== k) }))}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] text-sub">
                    <label>Series<input type="number" inputMode="numeric" min={1} max={10} value={e.series} onChange={(ev) => cambiarEj(i, k, { series: +ev.target.value })}
                      className="w-full mt-0.5 px-2 py-1 rounded bg-bg border border-border text-sm text-white" /></label>
                    <label>Reps<input value={e.reps} onChange={(ev) => cambiarEj(i, k, { reps: ev.target.value })}
                      className="w-full mt-0.5 px-2 py-1 rounded bg-bg border border-border text-sm text-white" /></label>
                    <label>Descanso (s)<input type="number" inputMode="numeric" min={0} value={e.descansoSeg} onChange={(ev) => cambiarEj(i, k, { descansoSeg: +ev.target.value })}
                      className="w-full mt-0.5 px-2 py-1 rounded bg-bg border border-border text-sm text-white" /></label>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <select value={agregar} onChange={(e) => setAgregar(e.target.value)} className="flex-1 px-2 py-2 rounded-lg bg-card2 border border-border text-sm">
                  <option value="">Agregar ejercicio…</option>
                  {grupos.map((g) => (
                    <optgroup key={g} label={g}>
                      {biblioteca.filter((e) => e.grupo === g).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </optgroup>
                  ))}
                </select>
                <button disabled={!agregar} aria-label="Agregar" className="px-3 rounded-lg bg-accent2 disabled:opacity-40"
                  onClick={() => {
                    const e = biblioteca.find((x) => x.id === agregar);
                    if (!e) return;
                    actualizar(i, (x) => ({
                      ...x,
                      ejercicios: [...x.ejercicios, { exerciseId: e.id, nombre: e.nombre, grupo: e.grupo, tip: e.tip, series: e.series, reps: e.reps, descansoSeg: e.descanso }],
                    }));
                    setAgregar("");
                  }}><Plus size={16} /></button>
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={guardar} className="w-full py-3 rounded-xl font-bold bg-accent text-white">Guardar rutina</button>
      <button onClick={regenerar} className="w-full py-2 rounded-xl text-sm bg-card2 border border-border text-sub">Usar plantilla según mis días por semana</button>
      {estado && <div className="text-sm text-center text-sub">{estado}</div>}
    </div>
  );
}

// ─────────────────────────── Biblioteca ───────────────────────────

type NuevoEjercicio = { nombre: string; grupo: string; equipo: string; reps: string; tip: string };

function Biblioteca({ biblioteca, historial }: { biblioteca: EjercicioLib[]; historial: Record<string, Historial> }) {
  const router = useRouter();
  const [grupo, setGrupo] = useState("Todos");
  const [q, setQ] = useState("");
  const [nuevo, setNuevo] = useState<NuevoEjercicio | null>(null);
  const [error, setError] = useState("");
  const grupos = ["Todos", ...Array.from(new Set(biblioteca.map((e) => e.grupo)))];
  const lista = biblioteca.filter((e) => (grupo === "Todos" || e.grupo === grupo) && e.nombre.toLowerCase().includes(q.toLowerCase()));

  async function crear() {
    if (!nuevo) return;
    setError("");
    const res = await fetch("/api/ejercicios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nuevo) }).catch(() => null);
    if (!res?.ok) return setError((await res?.json().catch(() => null))?.error || "No se pudo crear.");
    setNuevo(null);
    router.refresh();
  }

  async function borrar(id: string) {
    if (!confirm("¿Borrar este ejercicio?")) return;
    const res = await fetch(`/api/ejercicios?id=${id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) return alert((await res?.json().catch(() => null))?.error || "No se pudo borrar.");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar ejercicio…" className="w-full px-3 py-2 rounded-lg bg-card2 border border-border text-sm" />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {grupos.map((g) => (
          <button key={g} onClick={() => setGrupo(g)}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap border border-border ${grupo === g ? "bg-accent text-white" : "bg-card2 text-sub"}`}>{g}</button>
        ))}
      </div>
      <div className="space-y-2">
        {lista.map((e) => {
          const h = historial[e.nombre];
          return (
            <details key={e.id} className="rounded-lg p-3 bg-card border border-border">
              <summary className="flex items-center justify-between cursor-pointer gap-2">
                <span className="font-semibold text-sm">{e.nombre}</span>
                <span className="flex items-center gap-1">
                  {h && <Trophy size={12} className="text-accent" />}
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent2 whitespace-nowrap">{e.grupo}</span>
                </span>
              </summary>
              <div className="text-xs mt-2 text-sub space-y-1">
                <div>{e.series} series × {e.reps} · descanso {e.descanso}s · {e.equipo} · {e.dificultad}</div>
                {e.tip && <div>{e.tip}</div>}
                {h ? (
                  <div className="mt-2 rounded bg-card2 p-2 text-white">
                    <div className="font-semibold">Récord: {h.mejorKg} kg · 1RM estimado: {h.mejorE1rm} kg</div>
                    {h.sesiones.map((s) => <div key={s.fecha} className="text-sub">{s.fecha}: {s.series.join(", ")}</div>)}
                  </div>
                ) : <div className="italic">Aún no lo has registrado.</div>}
                {e.propio && <button onClick={() => borrar(e.id)} className="text-accent underline">Borrar ejercicio propio</button>}
              </div>
            </details>
          );
        })}
      </div>
      {nuevo ? (
        <div className="rounded-xl p-3 bg-card2 border border-border space-y-2">
          <div className="font-bold text-sm">Nuevo ejercicio</div>
          <input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Nombre" className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm" />
          <select value={nuevo.grupo} onChange={(e) => setNuevo({ ...nuevo, grupo: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm">
            {grupos.slice(1).map((g) => <option key={g}>{g}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input value={nuevo.equipo} onChange={(e) => setNuevo({ ...nuevo, equipo: e.target.value })} placeholder="Equipo" className="px-3 py-2 rounded-lg bg-bg border border-border text-sm" />
            <input value={nuevo.reps} onChange={(e) => setNuevo({ ...nuevo, reps: e.target.value })} placeholder="Reps (8-12)" className="px-3 py-2 rounded-lg bg-bg border border-border text-sm" />
          </div>
          <input value={nuevo.tip} onChange={(e) => setNuevo({ ...nuevo, tip: e.target.value })} placeholder="Consejo técnico (opcional)" className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm" />
          {error && <div className="text-xs text-accent">{error}</div>}
          <div className="flex gap-2">
            <button onClick={() => setNuevo(null)} className="flex-1 py-2 rounded-lg bg-bg border border-border text-sm">Cancelar</button>
            <button onClick={crear} className="flex-1 py-2 rounded-lg bg-accent text-white font-bold text-sm">Crear</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setNuevo({ nombre: "", grupo: grupos[1] ?? "Pecho", equipo: "", reps: "8-12", tip: "" })}
          className="w-full py-2 rounded-xl text-sm bg-card2 border border-border flex items-center justify-center gap-2"><Plus size={14} /> Crear ejercicio propio</button>
      )}
    </div>
  );
}

// ───────────────────────── Modo entrenamiento ─────────────────────────

function ModoEntrenamiento({ dia, historial, onExit }: { dia: DiaRutina; historial: Record<string, Historial>; onExit: () => void }) {
  const ejercicios = dia.ejercicios;
  const [idx, setIdx] = useState(0);
  const [registro, setRegistro] = useState(ejercicios.map((e) => ({ nombre: e.nombre, exerciseId: e.exerciseId, sets: [] as { kg: number; reps: number }[] })));
  const ultimoKg = (nombre: string) => (historial[nombre]?.ultimoKg ? String(historial[nombre].ultimoKg) : "");
  const [kg, setKg] = useState(ejercicios[0] ? ultimoKg(ejercicios[0].nombre) : "");
  const [reps, setReps] = useState("");
  const [descansando, setDescansando] = useState(0);
  const [cerrando, setCerrando] = useState(false);
  const [rpe, setRpe] = useState(7);
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const inicio = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const ej = ejercicios[idx];

  const enDescanso = descansando > 0;
  useEffect(() => {
    if (!enDescanso) return;
    timerRef.current = setInterval(() => {
      setDescansando((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [enDescanso]);

  function irA(i: number) {
    setIdx(i);
    setDescansando(0);
    const enSesion = registro[i].sets[registro[i].sets.length - 1]?.kg;
    setKg(enSesion != null ? String(enSesion) : ultimoKg(ejercicios[i].nombre));
    setReps("");
  }

  function completarSerie() {
    if (!kg || !reps || !(+kg >= 0) || !(+reps > 0)) return;
    const nuevo = [...registro];
    nuevo[idx] = { ...nuevo[idx], sets: [...nuevo[idx].sets, { kg: +kg, reps: Math.round(+reps) }] };
    setRegistro(nuevo);
    setReps("");
    setDescansando(ej.descansoSeg);
  }

  function quitarSerie(i: number) {
    const nuevo = [...registro];
    nuevo[idx] = { ...nuevo[idx], sets: nuevo[idx].sets.filter((_, j) => j !== i) };
    setRegistro(nuevo);
  }

  const minutos = () => Math.max(1, Math.round((Date.now() - inicio.current) / 60000));

  async function guardar() {
    if (guardando) return;
    setGuardando(true);
    setError("");
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dia: dia.nombre, routineDayId: dia.id, ejercicios: registro, duracionMin: minutos(), rpeSesion: rpe, notas }),
    }).catch(() => null);
    setGuardando(false);
    if (!res || !res.ok) {
      const data = await res?.json().catch(() => ({}));
      setError(data?.error || "No se pudo guardar el entrenamiento. Revisa tu conexión.");
      return;
    }
    router.refresh();
    onExit();
  }

  const totalSeries = registro.reduce((a, r) => a + r.sets.length, 0);

  if (!ej) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-sub">Este día no tiene ejercicios.</div>
        <button onClick={onExit} className="text-sm underline text-sub">Volver</button>
      </div>
    );
  }

  if (cerrando) {
    return (
      <div className="space-y-4">
        <button onClick={() => setCerrando(false)} className="flex items-center gap-1 text-sm text-sub"><ArrowLeft size={16} /> Volver</button>
        <div className="rounded-2xl p-5 bg-card border border-border space-y-4">
          <div className="text-xl font-black uppercase">Terminar sesión</div>
          <div className="text-sm text-sub">{totalSeries} series · {minutos()} min</div>
          <label className="block text-sm">
            ¿Qué tan duro fue? (RPE {rpe}/10)
            <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(+e.target.value)} className="w-full mt-1" />
          </label>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas (opcional): cómo te sentiste, molestias…"
            className="w-full px-3 py-2 rounded-lg bg-card2 border border-border text-sm" rows={3} />
          <button onClick={guardar} disabled={guardando || !totalSeries} className="w-full py-3 rounded-xl font-bold bg-accent text-white disabled:opacity-50">
            {guardando ? "Guardando…" : "Guardar entrenamiento"}
          </button>
          {!totalSeries && <div className="text-xs text-sub text-center">Registra al menos una serie para guardar.</div>}
          {error && <div className="text-sm text-accent text-center">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => (totalSeries ? confirm("¿Salir sin guardar las series registradas?") && onExit() : onExit())} className="flex items-center gap-1 text-sm text-sub"><ArrowLeft size={16} /> Salir</button>
        <div className="text-xs text-sub">{idx + 1} / {ejercicios.length}</div>
      </div>

      <div className="rounded-2xl p-5 bg-card border border-border text-center">
        <div className="text-xl font-black uppercase">{ej.nombre}</div>
        <div className="text-sm mt-1 text-sub">{ej.series} series objetivo × {ej.reps} reps</div>
        {historial[ej.nombre] && <div className="text-xs mt-1 text-accent2">Récord: {historial[ej.nombre].mejorKg} kg · última vez {historial[ej.nombre].ultimoKg} kg</div>}
        {ej.tip && <div className="text-xs mt-2 text-sub italic">{ej.tip}</div>}

        {descansando > 0 ? (
          <div className="mt-5">
            <div className="text-4xl font-black tabular-nums text-accent">{descansando}s</div>
            <div className="text-xs text-sub">Descanso, siguiente serie</div>
            <button onClick={() => setDescansando(0)} className="mt-2 text-xs underline text-sub">Saltar descanso</button>
          </div>
        ) : (
          <div className="mt-5 flex gap-2 justify-center">
            <input type="number" inputMode="decimal" min={0} step="0.5" placeholder="kg" value={kg} onChange={(e) => setKg(e.target.value)} className="w-20 text-center px-3 py-2 rounded-lg bg-card2 border border-border" />
            <input type="number" inputMode="numeric" min={1} placeholder="reps" value={reps} onChange={(e) => setReps(e.target.value)} onKeyDown={(e) => e.key === "Enter" && completarSerie()} className="w-20 text-center px-3 py-2 rounded-lg bg-card2 border border-border" />
            <button onClick={completarSerie} aria-label="Registrar serie" className="px-4 rounded-lg text-white font-bold flex items-center gap-1 bg-accent"><Check size={16} /></button>
          </div>
        )}

        <div className="mt-4 space-y-1">
          {registro[idx].sets.map((s, i) => (
            <div key={i} className="text-sm text-sub flex items-center justify-center gap-2">
              Serie {i + 1}: {s.kg} kg × {s.reps}
              <button onClick={() => quitarSerie(i)} aria-label="Quitar serie" className="text-accent"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button disabled={idx === 0} onClick={() => irA(idx - 1)} className="flex-1 py-2 rounded-lg bg-card2 border border-border disabled:opacity-30">Anterior</button>
        {idx < ejercicios.length - 1 ? (
          <button onClick={() => irA(idx + 1)} className="flex-1 py-2 rounded-lg text-white font-bold bg-accent2">Siguiente ejercicio</button>
        ) : (
          <button onClick={() => setCerrando(true)} className="flex-1 py-2 rounded-lg text-white font-bold bg-accent">Terminar</button>
        )}
      </div>
    </div>
  );
}

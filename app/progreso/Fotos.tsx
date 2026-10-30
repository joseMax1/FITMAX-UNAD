"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";

type Foto = { id: string; fecha: string; nota: string | null };

// Reduce la foto en el navegador (lado mayor 1080 px, JPEG) antes de subirla: menos datos y
// se descartan los metadatos EXIF, que pueden incluir la ubicación.
function reducir(archivo: File): Promise<string> {
  return new Promise((ok, falla) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, 1080 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * escala);
      c.height = Math.round(img.height * escala);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      ok(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); falla(new Error("No se pudo leer la imagen")); };
    img.src = url;
  });
}

export default function Fotos() {
  const [fotos, setFotos] = useState<Foto[] | null>(null);
  const [nota, setNota] = useState("");
  const [estado, setEstado] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const cargar = () => fetch("/api/fotos").then((r) => r.json()).then((d) => setFotos(Array.isArray(d) ? d : [])).catch(() => setFotos([]));
  useEffect(() => { cargar(); }, []);

  async function subir(archivo: File | undefined) {
    if (!archivo) return;
    setEstado("Subiendo…");
    try {
      const imagen = await reducir(archivo);
      const res = await fetch("/api/fotos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imagen, nota }) });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || "No se pudo subir la foto.");
      setNota("");
      setEstado("Foto guardada ✓");
      cargar();
    } catch (e) {
      setEstado((e as Error).message);
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  async function borrar(id: string) {
    if (!confirm("¿Borrar esta foto?")) return;
    await fetch(`/api/fotos?id=${id}`, { method: "DELETE" }).catch(() => null);
    cargar();
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4 bg-card border border-border space-y-3">
        <div className="font-bold text-sm">Foto de progreso de hoy</div>
        <input value={nota} onChange={(e) => setNota(e.target.value)} maxLength={200} placeholder="Nota (opcional)"
          className="w-full px-3 py-2 rounded-lg bg-card2 border border-border text-sm" />
        <label className="w-full py-2 rounded-lg bg-accent text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer">
          <Camera size={16} /> Tomar o elegir foto
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Elegir foto de progreso"
            onChange={(e) => subir(e.target.files?.[0])} />
        </label>
        {estado && <div className="text-xs text-center text-sub">{estado}</div>}
        <div className="text-[11px] text-sub">Solo tú puedes ver tus fotos. No se comparten ni se envían al asistente.</div>
      </div>
      {fotos === null && <div className="text-sm text-sub">Cargando…</div>}
      {fotos?.length === 0 && <div className="text-sm text-sub">Aún no tienes fotos de progreso.</div>}
      <div className="grid grid-cols-2 gap-2">
        {fotos?.map((f) => (
          <figure key={f.id} className="rounded-lg overflow-hidden bg-card border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/fotos/${f.id}`} alt={`Foto de progreso del ${f.fecha}`} className="w-full aspect-[3/4] object-cover" />
            <figcaption className="p-2 text-[11px] flex items-start justify-between gap-1">
              <span><b>{f.fecha}</b>{f.nota ? ` · ${f.nota}` : ""}</span>
              <button onClick={() => borrar(f.id)} aria-label="Borrar foto" className="text-accent p-0.5"><Trash2 size={12} /></button>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

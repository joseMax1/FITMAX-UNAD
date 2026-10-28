/** Barra de progreso horizontal con etiqueta. */
export default function Barra({ label, valor, meta, unidad = "g", color = "bg-accent" }: { label: string; valor: number; meta: number; unidad?: string; color?: string }) {
  const pct = meta > 0 ? Math.min(100, (valor / meta) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold">{label}</span>
        <span className={valor > meta * 1.1 ? "text-accent" : "text-sub"}>{Math.round(valor)} / {Math.round(meta)} {unidad}</span>
      </div>
      <div className="h-2 rounded-full bg-card2 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

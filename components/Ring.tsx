/** Anillo de progreso (valor / meta). */
export default function Ring({
  valor, meta, label, unidad = "", color = "#FF6B4A", size = 76,
}: { valor: number; meta: number; label: string; unidad?: string; color?: string; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const pct = meta > 0 ? Math.min(1, valor / meta) : 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="#2B2E36" strokeWidth={7} fill="none" />
          <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="text-sm font-black tabular-nums">{Math.round(valor * 10) / 10}</span>
          <span className="text-[9px] text-sub mt-0.5">/ {Math.round(meta * 10) / 10}{unidad}</span>
        </div>
      </div>
      <span className="text-[10px] uppercase font-semibold text-sub text-center">{label}</span>
    </div>
  );
}

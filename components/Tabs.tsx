"use client";

export default function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="flex gap-1 p-1 rounded-xl bg-card border border-border overflow-x-auto">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={`flex-1 whitespace-nowrap text-xs font-bold px-3 py-2 rounded-lg ${value === t.id ? "bg-accent text-white" : "text-sub"}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

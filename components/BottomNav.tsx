"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, Utensils, TrendingUp, HeartPulse } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/entrenar", label: "Entrenar", icon: Dumbbell },
  { href: "/nutricion", label: "Nutrición", icon: Utensils },
  { href: "/progreso", label: "Progreso", icon: TrendingUp },
  { href: "/bienestar", label: "Bienestar", icon: HeartPulse },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto flex justify-around items-center py-2 border-t border-border bg-bg z-20">
      {ITEMS.map((it) => {
        const Icon = it.icon;
        const active = pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link key={it.href} href={it.href} className="flex flex-col items-center gap-1 px-2 py-1">
            <Icon size={20} className={active ? "text-accent" : "text-sub"} />
            <span className={`text-[10px] font-semibold ${active ? "text-accent" : "text-sub"}`}>{it.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

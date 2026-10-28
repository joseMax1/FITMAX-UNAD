"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

/** Botón flotante para abrir el chat con Claude desde cualquier pantalla. */
export default function ClaudeFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/ia")) return null;
  return (
    <Link href="/ia" aria-label="Hablar con Claude"
      className="fixed z-30 bottom-20 right-4 md:right-[calc(50%-14rem+1rem)] w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-black/40">
      <Sparkles size={22} className="text-white" />
    </Link>
  );
}

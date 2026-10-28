"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default function TopBar({ nombre, objetivo }: { nombre: string; objetivo: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 z-10 bg-bg">
      <Link href="/perfil" className="flex items-center gap-2" aria-label="Mi perfil y metas">
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm bg-accent">
          {nombre.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="text-sm font-bold leading-none">{nombre}</div>
          <div className="text-[11px] text-sub">{objetivo}</div>
        </div>
      </Link>
      <button aria-label="Cerrar sesión" onClick={() => signOut({ callbackUrl: "/login" })} className="p-2 rounded-lg bg-card2">
        <LogOut size={16} />
      </button>
    </div>
  );
}

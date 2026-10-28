"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "", password: "", nombre: "", sexo: "H", objetivo: "Hipertrofia",
    edad: 25, peso: 70, altura: 170, nivel: "Intermedio", diasSemana: 4,
  });
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo crear la cuenta");
      return;
    }
    const signInRes = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    if (signInRes?.error) setError("Cuenta creada, pero no se pudo iniciar sesión");
    else router.push("/dashboard");
  }

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm({ ...form, [k]: v });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-bg text-white">
      <div className="w-full max-w-sm">
        <div className="text-3xl font-black uppercase tracking-tighter text-accent text-center mb-6">Crear cuenta</div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full px-3 py-2 rounded-lg bg-card2 border border-border" placeholder="Nombre" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} required />
          <input className="w-full px-3 py-2 rounded-lg bg-card2 border border-border" type="email" placeholder="Correo" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          <input className="w-full px-3 py-2 rounded-lg bg-card2 border border-border" type="password" placeholder="Contraseña" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={6} />
          <div className="flex gap-2">
            {["H", "M"].map((s) => (
              <button type="button" key={s} onClick={() => set("sexo", s)}
                className={`flex-1 py-2 rounded-lg border border-border ${form.sexo === s ? "bg-accent" : "bg-card2"}`}>
                {s === "H" ? "Hombre" : "Mujer"}
              </button>
            ))}
          </div>
          <select className="w-full px-3 py-2 rounded-lg bg-card2 border border-border" value={form.objetivo} onChange={(e) => set("objetivo", e.target.value)}>
            {["Hipertrofia", "Recomposición corporal", "Pérdida de grasa / Definición", "Fuerza", "Mantenimiento"].map((o) => <option key={o}>{o}</option>)}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <input className="px-3 py-2 rounded-lg bg-card2 border border-border" type="number" placeholder="Edad" value={form.edad} onChange={(e) => set("edad", +e.target.value)} />
            <input className="px-3 py-2 rounded-lg bg-card2 border border-border" type="number" placeholder="Peso kg" value={form.peso} onChange={(e) => set("peso", +e.target.value)} />
            <input className="px-3 py-2 rounded-lg bg-card2 border border-border" type="number" placeholder="Altura cm" value={form.altura} onChange={(e) => set("altura", +e.target.value)} />
          </div>
          <label className="block text-sm text-sub">Días de entrenamiento/semana: {form.diasSemana}</label>
          <input type="range" min={2} max={6} value={form.diasSemana} onChange={(e) => set("diasSemana", +e.target.value)} className="w-full" />
          {error && <div className="text-sm text-accent">{error}</div>}
          <button className="w-full py-3 rounded-xl font-bold bg-accent" type="submit">Crear cuenta</button>
        </form>
        <div className="text-center text-sm text-sub mt-4">
          ¿Ya tienes cuenta? <Link href="/login" className="text-accent2 underline">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Correo o contraseña incorrectos");
    else router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg text-white">
      <div className="w-full max-w-sm">
        <div className="text-4xl font-black uppercase tracking-tighter text-accent text-center mb-8">FITMAX</div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full px-3 py-2 rounded-lg bg-card2 border border-border" type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full px-3 py-2 rounded-lg bg-card2 border border-border" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="text-sm text-accent">{error}</div>}
          <button className="w-full py-3 rounded-xl font-bold bg-accent" type="submit">Entrar</button>
        </form>
        <div className="text-center text-sm text-sub mt-4">
          ¿No tienes cuenta? <Link href="/register" className="text-accent2 underline">Regístrate</Link>
        </div>
      </div>
    </div>
  );
}

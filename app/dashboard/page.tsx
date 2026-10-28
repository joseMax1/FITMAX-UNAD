import Link from "next/link";
import { Play, Flame, Scale, Award, ChevronRight, Sparkles, CheckCircle2, HeartPulse } from "lucide-react";
import AppShell from "@/components/AppShell";
import Ring from "@/components/Ring";
import { usuarioActual } from "@/lib/session";
import { rutinaActiva, diaDeRutina } from "@/lib/rutina";
import { resumenHoy, recuperacion } from "@/lib/resumen";
import { claveDia, claveDiaAnterior } from "@/lib/fecha";

const FRASES = [
  "No necesitas sentirte motivado todos los días. Necesitas mantener la disciplina.",
  "Tu progreso no se mide por un solo entrenamiento.",
  "Nadie puede entrenar por ti. La siguiente repetición es tuya.",
  "La constancia le gana a la intensidad ocasional.",
  "Hoy solo tienes que presentarte. El resto ya lo sabes hacer.",
];

const NIVELES = ["Principiante", "Disciplinado", "Constante", "Fuerte", "Imparable"];

export default async function DashboardPage() {
  const user = await usuarioActual();
  const [rutina, r] = await Promise.all([rutinaActiva(user.id, user.diasSemana), resumenHoy(user)]);
  const hoy = diaDeRutina(rutina);
  const rec = recuperacion(r.bienestar);
  const frase = FRASES[Number(r.fecha.slice(8, 10)) % FRASES.length];
  const diasPlan = rutina.dias.filter((d) => d.ejercicios.length).length || user.diasSemana;

  // La racha guardada solo cuenta si el último entrenamiento fue hoy o ayer.
  const ultimo = user.lastTrainDate ? claveDia(user.lastTrainDate) : null;
  const racha = ultimo === r.fecha || ultimo === claveDiaAnterior(r.fecha) ? user.streak : 0;
  const nivelIdx = Math.min(NIVELES.length - 1, Math.floor(user.xp / 100));
  const xpNivel = nivelIdx === NIVELES.length - 1 ? 100 : user.xp % 100;

  return (
    <AppShell user={user}>
      <div className="rounded-2xl p-5 bg-card border border-border">
        <div className="text-xs uppercase tracking-wide font-semibold text-sub">Hoy · {hoy.nombre}</div>
        {r.entrenoHoy ? (
          <div className="text-xl font-black mt-1 flex items-center gap-2"><CheckCircle2 size={20} className="text-green-500" /> ENTRENAMIENTO HECHO</div>
        ) : hoy.dia ? (
          <>
            <div className="text-xl font-black mt-1">{hoy.dia.nombre.toUpperCase()}</div>
            <div className="text-xs text-sub mt-1">{hoy.dia.ejercicios.length} ejercicios</div>
            <Link href="/entrenar" className="mt-3 inline-flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-bold bg-accent">
              <Play size={14} /> Empezar a entrenar
            </Link>
          </>
        ) : (
          <div className="text-xl font-black mt-1">DESCANSO</div>
        )}
      </div>

      <div className="rounded-2xl p-4 bg-card border border-border">
        <div className="text-xs uppercase tracking-wide font-semibold text-sub mb-3">Tus metas de hoy</div>
        <div className="grid grid-cols-4 gap-1">
          <Ring valor={r.entrenosSemana} meta={diasPlan} label="Semana" size={70} color="#FF6B4A" />
          <Ring valor={r.comida.kcal} meta={r.metas.kcal} label="Kcal" size={70} color="#F59E0B" />
          <Ring valor={r.comida.proteina} meta={r.metas.proteina} label="Proteína" unidad="g" size={70} color="#22C55E" />
          <Ring valor={Math.round(r.aguaMl / 100) / 10} meta={r.metas.aguaMl / 1000} label="Agua" unidad="L" size={70} color="#4F9DDE" />
        </div>
        <div className="flex gap-2 mt-3 text-xs">
          <Link href="/nutricion" className="flex-1 text-center py-1.5 rounded-lg bg-card2">+ Comida</Link>
          <Link href="/bienestar" className="flex-1 text-center py-1.5 rounded-lg bg-card2">+ Agua</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 bg-card border border-border">
          <div className="flex items-center gap-1 text-[11px] uppercase font-semibold text-sub"><Flame size={16} />Racha</div>
          <div className="text-lg font-black mt-1">{racha} {racha === 1 ? "día" : "días"}</div>
        </div>
        <Link href="/progreso" className="rounded-xl p-3 bg-card border border-border">
          <div className="flex items-center gap-1 text-[11px] uppercase font-semibold text-sub"><Scale size={16} />Peso</div>
          <div className="text-lg font-black mt-1">{r.peso} kg</div>
          {user.pesoObjetivo && (
            <div className="text-[11px] text-sub">
              {Math.abs(r.peso - user.pesoObjetivo) < 0.1 ? "¡En tu objetivo!" : `${Math.round(Math.abs(r.peso - user.pesoObjetivo) * 10) / 10} kg para ${user.pesoObjetivo} kg`}
            </div>
          )}
        </Link>
        <div className="rounded-xl p-3 bg-card border border-border">
          <div className="flex items-center gap-1 text-[11px] uppercase font-semibold text-sub"><Award size={16} />Nivel</div>
          <div className="text-lg font-black mt-1">{NIVELES[nivelIdx]}</div>
          <div className="h-1.5 rounded-full bg-card2 mt-1 overflow-hidden"><div className="h-full bg-accent" style={{ width: `${xpNivel}%` }} /></div>
          <div className="text-[10px] text-sub mt-0.5">{user.xp} XP</div>
        </div>
        <Link href="/bienestar" className="rounded-xl p-3 bg-card border border-border">
          <div className="flex items-center gap-1 text-[11px] uppercase font-semibold text-sub"><HeartPulse size={16} />Recuperación</div>
          {rec ? (
            <>
              <div className="text-lg font-black mt-1">{rec.puntaje} / 5</div>
              <div className="text-[10px] text-sub">{r.bienestar?.horasSueno != null ? `${r.bienestar.horasSueno} h de sueño` : ""}</div>
            </>
          ) : (
            <div className="text-sm font-bold mt-1 text-accent2">Hacer check-in →</div>
          )}
        </Link>
      </div>

      {rec && <div className="rounded-2xl p-3 bg-card2 border border-border text-sm">{rec.sugerencia}</div>}

      <div className="rounded-2xl p-4 bg-card2 border border-border">
        <div className="text-xs uppercase tracking-wide font-semibold mb-1 text-sub">Mentalidad</div>
        <div className="text-sm italic">"{frase}"</div>
      </div>

      <Link href="/ia" className="w-full flex items-center justify-between rounded-2xl p-4 bg-card border border-border">
        <div className="flex items-center gap-2 font-bold"><Sparkles size={18} className="text-accent2" /> Hablar con mi Claude</div>
        <ChevronRight size={16} className="text-sub" />
      </Link>
    </AppShell>
  );
}

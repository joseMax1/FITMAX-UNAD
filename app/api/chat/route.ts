import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { userIdApi } from "@/lib/session";
import { CLAUDE_MODEL, getClaude, normalizarHistorial, MensajeChat } from "@/lib/claude";
import { rutinaActiva, diaDeRutina } from "@/lib/rutina";
import { resumenHoy, recuperacion } from "@/lib/resumen";
import { claveDia } from "@/lib/fecha";

// Separador entre el texto de Claude y un aviso de error al final del stream.
const MARCA_ERROR = "\u0000";

export async function GET() {
  const userId = await userIdApi();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const messages = await prisma.chatMessage.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(messages);
}

export async function DELETE() {
  const userId = await userIdApi();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  await prisma.chatMessage.deleteMany({ where: { userId } });
  return NextResponse.json({ ok: true });
}

async function contextoUsuario(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const [rutina, r, ultimoEntreno] = await Promise.all([
    rutinaActiva(user.id, user.diasSemana),
    resumenHoy(user),
    prisma.workoutLog.findFirst({ where: { userId }, orderBy: { date: "desc" } }),
  ]);
  const hoy = diaDeRutina(rutina);
  const rec = recuperacion(r.bienestar);
  const b = r.bienestar;
  const semana = rutina.dias.map((d) => `${["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][d.diaSemana]}: ${d.nombre}`).join("; ");

  return `Eres Claude, el asistente de entrenamiento, nutrición y bienestar dentro de la app FITMAX. Hablas en español, con tono cercano y directo, basado en evidencia. No inventas estudios ni recomiendas sustancias dopantes. No reemplazas a un médico, nutricionista ni fisioterapeuta: ante dolor, lesiones o síntomas preocupantes, recomienda evaluación profesional.
Responde breve y concreto. Usa texto plano; para listas usa guiones simples.

Datos del usuario (fecha de hoy ${r.fecha}):
- Nombre: ${user.nombre} · sexo ${user.sexo} · ${user.edad} años · ${r.peso} kg${user.pesoObjetivo ? ` (objetivo ${user.pesoObjetivo} kg)` : ""} · ${user.altura} cm
- Objetivo: ${user.objetivo} · nivel ${user.nivel}
- Rutina semanal: ${semana || "sin días configurados"}
- Hoy (${hoy.nombre}): ${r.entrenoHoy ? "ya entrenó" : hoy.dia ? `toca ${hoy.dia.nombre} (${hoy.dia.ejercicios.map((e) => `${e.exercise.nombre} ${e.series}x${e.reps}`).join(", ")})` : "descanso"}
- Esta semana: ${r.entrenosSemana} días entrenados · racha ${user.streak} · último entrenamiento: ${ultimoEntreno ? `${claveDia(ultimoEntreno.date)} (${ultimoEntreno.dia})` : "ninguno aún"}
- Comida de hoy: ${r.comida.kcal}/${r.metas.kcal} kcal · proteína ${r.comida.proteina}/${r.metas.proteina} g · carbos ${r.comida.carbos}/${r.metas.carbos} g · grasa ${r.comida.grasa}/${r.metas.grasa} g
- Agua de hoy: ${r.aguaMl}/${r.metas.aguaMl} ml
- Check-in de hoy: ${b ? `sueño ${b.horasSueno ?? "?"} h (calidad ${b.calidadSueno ?? "?"}/5), energía ${b.energia ?? "?"}/5, estrés ${b.estres ?? "?"}/5, dolor muscular ${b.dolorMuscular ?? "?"}/5${rec ? `, recuperación ${rec.puntaje}/5` : ""}` : "no lo ha hecho"}`;
}

export async function POST(req: Request) {
  const userId = await userIdApi();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const { message } = await req.json().catch(() => ({}));
  const texto = typeof message === "string" ? message.trim() : "";
  if (!texto) return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 });
  if (texto.length > 4000) return NextResponse.json({ error: "El mensaje es demasiado largo" }, { status: 400 });

  const claude = getClaude();
  if (!claude) {
    return NextResponse.json(
      { error: "Claude no está configurado: agrega ANTHROPIC_API_KEY en el archivo .env y reinicia la app." },
      { status: 503 }
    );
  }

  const system = await contextoUsuario(userId);
  if (!system) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  // Últimos 30 mensajes guardados + la pregunta nueva.
  const recientes = await prisma.chatMessage.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 30 });
  const historial = normalizarHistorial([
    ...recientes.reverse().map((m) => ({ role: m.role as MensajeChat["role"], content: m.content })),
    { role: "user", content: texto },
  ]);

  let eventos;
  try {
    eventos = await claude.beta.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      system,
      messages: historial,
      output_config: { effort: "low" },
      // Si los filtros de seguridad rechazan la petición, la API la reintenta con el modelo recomendado.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      stream: true,
    });
  } catch (e) {
    console.error("Error llamando a Claude:", e);
    if (e instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "La ANTHROPIC_API_KEY no es válida. Revisa el archivo .env." }, { status: 502 });
    }
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Claude está recibiendo demasiadas peticiones. Espera un momento." }, { status: 429 });
    }
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `Claude respondió con un error (${e.status ?? "sin código"}). Intenta de nuevo.` }, { status: 502 });
    }
    return NextResponse.json({ error: "No pude conectarme con Claude. Revisa tu conexión a internet." }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let respuesta = "";
      let stopReason: string | null = null;
      let modelo: string = CLAUDE_MODEL;
      let inputTokens: number | null = null;
      let outputTokens: number | null = null;
      try {
        for await (const ev of eventos) {
          if (ev.type === "message_start") {
            modelo = ev.message.model;
            inputTokens = ev.message.usage.input_tokens;
          } else if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            respuesta += ev.delta.text;
            controller.enqueue(encoder.encode(ev.delta.text));
          } else if (ev.type === "message_delta") {
            stopReason = ev.delta.stop_reason;
            outputTokens = ev.usage.output_tokens;
          }
        }
        respuesta = respuesta.trim();
        if (stopReason === "refusal") {
          controller.enqueue(encoder.encode(MARCA_ERROR + "Claude no puede responder esa pregunta. Intenta reformularla."));
        } else if (!respuesta) {
          controller.enqueue(encoder.encode(MARCA_ERROR + "Claude no devolvió texto. Intenta de nuevo."));
        } else {
          // Pregunta y respuesta se guardan juntas solo cuando Claude respondió completo.
          // Marcas de tiempo explícitas para que la pregunta quede siempre antes que la respuesta.
          const ahora = Date.now();
          await prisma.$transaction([
            prisma.chatMessage.create({ data: { userId, role: "user", content: texto, createdAt: new Date(ahora) } }),
            prisma.chatMessage.create({
              data: { userId, role: "assistant", content: respuesta, model: modelo, inputTokens, outputTokens, createdAt: new Date(ahora + 1) },
            }),
          ]);
        }
      } catch (e) {
        console.error("Error durante la respuesta de Claude:", e);
        controller.enqueue(encoder.encode(MARCA_ERROR + "Se cortó la respuesta de Claude. Intenta de nuevo."));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache, no-transform" } });
}

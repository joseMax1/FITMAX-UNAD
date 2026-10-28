import Anthropic from "@anthropic-ai/sdk";

// Modelo configurable desde .env (ANTHROPIC_MODEL). Por defecto, Claude Opus 5.5.
export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

let client: Anthropic | null = null;

export function getClaude() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

export type MensajeChat = { role: "user" | "assistant"; content: string };

/**
 * Deja el historial en un formato que la API acepta: empieza con "user" y alterna roles
 * (si hay dos mensajes seguidos del mismo rol, se unen).
 */
export function normalizarHistorial(msgs: MensajeChat[]): MensajeChat[] {
  const out: MensajeChat[] = [];
  for (const m of msgs) {
    if (!out.length && m.role !== "user") continue;
    const prev = out[out.length - 1];
    if (prev && prev.role === m.role) prev.content += "\n\n" + m.content;
    else out.push({ ...m });
  }
  return out;
}

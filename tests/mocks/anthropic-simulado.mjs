// Servidor que imita la API de mensajes de Anthropic (eventos SSE) para probar el chat sin una
// API key real y sin costo. Se usa con ANTHROPIC_BASE_URL=http://localhost:4010.
// Guarda la última petición recibida en MOCK_LOG para comprobar qué datos se enviaron a la IA.
//  - Mensaje con "rechaza"      -> stop_reason "refusal"
//  - Mensaje con "simular-401"  -> error 401 (API key inválida)
//  - Cualquier otro             -> responde "Hola, hoy toca entrenar fuerte." en 3 partes
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PUERTO = Number(process.env.MOCK_PORT || 4010);
const LOG = process.env.MOCK_LOG || "test-results/mock-anthropic-ultima-peticion.json";

http.createServer((req, res) => {
  let crudo = "";
  req.on("data", (c) => (crudo += c));
  req.on("end", () => {
    const body = JSON.parse(crudo || "{}");
    fs.mkdirSync(path.dirname(LOG), { recursive: true });
    // No se guardan las cabeceras: incluyen la API key.
    fs.writeFileSync(LOG, JSON.stringify({ url: req.url, recibidoEl: new Date().toISOString(), body }, null, 1));
    const ultimo = String(body.messages?.[body.messages.length - 1]?.content ?? "");
    const ev = (t, d) => res.write(`event: ${t}\ndata: ${JSON.stringify(d)}\n\n`);
    const inicio = (entrada) => ev("message_start", { type: "message_start", message: { id: "msg_simulado", type: "message", role: "assistant", model: body.model, content: [], stop_reason: null, usage: { input_tokens: entrada, output_tokens: 0 } } });

    if (ultimo.includes("simular-401")) {
      res.writeHead(401, { "content-type": "application/json" });
      return res.end(JSON.stringify({ type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } }));
    }
    res.writeHead(200, { "content-type": "text/event-stream" });
    if (ultimo.includes("rechaza")) {
      inicio(10);
      ev("message_delta", { type: "message_delta", delta: { stop_reason: "refusal" }, usage: { output_tokens: 0 } });
      ev("message_stop", { type: "message_stop" });
      return res.end();
    }
    inicio(321);
    ev("content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } });
    const partes = ["Hola, ", "hoy toca ", "entrenar fuerte."];
    let i = 0;
    const t = setInterval(() => {
      if (i < partes.length) return ev("content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: partes[i++] } });
      clearInterval(t);
      ev("content_block_stop", { type: "content_block_stop", index: 0 });
      ev("message_delta", { type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 12 } });
      ev("message_stop", { type: "message_stop" });
      res.end();
    }, 100);
  });
}).listen(PUERTO, () => console.log(`Anthropic simulado en http://localhost:${PUERTO}`));

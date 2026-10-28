"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Sparkles } from "lucide-react";

type Msg = { role: string; content: string };

export default function IAClient({ initialMessages }: { initialMessages: Msg[] }) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function enviar() {
    if (!input.trim() || sending) return;
    const texto = input.trim();
    setMessages((m) => [...m, { role: "user", content: texto }]);
    setInput("");
    setSending(true);
    let recibido = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texto }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No pude conectarme con Claude en este momento.");
      }
      // La respuesta llega por partes (streaming); se va mostrando mientras Claude escribe.
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        recibido += decoder.decode(value, { stream: true });
        const [texto] = recibido.split("\u0000");
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: texto }]);
      }
      const [respuesta, error] = recibido.split("\u0000");
      if (error !== undefined) {
        // Claude no completó: se quita la respuesta parcial y la pregunta vuelve al campo de texto.
        setMessages((m) => [...m.slice(0, -2), { role: "error", content: error }]);
        setInput(texto);
      } else if (!respuesta.trim()) {
        throw new Error("Claude no devolvió texto. Intenta de nuevo.");
      }
    } catch (e) {
      // El mensaje no quedó guardado: se devuelve al campo de texto para reintentar.
      setMessages((m) => {
        const sinParcial = m[m.length - 1]?.role === "assistant" && m[m.length - 2]?.role === "user" && m[m.length - 2]?.content === texto ? m.slice(0, -1) : m;
        return [...sinParcial.slice(0, -1), { role: "error", content: (e as Error).message }];
      });
      setInput(texto);
    } finally {
      setSending(false);
    }
  }

  async function borrar() {
    if (!confirm("¿Borrar toda la conversación con Claude?")) return;
    await fetch("/api/chat", { method: "DELETE" });
    setMessages([]);
  }

  const sugerencias = ["¿Qué entreno hoy?", "¿Cómo voy con la proteína de hoy?", "¿Qué ceno para llegar a mis macros?", "Dormí mal, ¿entreno fuerte hoy?", "¿Estoy progresando en press banca?"];

  return (
    <div className="flex flex-col flex-1 min-h-[420px]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-black uppercase flex items-center gap-2"><Sparkles size={18} className="text-accent" /> Mi Claude</h2>
        <button onClick={borrar} className="flex items-center gap-1 text-xs text-sub"><Trash2 size={14} /> Borrar</button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-xl p-3 bg-card border border-border space-y-2">
        {!messages.length && (
          <div className="text-sm text-sub">
            Soy Claude. Pregúntame sobre tu rutina, tu nutrición, tu descanso o tu progreso.
            <div className="flex flex-wrap gap-2 mt-3">
              {sugerencias.map((s) => (
                <button key={s} onClick={() => setInput(s)} className="text-xs px-2 py-1 rounded-full bg-card2 border border-border">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] text-sm rounded-xl px-3 py-2 whitespace-pre-wrap break-words ${
              m.role === "user" ? "bg-accent2 text-white" : m.role === "error" ? "bg-card2 border border-accent text-accent" : "bg-card2"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {sending && messages[messages.length - 1]?.role !== "assistant" && <div className="text-xs text-sub">Claude está escribiendo…</div>}
      </div>
      <div className="flex gap-2 mt-2 mb-4">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar()}
          placeholder="Pregúntale a Claude…" className="flex-1 px-3 py-2 rounded-lg bg-card2 border border-border" />
        <button onClick={enviar} disabled={sending || !input.trim()} className="px-4 rounded-lg text-white font-bold bg-accent disabled:opacity-40"><Send size={16} /></button>
      </div>
    </div>
  );
}

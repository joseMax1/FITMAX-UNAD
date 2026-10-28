// Límite de peticiones en memoria por clave (IP + acción). Frena ataques de fuerza bruta al login,
// registros masivos y abuso del chat. En un despliegue con varias instancias (serverless) cada
// instancia lleva su propio conteo; para producción a escala se recomienda un almacén compartido.
const ventanas = new Map<string, { inicio: number; usos: number }>();

export function permitir(clave: string, max: number, ventanaMs: number) {
  const ahora = Date.now();
  const v = ventanas.get(clave);
  if (!v || ahora - v.inicio > ventanaMs) {
    ventanas.set(clave, { inicio: ahora, usos: 1 });
    if (ventanas.size > 10_000) {
      for (const [k, x] of Array.from(ventanas)) if (ahora - x.inicio > ventanaMs) ventanas.delete(k);
    }
    return true;
  }
  v.usos += 1;
  return v.usos <= max;
}

/** IP del cliente según los encabezados del proxy; "local" si no viene ninguno. */
export function ipDe(headers: Headers | Record<string, unknown> | undefined) {
  const get = (k: string) =>
    headers instanceof Headers ? headers.get(k) : (headers?.[k] as string | undefined) ?? null;
  return (get("x-forwarded-for") || "").split(",")[0].trim() || get("x-real-ip") || "local";
}

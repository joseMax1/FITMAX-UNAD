// Zona horaria de la app. En Vercel el servidor corre en UTC; sin esto, después de las 7 p. m.
// (hora Colombia) el "día de hoy", la rutina y la racha se calculan con el día siguiente.
export const APP_TZ = process.env.APP_TZ || "America/Bogota";

/** Clave "YYYY-MM-DD" de una fecha vista en la zona de la app. */
export function claveDia(d: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** Índice del día de la semana en la zona de la app: 0 = lunes ... 6 = domingo. */
export function indiceDiaSemana(d: Date = new Date()) {
  const corto = new Intl.DateTimeFormat("en-US", { timeZone: APP_TZ, weekday: "short" }).format(d);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(corto);
}

/** Clave del día anterior a una clave "YYYY-MM-DD". */
export function claveDiaAnterior(clave: string) {
  const [y, m, d] = clave.split("-").map(Number);
  const f = new Date(Date.UTC(y, m - 1, d));
  f.setUTCDate(f.getUTCDate() - 1);
  return f.toISOString().slice(0, 10);
}

/** Suma (o resta) días a una clave "YYYY-MM-DD". */
export function sumarDias(clave: string, dias: number) {
  const [y, m, d] = clave.split("-").map(Number);
  const f = new Date(Date.UTC(y, m - 1, d));
  f.setUTCDate(f.getUTCDate() + dias);
  return f.toISOString().slice(0, 10);
}

/** Clave del lunes de la semana actual en la zona de la app. */
export function claveLunes(d: Date = new Date()) {
  return sumarDias(claveDia(d), -indiceDiaSemana(d));
}

/** Valida una clave "YYYY-MM-DD"; si no es válida devuelve la de hoy. */
export function claveValida(v: unknown) {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : claveDia();
}

/**
 * Rango de fechas UTC que cubre con seguridad los días [desde, hasta] de la zona de la app
 * (se amplía un día por lado; luego se filtra con claveDia()).
 */
export function rangoAmplio(desde: string, hasta: string) {
  return { gte: new Date(sumarDias(desde, -1) + "T00:00:00Z"), lt: new Date(sumarDias(hasta, 2) + "T00:00:00Z") };
}

/** Texto en minúsculas y sin tildes, para búsquedas: "Fríjoles" y "frijoles" coinciden. */
export function normalizar(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

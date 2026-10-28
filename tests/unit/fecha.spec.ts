import { test, expect } from "@playwright/test";
import { claveDia, indiceDiaSemana, claveDiaAnterior, sumarDias, claveValida, claveLunes } from "@/lib/fecha";

test.describe("lib/fecha (zona America/Bogota)", () => {
  test("a las 10 p. m. en Colombia sigue siendo el mismo día aunque en UTC ya sea el siguiente", () => {
    const noche = new Date("2026-10-29T03:00:00Z"); // 28 oct, 10:00 p. m. en Bogotá
    expect(claveDia(noche)).toBe("2026-10-28");
    expect(indiceDiaSemana(noche)).toBe(2); // miércoles (0 = lunes)
  });
  test("día anterior y suma de días cruzan meses y años", () => {
    expect(claveDiaAnterior("2026-03-01")).toBe("2026-02-28");
    expect(claveDiaAnterior("2028-03-01")).toBe("2028-02-29");
    expect(sumarDias("2026-12-30", 3)).toBe("2027-01-02");
  });
  test("lunes de la semana", () => {
    expect(claveLunes(new Date("2026-11-01T15:00:00Z"))).toBe("2026-10-26"); // domingo 1 nov
  });
  test("claveValida rechaza formatos inválidos y usa hoy", () => {
    expect(claveValida("2026-10-05")).toBe("2026-10-05");
    expect(claveValida("05/10/2026")).toBe(claveDia());
    expect(claveValida(123)).toBe(claveDia());
  });
});

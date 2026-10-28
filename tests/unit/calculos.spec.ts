import { test, expect } from "@playwright/test";
import { calcularMacros } from "@/lib/nutrition";
import { macrosPorGramos } from "@/lib/foods";
import { recuperacion, metasDe } from "@/lib/resumen";
import { normalizarHistorial } from "@/lib/claude";
import { normalizar } from "@/lib/texto";

test.describe("cálculos de nutrición y bienestar", () => {
  test("Mifflin-St Jeor: hombre 80 kg, 180 cm, 30 años, hipertrofia, 4 días", () => {
    // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 1780; TDEE = 1780*1.4 = 2492; +10 % = 2741
    expect(calcularMacros({ peso: 80, altura: 180, edad: 30, sexo: "H", objetivo: "Hipertrofia", diasSemana: 4 }))
      .toMatchObject({ kcal: 2741, proteina: 152, grasa: 76, carbos: 362 });
  });
  test("definición baja las calorías y sube la proteína", () => {
    const m = calcularMacros({ peso: 62, altura: 165, edad: 28, sexo: "M", objetivo: "Pérdida de grasa / Definición", diasSemana: 3 });
    // BMR = 620 + 1031.25 - 140 - 161 = 1350.25; TDEE = 1890.35; *0.82 = 1550
    expect(m.kcal).toBe(1550);
    expect(m.proteina).toBe(136);
  });
  test("macros por gramos se escalan desde 100 g", () => {
    expect(macrosPorGramos({ kcal: 130, proteina: 2.7, carbos: 28, grasa: 0.3 }, 160)).toEqual({ kcal: 208, proteina: 4.3, carbos: 44.8, grasa: 0.5 });
  });
  test("metas personalizadas reemplazan las calculadas", () => {
    const base = { id: "x", peso: 80, altura: 180, edad: 30, sexo: "H", objetivo: "Hipertrofia", diasSemana: 4, metaAguaMl: 3000, metaSuenoH: 7.5, pesoObjetivo: null };
    expect(metasDe({ ...base, metaKcal: null, metaProteina: null }).kcal).toBe(2741);
    expect(metasDe({ ...base, metaKcal: 2200, metaProteina: 170 })).toMatchObject({ kcal: 2200, proteina: 170, aguaMl: 3000 });
  });
  test("puntaje de recuperación", () => {
    expect(recuperacion(null)).toBeNull();
    expect(recuperacion({ horasSueno: null, calidadSueno: null, energia: null, estres: null, dolorMuscular: null })).toBeNull();
    const alta = recuperacion({ horasSueno: 8, calidadSueno: 5, energia: 4, estres: 1, dolorMuscular: 2 });
    expect(alta?.puntaje).toBe(4.6); // (5+5+4+5+4)/5
    expect(alta?.sugerencia).toContain("Buena recuperación");
    expect(recuperacion({ horasSueno: 4, calidadSueno: 2, energia: 1, estres: 5, dolorMuscular: 5 })?.sugerencia).toContain("Recuperación baja");
  });
});

test.describe("utilidades", () => {
  test("historial del chat empieza en 'user' y alterna roles", () => {
    expect(normalizarHistorial([
      { role: "assistant", content: "hola" },
      { role: "user", content: "a" },
      { role: "user", content: "b" },
      { role: "assistant", content: "c" },
    ])).toEqual([{ role: "user", content: "a\n\nb" }, { role: "assistant", content: "c" }]);
  });
  test("búsqueda sin tildes", () => {
    expect(normalizar("  Fríjoles ")).toBe("frijoles");
    expect(normalizar("Jalón al pecho").includes(normalizar("jalon"))).toBe(true);
  });
});

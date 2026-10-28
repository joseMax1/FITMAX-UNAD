export function calcularMacros(p: { peso: number; altura: number; edad: number; sexo: string; objetivo: string; diasSemana: number }) {
  const bmr = 10 * p.peso + 6.25 * p.altura - 5 * p.edad + (p.sexo === "H" ? 5 : -161);
  const factorActividad = p.diasSemana >= 5 ? 1.55 : p.diasSemana >= 3 ? 1.4 : 1.25;
  const tdee = bmr * factorActividad;
  let ajuste = 1;
  if (p.objetivo.includes("Hipertrofia")) ajuste = 1.1;
  else if (p.objetivo.includes("Definición")) ajuste = 0.82;
  else if (p.objetivo.includes("Recomposición")) ajuste = 0.97;
  const kcal = Math.round(tdee * ajuste);
  const proteina = Math.round(p.peso * (p.objetivo.includes("Definición") ? 2.2 : 1.9));
  const grasa = Math.round((kcal * 0.25) / 9);
  const carbos = Math.max(0, Math.round((kcal - proteina * 4 - grasa * 9) / 4));
  return { kcal, proteina, carbos, grasa };
}

export const MENU_ECONOMICO: Record<string, string> = {
  Desayuno: "Avena con leche + 2-3 huevos + fruta.",
  Almuerzo: "Arroz + fuente de proteína (pollo, atún o lentejas) + verdura + porción de plátano o papa.",
  Cena: "Igual al almuerzo, ajustando la porción de carbohidrato según el objetivo.",
  Snack: "Yogur o fruta con maní.",
  "Pre-entreno": "Fruta o pan con algo de proteína.",
  "Post-entreno": "Proteína de rápida disponibilidad (huevos, atún, pollo o batido) + carbohidrato.",
};

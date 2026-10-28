// Alimentos comunes en Colombia. Valores aproximados por 100 g (tablas USDA / ICBF);
// sirven para estimar, no son exactos para cada marca o preparación.
// [nombre, porción sugerida, gramos de la porción, kcal, proteína, carbos, grasa]
type FilaAlimento = [string, string, number, number, number, number, number];

const FILAS: FilaAlimento[] = [
  // Cereales, tubérculos y harinas
  ["Arroz blanco cocido", "1 taza", 160, 130, 2.7, 28, 0.3],
  ["Arroz integral cocido", "1 taza", 160, 112, 2.3, 24, 0.8],
  ["Avena en hojuelas", "1/2 taza", 40, 389, 16.9, 66, 6.9],
  ["Arepa de maíz blanca", "1 unidad mediana", 80, 200, 4.5, 42, 1.5],
  ["Pan blanco", "1 tajada", 30, 265, 9, 49, 3.2],
  ["Pan integral", "1 tajada", 30, 247, 13, 41, 3.4],
  ["Pasta cocida", "1 taza", 140, 158, 5.8, 31, 0.9],
  ["Papa cocida", "1 mediana", 150, 87, 1.9, 20, 0.1],
  ["Papa criolla cocida", "5 unidades", 120, 90, 2, 20, 0.2],
  ["Plátano maduro cocido", "1/2 unidad", 120, 122, 1.3, 32, 0.4],
  ["Plátano verde (patacón asado)", "1 porción", 100, 122, 1.3, 32, 0.4],
  ["Yuca cocida", "1 trozo", 150, 125, 1.2, 30, 0.3],
  ["Maíz tierno (mazorca)", "1 mazorca", 100, 96, 3.4, 21, 1.5],
  ["Quinua cocida", "1 taza", 185, 120, 4.4, 21, 1.9],
  ["Tortilla de maíz", "1 unidad", 30, 218, 5.7, 44.6, 2.8],
  ["Galletas de soda", "1 paquete", 30, 421, 9.5, 74, 8.6],
  ["Granola", "1/2 taza", 50, 471, 10, 64, 20],
  ["Pandebono", "1 unidad", 50, 330, 9, 40, 15],
  ["Empanada frita", "1 unidad", 90, 280, 7, 30, 15],
  // Leguminosas
  ["Lentejas cocidas", "1 taza", 200, 116, 9, 20, 0.4],
  ["Fríjoles rojos cocidos", "1 taza", 180, 127, 8.7, 22.8, 0.5],
  ["Garbanzos cocidos", "1 taza", 160, 164, 8.9, 27, 2.6],
  // Proteínas animales
  ["Huevo entero", "1 unidad", 50, 143, 12.6, 0.7, 9.5],
  ["Clara de huevo", "1 clara", 33, 52, 10.9, 0.7, 0.2],
  ["Pechuga de pollo cocida", "1 filete", 120, 165, 31, 0, 3.6],
  ["Muslo de pollo cocido", "1 muslo", 100, 209, 26, 0, 10.9],
  ["Carne de res magra cocida", "1 porción", 120, 200, 27, 0, 10],
  ["Carne molida de res cocida", "1 porción", 120, 254, 26, 0, 17],
  ["Lomo de cerdo cocido", "1 porción", 120, 143, 26, 0, 3.5],
  ["Atún en agua", "1 lata escurrida", 120, 116, 26, 0, 0.8],
  ["Sardinas en salsa de tomate", "1/2 lata", 100, 186, 17, 1.5, 12],
  ["Tilapia cocida", "1 filete", 120, 128, 26, 0, 2.7],
  ["Salmón", "1 filete", 120, 208, 20, 0, 13],
  ["Jamón de cerdo", "2 tajadas", 40, 145, 21, 1.5, 6],
  ["Salchicha", "1 unidad", 50, 300, 11, 3, 27],
  // Lácteos
  ["Leche entera", "1 vaso", 240, 61, 3.2, 4.8, 3.3],
  ["Leche descremada deslactosada", "1 vaso", 240, 35, 3.4, 5, 0.1],
  ["Yogur natural", "1 vaso", 200, 61, 3.5, 4.7, 3.3],
  ["Yogur griego sin grasa", "1 vaso", 170, 59, 10, 3.6, 0.4],
  ["Kumis", "1 vaso", 200, 80, 3, 12, 2],
  ["Queso campesino", "1 tajada", 40, 250, 18, 3, 18],
  ["Queso mozzarella", "1 tajada", 30, 280, 28, 3, 17],
  ["Proteína whey en polvo", "1 scoop", 30, 400, 80, 8, 6],
  // Grasas y frutos secos
  ["Aguacate", "1/4 unidad", 50, 160, 2, 8.5, 14.7],
  ["Maní", "1 puñado", 30, 567, 26, 16, 49],
  ["Mantequilla de maní", "1 cucharada", 16, 588, 25, 20, 50],
  ["Almendras", "1 puñado", 30, 579, 21, 22, 50],
  ["Aceite de oliva", "1 cucharada", 14, 884, 0, 0, 100],
  ["Aceite vegetal", "1 cucharada", 14, 884, 0, 0, 100],
  ["Mantequilla", "1 cucharadita", 5, 717, 0.9, 0.1, 81],
  // Frutas
  ["Banano", "1 unidad", 120, 89, 1.1, 23, 0.3],
  ["Manzana", "1 unidad", 180, 52, 0.3, 14, 0.2],
  ["Mango", "1 unidad", 200, 60, 0.8, 15, 0.4],
  ["Papaya", "1 taza", 150, 43, 0.5, 11, 0.3],
  ["Piña", "1 taza", 165, 50, 0.5, 13, 0.1],
  ["Guayaba", "1 unidad", 90, 68, 2.6, 14, 1],
  ["Naranja", "1 unidad", 130, 47, 0.9, 12, 0.1],
  ["Fresas", "1 taza", 150, 32, 0.7, 7.7, 0.3],
  // Verduras
  ["Brócoli cocido", "1 taza", 150, 35, 2.4, 7.2, 0.4],
  ["Zanahoria", "1 unidad", 70, 41, 0.9, 10, 0.2],
  ["Tomate", "1 unidad", 120, 18, 0.9, 3.9, 0.2],
  ["Lechuga", "1 taza", 50, 15, 1.4, 2.9, 0.2],
  ["Espinaca", "1 taza", 30, 23, 2.9, 3.6, 0.4],
  ["Cebolla", "1/2 unidad", 50, 40, 1.1, 9.3, 0.1],
  ["Ahuyama cocida", "1 taza", 200, 26, 1, 6.5, 0.1],
  ["Pepino", "1 unidad", 200, 15, 0.7, 3.6, 0.1],
  // Otros
  ["Panela", "1 cucharada", 20, 380, 0.4, 95, 0.1],
  ["Azúcar", "1 cucharadita", 5, 387, 0, 100, 0],
  ["Miel", "1 cucharada", 21, 304, 0.3, 82, 0],
  ["Café negro", "1 taza", 240, 2, 0.3, 0, 0],
];

export const ALIMENTOS_BASE = FILAS.map(([nombre, porcion, gramos, kcal, proteina, carbos, grasa]) => ({
  nombre, porcion, gramos, kcal, proteina, carbos, grasa,
}));

/** Macros para una cantidad en gramos de un alimento con valores por 100 g. */
export function macrosPorGramos(f: { kcal: number; proteina: number; carbos: number; grasa: number }, gramos: number) {
  const k = gramos / 100;
  const r = (n: number) => Math.round(n * k * 10) / 10;
  return { kcal: Math.round(f.kcal * k), proteina: r(f.proteina), carbos: r(f.carbos), grasa: r(f.grasa) };
}

export const TIPOS_COMIDA = [
  { id: "DESAYUNO", label: "Desayuno" },
  { id: "ALMUERZO", label: "Almuerzo" },
  { id: "CENA", label: "Cena" },
  { id: "SNACK", label: "Snack" },
  { id: "PRE_ENTRENO", label: "Pre-entreno" },
  { id: "POST_ENTRENO", label: "Post-entreno" },
] as const;

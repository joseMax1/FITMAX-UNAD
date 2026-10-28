import { indiceDiaSemana } from "./fecha";

export type Ejercicio = {
  id: string; nombre: string; grupo: string; series: number; reps: string;
  descanso: number; equipo: string; dificultad: string; tip: string;
};

export const EJERCICIOS: Ejercicio[] = [
  { id: "press_banca", nombre: "Press banca", grupo: "Pecho", series: 4, reps: "6-10", descanso: 120, equipo: "Barra", dificultad: "Intermedio", tip: "Escápulas retraídas, barra al esternón." },
  { id: "press_inclinado", nombre: "Press inclinado con mancuernas", grupo: "Pecho", series: 3, reps: "8-12", descanso: 90, equipo: "Mancuernas", dificultad: "Intermedio", tip: "Inclinación 30-45°, no bloquear codos." },
  { id: "aperturas", nombre: "Aperturas con mancuernas", grupo: "Pecho", series: 3, reps: "10-15", descanso: 60, equipo: "Mancuernas", dificultad: "Principiante", tip: "Codo ligeramente flexionado todo el recorrido." },
  { id: "fondos", nombre: "Fondos en paralelas", grupo: "Pecho", series: 3, reps: "6-12", descanso: 90, equipo: "Paralelas", dificultad: "Avanzado", tip: "Inclínate al frente para más énfasis en pecho." },
  { id: "dominadas", nombre: "Dominadas", grupo: "Espalda", series: 4, reps: "5-10", descanso: 120, equipo: "Barra", dificultad: "Avanzado", tip: "Escápulas activas antes de tirar." },
  { id: "jalon", nombre: "Jalón al pecho", grupo: "Espalda", series: 3, reps: "8-12", descanso: 90, equipo: "Polea", dificultad: "Principiante", tip: "Sustituto de dominadas si aún no puedes hacerlas." },
  { id: "remo_barra", nombre: "Remo con barra", grupo: "Espalda", series: 4, reps: "6-10", descanso: 120, equipo: "Barra", dificultad: "Intermedio", tip: "Espalda neutra, tira hacia el ombligo." },
  { id: "remo_mancuerna", nombre: "Remo con mancuerna a un brazo", grupo: "Espalda", series: 3, reps: "8-12", descanso: 90, equipo: "Mancuerna", dificultad: "Principiante", tip: "Evita rotar el torso al tirar." },
  { id: "peso_muerto", nombre: "Peso muerto", grupo: "Espalda", series: 3, reps: "5-8", descanso: 150, equipo: "Barra", dificultad: "Avanzado", tip: "Barra pegada a las piernas todo el recorrido." },
  { id: "press_militar", nombre: "Press militar", grupo: "Hombros", series: 4, reps: "6-10", descanso: 120, equipo: "Barra", dificultad: "Intermedio", tip: "Aprieta glúteos y abdomen para estabilidad." },
  { id: "elev_laterales", nombre: "Elevaciones laterales", grupo: "Hombros", series: 3, reps: "12-15", descanso: 60, equipo: "Mancuernas", dificultad: "Principiante", tip: "Sube hasta la altura del hombro, sin impulso." },
  { id: "face_pull", nombre: "Face pull", grupo: "Hombros", series: 3, reps: "12-15", descanso: 60, equipo: "Polea", dificultad: "Principiante", tip: "Bueno para salud del hombro y postura." },
  { id: "curl_biceps", nombre: "Curl de bíceps con barra", grupo: "Bíceps", series: 3, reps: "8-12", descanso: 60, equipo: "Barra", dificultad: "Principiante", tip: "Codos pegados al torso." },
  { id: "curl_martillo", nombre: "Curl martillo", grupo: "Bíceps", series: 3, reps: "10-12", descanso: 60, equipo: "Mancuernas", dificultad: "Principiante", tip: "Trabaja también el antebrazo." },
  { id: "ext_triceps", nombre: "Extensión de tríceps en polea", grupo: "Tríceps", series: 3, reps: "10-15", descanso: 60, equipo: "Polea", dificultad: "Principiante", tip: "Codos fijos junto al torso." },
  { id: "press_frances", nombre: "Press francés", grupo: "Tríceps", series: 3, reps: "8-12", descanso: 75, equipo: "Barra Z", dificultad: "Intermedio", tip: "Baja controlado hasta la frente." },
  { id: "sentadilla", nombre: "Sentadilla libre", grupo: "Cuádriceps", series: 4, reps: "6-10", descanso: 150, equipo: "Barra", dificultad: "Intermedio", tip: "Rodillas en línea con los pies, pecho arriba." },
  { id: "sentadilla_frontal", nombre: "Sentadilla frontal", grupo: "Cuádriceps", series: 3, reps: "6-10", descanso: 150, equipo: "Barra", dificultad: "Avanzado", tip: "Codos altos, torso lo más vertical posible." },
  { id: "prensa", nombre: "Prensa de piernas", grupo: "Cuádriceps", series: 4, reps: "8-12", descanso: 120, equipo: "Máquina", dificultad: "Principiante", tip: "Alternativa segura si no toleras sentadilla libre." },
  { id: "hack_squat", nombre: "Hack Squat", grupo: "Cuádriceps", series: 3, reps: "8-12", descanso: 120, equipo: "Máquina", dificultad: "Intermedio", tip: "Si no está disponible, sustituye por Prensa." },
  { id: "ext_cuadriceps", nombre: "Extensión de cuádriceps", grupo: "Cuádriceps", series: 3, reps: "12-15", descanso: 60, equipo: "Máquina", dificultad: "Principiante", tip: "Aísla el cuádriceps, buen cierre de sesión." },
  { id: "zancadas", nombre: "Zancadas", grupo: "Cuádriceps", series: 3, reps: "10-12 x pierna", descanso: 90, equipo: "Mancuernas", dificultad: "Intermedio", tip: "Paso amplio, rodilla trasera casi al piso." },
  { id: "bulgaro", nombre: "Bulgarian Split Squat", grupo: "Cuádriceps", series: 3, reps: "8-12 x pierna", descanso: 90, equipo: "Mancuernas", dificultad: "Intermedio", tip: "Pie trasero elevado en banco." },
  { id: "peso_muerto_rumano", nombre: "Peso muerto rumano", grupo: "Isquiotibiales", series: 3, reps: "8-12", descanso: 120, equipo: "Barra", dificultad: "Intermedio", tip: "Cadera hacia atrás, rodilla casi fija." },
  { id: "curl_femoral", nombre: "Curl femoral", grupo: "Isquiotibiales", series: 3, reps: "10-15", descanso: 75, equipo: "Máquina", dificultad: "Principiante", tip: "Controla la fase excéntrica." },
  { id: "hip_thrust", nombre: "Hip Thrust", grupo: "Glúteos", series: 4, reps: "8-12", descanso: 120, equipo: "Barra", dificultad: "Intermedio", tip: "Pausa 1 segundo arriba apretando glúteo." },
  { id: "sentadilla_sumo", nombre: "Sentadilla sumo", grupo: "Glúteos", series: 3, reps: "10-12", descanso: 90, equipo: "Mancuerna", dificultad: "Principiante", tip: "Pies bien abiertos, rodillas hacia afuera." },
  { id: "gemelo_pie", nombre: "Elevación de talones de pie", grupo: "Pantorrillas", series: 4, reps: "12-20", descanso: 60, equipo: "Máquina", dificultad: "Principiante", tip: "Rango completo, pausa arriba." },
  { id: "plancha", nombre: "Plancha", grupo: "Abdomen", series: 3, reps: "30-60 seg", descanso: 45, equipo: "Ninguno", dificultad: "Principiante", tip: "Cadera alineada, no dejarla caer." },
  { id: "elev_piernas", nombre: "Elevación de piernas colgado", grupo: "Abdomen", series: 3, reps: "10-15", descanso: 60, equipo: "Barra", dificultad: "Intermedio", tip: "Evita balancearte, controla el descenso." },
];

export const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export const SPLITS: Record<number, string[][]> = {
  2: [["Pecho", "Espalda", "Cuádriceps"], ["Hombros", "Bíceps", "Tríceps", "Isquiotibiales"]],
  3: [["Pecho", "Tríceps"], ["Espalda", "Bíceps"], ["Cuádriceps", "Isquiotibiales", "Glúteos"]],
  4: [["Pecho", "Tríceps"], ["Espalda", "Bíceps"], ["Cuádriceps", "Glúteos"], ["Hombros", "Isquiotibiales", "Abdomen"]],
  5: [["Pecho", "Tríceps"], ["Espalda", "Bíceps"], ["Cuádriceps", "Isquiotibiales"], ["Hombros", "Abdomen"], ["Glúteos", "Pantorrillas"]],
  6: [["Pecho"], ["Espalda"], ["Cuádriceps", "Glúteos"], ["Hombros"], ["Bíceps", "Tríceps"], ["Isquiotibiales", "Pantorrillas", "Abdomen"]],
};

export function ejerciciosDelDia(grupos: string[]): Ejercicio[] {
  const out: Ejercicio[] = [];
  grupos.forEach((g) => out.push(...EJERCICIOS.filter((e) => e.grupo === g).slice(0, 2)));
  return out;
}

export function diaDeHoy(diasSemana: number) {
  const split = SPLITS[diasSemana] || SPLITS[4];
  const diaIdx = indiceDiaSemana();
  if (diaIdx < split.length) return { nombre: DIAS_SEMANA[diaIdx], grupos: split[diaIdx] as string[] | null };
  return { nombre: DIAS_SEMANA[diaIdx], grupos: null as string[] | null };
}

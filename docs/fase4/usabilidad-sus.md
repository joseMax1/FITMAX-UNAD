# Evaluación de usabilidad: tareas e instrumento SUS

Estado: **instrumento preparado, sin aplicar.** No hay participantes ni resultados todavía. Los
resultados se registran en `usabilidad-sus-resultados.xlsx` solo con datos reales.

## 1. Procedimiento

1. **Participantes:** 5 a 8 personas que entrenen o quieran entrenar (la literatura de usabilidad
   indica que 5 usuarios detectan la mayoría de problemas de una interfaz). Mayores de edad.
2. **Consentimiento:** cada participante firma el consentimiento informado (sección 5). Se registran
   con un código (P01, P02…), no con su nombre.
3. **Equipo:** el teléfono del participante o uno de prueba, con la app desplegada y una cuenta de
   prueba creada para él.
4. **Sesión (20 a 30 min):** explicar el objetivo (se evalúa la app, no a la persona); pedir que
   piense en voz alta; leer cada tarea sin dar pistas; anotar si la completó, el tiempo y los
   errores; al final, aplicar el cuestionario SUS y dos preguntas abiertas.
5. **Análisis:** calcular el puntaje SUS por participante y el promedio; listar los problemas
   observados con su frecuencia y gravedad.

## 2. Tareas

| # | Tarea (se lee al participante) | Éxito si… | Módulo |
|---|---|---|---|
| T1 | "Inicia sesión con la cuenta que te dimos." | Llega al Inicio | Acceso |
| T2 | "Busca qué te toca entrenar el miércoles." | Abre Entrenar → Semana y lee el día | Entrenar |
| T3 | "Revisa en el calendario qué días entrenaste el mes pasado." | Navega al mes anterior | Entrenar |
| T4 | "Busca el ejercicio 'jalón al pecho' y lee su consejo técnico." | Lo abre en Ejercicios | Entrenar |
| T5 | "Registra que almorzaste 1 taza de arroz blanco." | El alimento aparece en Almuerzo | Nutrición |
| T6 | "Registra tu peso de hoy: 70 kg." | El peso aparece en Progreso | Progreso |
| T7 | "Registra que tomaste un vaso de agua de 250 ml." | El total de agua sube 250 ml | Bienestar |
| T8 | "Pregúntale al asistente qué comer antes de entrenar." | Recibe una respuesta | Mi Claude |
| T9 | "Cambia tu meta de agua a 3 litros." | La meta queda en 3000 ml | Perfil |

Por tarea se registra: completada (sí/no/con ayuda), tiempo en segundos, número de errores y
observaciones.

## 3. Cuestionario SUS (System Usability Scale)

Instrucción: "Marca qué tan de acuerdo estás con cada frase: 1 = totalmente en desacuerdo,
5 = totalmente de acuerdo. Responde todas, con tu primera impresión."

1. Creo que me gustaría usar esta aplicación con frecuencia.
2. Encontré la aplicación innecesariamente compleja.
3. Pensé que la aplicación era fácil de usar.
4. Creo que necesitaría el apoyo de una persona técnica para poder usar esta aplicación.
5. Encontré que las diversas funciones de la aplicación estaban bien integradas.
6. Pensé que había demasiada inconsistencia en la aplicación.
7. Imagino que la mayoría de las personas aprenderían a usar esta aplicación muy rápidamente.
8. Encontré la aplicación muy difícil de usar.
9. Me sentí muy seguro(a) usando la aplicación.
10. Necesité aprender muchas cosas antes de poder empezar a usar esta aplicación.

Preguntas abiertas: ¿Qué fue lo que más te gustó? ¿Qué cambiarías primero?

## 4. Cálculo del puntaje (Brooke, 1996)

- Ítems impares (1, 3, 5, 7, 9): aporte = respuesta − 1.
- Ítems pares (2, 4, 6, 8, 10): aporte = 5 − respuesta.
- Puntaje SUS = suma de los 10 aportes × 2,5 (rango 0 a 100).
- Si falta una respuesta, el cuestionario no se puntúa (se reporta como incompleto).
- Interpretación de referencia (Bangor et al., 2009): el promedio de muchos estudios es cerca de
  68; por encima de 68 se considera mejor que el promedio.

Ejemplo de cálculo (no es un resultado): respuestas 4,2,4,1,4,2,5,1,4,2 → impares
3+3+3+4+3 = 16, pares 3+4+3+4+3 = 17, total 33 × 2,5 = 82,5.

La hoja `usabilidad-sus-resultados.xlsx` hace este cálculo con fórmulas.

## 5. Consentimiento informado (modelo)

"Acepto participar voluntariamente en la evaluación de la aplicación FITMAX del proyecto de grado
de la UNAD. Entiendo que se evalúa la aplicación y no mi desempeño, que puedo retirarme en cualquier
momento, que se tomarán notas y tiempos, y que mis respuestas se usarán solo con fines académicos
bajo un código anónimo, según la Ley 1581 de 2012. No se grabará mi rostro ni mi voz sin una
autorización adicional."

Código del participante: ____  Fecha: ____  Firma: ____

## Referencias

Bangor, A., Kortum, P., & Miller, J. (2009). Determining what individual SUS scores mean: Adding an
adjective rating scale. *Journal of Usability Studies, 4*(3), 114-123.

Brooke, J. (1996). SUS: A "quick and dirty" usability scale. En P. W. Jordan, B. Thomas, B. A.
Weerdmeester, & I. L. McClelland (Eds.), *Usability evaluation in industry* (pp. 189-194). Taylor &
Francis.

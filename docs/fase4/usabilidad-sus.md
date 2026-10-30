# Evaluación de usabilidad: tareas e instrumento SUS

Estado: **instrumento preparado, sin aplicar.** No hay participantes ni resultados todavía. Los
resultados se registran en `usabilidad-sus-resultados.xlsx` solo con datos reales.

## 1. Procedimiento (sección 8.8 y anexo D de la Fase 3)

1. **Participantes:** 5 a 8 personas adultas que realicen actividad física de manera autónoma
   (población de la sección 5.2 de la Fase 3).
2. **Consentimiento:** cada participante firma el consentimiento informado (sección 5). Se identifica
   con un código anónimo (U01, U02…), nunca con su nombre.
3. **Equipo:** el teléfono del participante o uno de prueba, con la app desplegada y una cuenta de
   prueba creada para él. Se anota modelo de equipo y navegador.
4. **Sesión (20 a 30 min):** explicar que se evalúa la app y no a la persona; leer cada tarea sin
   dar pistas; anotar si la completó sin ayuda, el número de ayudas, errores o retrocesos, el tiempo
   aproximado y la facilidad percibida (1 a 5); al final, aplicar el SUS y dos preguntas abiertas.
5. **Análisis:** porcentaje de tareas completadas sin ayuda, facilidad media, SUS por participante
   y media, y lista de problemas observados con su frecuencia.

**Metas de aceptación de la Fase 3:** al menos 80 % de tareas completadas sin ayuda, facilidad
media de al menos 4/5 y SUS medio de al menos 70/100.

## 2. Tareas (anexo D.1 de la Fase 3)

| N.º | Tarea (se lee al participante) | Ruta en FITMAX | Criterio de éxito | Registro |
|---|---|---|---|---|
| T1 | "Localiza la rutina que te toca hoy." | Entrenar, vista semanal | Completa la tarea sin ayuda | Sí/No; número de ayudas |
| T2 | "Abre el calendario, ve al mes anterior y elige un día." | Entrenar, calendario mensual | Cambia de mes y selecciona un día | Sí/No; errores o retrocesos |
| T3 | "Busca cuántas calorías y proteína llevas hoy." | Nutrición | Identifica calorías y macronutrientes | Facilidad 1–5 |
| T4 | "Encuentra tu peso y tus medidas." | Progreso | Ubica peso y medidas | Sí/No; tiempo aproximado |
| T5 | "Registra un vaso de agua." | Bienestar | El registro queda guardado y visible | Pasos completados; observaciones |
| T6 | "Pregúntale al asistente qué comer antes de entrenar." | Mi Claude | Distingue la respuesta informativa y sus límites | Comentario breve |

Además de lo indicado en "Registro", en cada tarea se anota la facilidad percibida (1 a 5) para
calcular la facilidad media.

## 3. Cuestionario SUS (anexo D.2 de la Fase 3)

Instrucción: "Marca qué tan de acuerdo estás con cada frase: 1 = totalmente en desacuerdo,
5 = totalmente de acuerdo. Responde todas, con tu primera impresión."

1. Creo que me gustaría usar FITMAX con frecuencia.
2. Encontré FITMAX innecesariamente complejo.
3. Pensé que FITMAX era fácil de usar.
4. Creo que necesitaría ayuda de una persona técnica para poder usar FITMAX.
5. Encontré que las distintas funciones de FITMAX estaban bien integradas.
6. Pensé que había demasiada inconsistencia en FITMAX.
7. Imagino que la mayoría de las personas aprendería a usar FITMAX muy rápidamente.
8. Encontré FITMAX muy difícil de usar.
9. Me sentí muy seguro(a) usando FITMAX.
10. Necesité aprender muchas cosas antes de poder empezar a usar FITMAX.

Preguntas abiertas: ¿Qué fue lo que más te gustó? ¿Qué cambiarías primero?

## 4. Cálculo del puntaje (Brooke, 1996)

- Ítems impares (1, 3, 5, 7, 9): aporte = respuesta − 1.
- Ítems pares (2, 4, 6, 8, 10): aporte = 5 − respuesta.
- Puntaje SUS = suma de los 10 aportes × 2,5 (rango 0 a 100).
- Si falta una respuesta, el cuestionario no se puntúa (se reporta como incompleto).
- Meta del proyecto (Fase 3): media de al menos 70. Referencia (Bangor et al., 2009): el promedio de
  muchos estudios es cerca de 68.

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

# Evaluación del nivel de madurez tecnológica (TRL)

Escala usada: la misma de la Fase 3 (sección 6.2.3), según las descripciones de TRL de la Comisión
Europea (European Innovation Council, s. f.): TRL 4 es la validación de la tecnología en laboratorio y
TRL 5 la validación en un entorno relevante.

| Nivel | Criterio | ¿Se cumple en FITMAX? | Evidencia |
|---|---|---|---|
| TRL 3 | Prueba de concepto analítica y experimental de las funciones críticas | Sí | Estimado en la Fase 3; prototipo y versión 2 del 9 de octubre de 2026 |
| TRL 4 | Validación de componentes integrados en ambiente de laboratorio | **Sí** | Sistema completo (interfaz, API, base de datos, asistente) integrado y probado en ambiente de desarrollo: todas las pruebas automatizadas aprobadas (registro del 30/10/2026 en `docs/pruebas.md`) |
| TRL 5 | Validación de componentes en un ambiente relevante (simulado cercano al real) | **No todavía** | Faltan las condiciones de la tabla siguiente |
| TRL 6 | Demostración del prototipo en ambiente relevante | No | |

**Nivel alcanzado con evidencia: TRL 4**, que era la meta propuesta en la Fase 3. La guía de la
Fase 4 pide un prototipo TRL 5; no se declara
alcanzado porque las pruebas se hicieron en un contenedor de desarrollo, con navegadores emulados,
base de datos local y un simulador de la API de Claude.

## Brecha para llegar a TRL 5

| # | Condición | Estado | Responsable | Evidencia que se debe guardar |
|---|---|---|---|---|
| 1 | App desplegada en la infraestructura objetivo (Vercel + Neon) con HTTPS | Pendiente | Equipo | URL, fecha, captura del panel de despliegue (sin claves) |
| 2 | Migración aplicada en la base de producción | Pendiente | Equipo | Salida de `npm run db:migrate` |
| 3 | CP-01 a CP-12 repetidos contra la URL desplegada (`E2E_BASE_URL=https://…`) con una base de prueba | Pendiente | Equipo | Reporte de Playwright |
| 4 | Asistente probado con la API real de Anthropic | Pendiente (requiere la key) | Equipo | Fecha, modelo, 3 preguntas y respuestas, errores |
| 5 | Uso en teléfonos reales (al menos 1 Android y 1 iPhone) e instalación como PWA | Pendiente | Equipo | Capturas y modelo de cada equipo |
| 6 | Evaluación con usuarios representativos (instrumento SUS y tareas) | Instrumento listo; sin aplicar | Equipo | Formatos diligenciados, hoja de cálculo SUS |
| 7 | Rotación de las credenciales expuestas el 10/10/2026 | Pendiente | Equipo | Confirmación (sin mostrar las claves) |

Cuando las condiciones 1 a 6 tengan evidencia, el equipo puede declarar TRL 5 citando esos
registros.

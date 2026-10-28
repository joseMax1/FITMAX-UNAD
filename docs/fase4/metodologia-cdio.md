# Metodología y registro de iteraciones (CDIO)

El proyecto se organiza con el marco **CDIO** (Concebir, Diseñar, Implementar, Operar) aplicado en
iteraciones cortas e incrementales. No se declara Scrum porque el documento de la Fase 3 no está
disponible en este entorno para confirmar que el equipo lo adoptó; si ese documento declara Scrum,
las iteraciones de esta tabla corresponden a sus sprints.

## Iteraciones ejecutadas (con fecha verificable)

| Iteración | Fecha | Fase CDIO | Actividades | Resultado verificable |
|---|---|---|---|---|
| I1 | 9 oct 2026 | Concebir / Diseñar | Análisis del código heredado; 12 defectos corregidos (hash de contraseña expuesto, caché del Service Worker, zona horaria, XP duplicada, etc.); reemplazo del "copiloto" por el asistente Claude; ejecutor `iniciar.bat` | `docs/analisis-fitmax.md`, `fitmax-web.zip` v1 |
| I2 | 9 oct 2026 | Diseñar / Implementar | Esquema de datos para 6 áreas (15 modelos); implementación de Dashboard, Entrenar, Nutrición, Progreso, Bienestar, Claude y Perfil | `schema-propuesto.prisma`, versión 2 |
| I3 | 9 al 11 oct 2026 | Operar | Soporte de instalación en Windows (errores de `DATABASE_URL`), mejoras de `iniciar.bat` | `iniciar.bat` corregido |
| I4 | 28 oct 2026 | Implementar / Operar | Auditoría de seguridad, actualización de dependencias, validación, privacidad, migraciones, 17 pruebas unitarias y CP-01 a CP-12, documentación | Commits `227b646` a `203984b`, `docs/pruebas.md` |

## Iteraciones planeadas (no ejecutadas)

| Iteración | Fase CDIO | Actividades | Criterio de terminado |
|---|---|---|---|
| I5 | Operar | Despliegue en Vercel + Neon, prueba con la API real, rotación de credenciales | Condiciones 1 a 4 y 7 de `trl.md` con evidencia |
| I6 | Operar | Evaluación de usabilidad con participantes (SUS y tareas) | Formatos y hoja SUS diligenciados con datos reales |
| I7 | Diseñar / Implementar | Ajustes según la evaluación; recuperación de contraseña; límite de intentos compartido | Cambios con pruebas aprobadas |

## Prácticas aplicadas en I4

- Control de versiones con Git: commits pequeños con mensaje explicativo.
- Definición de terminado: `typecheck`, `lint`, `build` y pruebas aprobadas antes de cada commit.
- Pruebas automatizadas repetibles (Playwright) y registro de incidentes con reprueba.
- Seguridad desde el diseño: validación en servidor, aislamiento por usuario, minimización de datos.

# Metodología de desarrollo: Scrum + CDIO

La Fase 3 formalizó **Scrum** como marco de coordinación y **CDIO** (Concebir, Diseñar,
Implementar, Operar) como ciclo de ingeniería (sección 8.1 del documento de la Fase 3). Este
archivo registra cómo se aplicaron en la Fase 4 y qué evidencia verificable existe de cada
incremento.

## Roles (definidos en la Fase 3)

| Rol | Responsable | Responsabilidad |
|---|---|---|
| Product Owner | Maximiliano José de León Cera | Prioriza el Product Backlog y aclara los criterios de aceptación |
| Scrum Master | Fabián Enrique Herrera Zabala | Facilita planificación, revisión y retrospectiva; elimina impedimentos |
| Developers | Ambos integrantes | Análisis, diseño, implementación, documentación y pruebas |

## Definición de Terminado (DoD de la Fase 3) y cómo se comprueba

| Criterio de la DoD | Cómo se verifica en el repositorio |
|---|---|
| Cambio guardado en una versión identificable | Commit de Git con mensaje explicativo (`git log`) |
| Requisito y criterio de aceptación vinculados | `matriz-trazabilidad.xlsx` (RF/RNF → CP → evidencia) |
| Revisión por el otro integrante | **Pendiente de registrar por el equipo** (no hay evidencia en el repositorio) |
| Pruebas ejecutadas y registradas | `docs/pruebas.md` y capturas en `test-results/evidencias/` |
| Sin secretos ni datos personales en evidencias | `.gitignore`, revisión de `git grep` en todo el historial (ver `verificacion-final.md`) |
| Incidencias abiertas documentadas | `docs/pruebas.md` (incidentes) y `diagnostico.md` (riesgos abiertos) |

## Incrementos ejecutados (con fecha verificable)

Las fechas salen del historial de Git y de los entregables del proyecto. Los sprints de la Fase 3
eran de dos semanas; la tabla registra los incrementos reales, no ceremonias que no tienen acta.

| Incremento | Fecha | Fase CDIO | Backlog atendido | Resultado verificable |
|---|---|---|---|---|
| I1 | 9 oct 2026 | Concebir / Diseñar | Análisis del código heredado; 12 defectos corregidos; asistente Claude en lugar del "copiloto"; ejecutor `iniciar.bat` | `docs/analisis-fitmax.md`; commit base `2718196` |
| I2 | 9 oct 2026 | Diseñar / Implementar | Modelo de datos de 6 áreas; Dashboard, Entrenar, Nutrición, Progreso, Bienestar, Claude y Perfil | Versión 2 (incluida en el commit base) |
| I3 | 9 a 11 oct 2026 | Operar | Soporte de instalación en Windows (`DATABASE_URL`) | `iniciar.bat` corregido |
| I4 | 28 oct 2026 | Implementar / Operar | Seguridad (RNF-02), validación (RNF-03), privacidad (RNF-06), migraciones (RNF-05), pruebas CP-01 a CP-12 | Commits `eb164f4` a `2c18f60`; 61/61 pruebas |
| I5 | 30 oct 2026 | Implementar / Operar | RF-08 fotos de progreso; prueba por interfaz del modo entrenamiento (CP-04b); alineación con la Fase 3; anonimización del historial de Git | Commits `89786b6` y siguientes; `docs/pruebas.md` |

## Incrementos planeados (no ejecutados)

| Incremento | Fase CDIO | Backlog | Criterio de terminado |
|---|---|---|---|
| I6 | Operar | Rotación de credenciales; despliegue en Vercel + Neon; migración en producción; CP-01 a CP-12 contra la URL; prueba con la API real | Condiciones 1 a 4 y 7 de `trl.md` con evidencia |
| I7 | Operar | Teléfonos reales y PWA instalada; tareas T1 a T6 y SUS con 5 a 8 participantes | Condiciones 5 y 6 de `trl.md`; meta ≥ 80 % de tareas sin ayuda, facilidad ≥ 4/5, SUS ≥ 70 |
| I8 | Diseñar / Implementar | Ajustes según la evaluación; recuperación de contraseña; límite de intentos compartido | Cambios con pruebas aprobadas |

## Ceremonias de Scrum

El repositorio no contiene actas de planificación, revisión ni retrospectiva. Si el equipo las
realizó (por ejemplo, por videollamada o chat), debe adjuntar fecha, asistentes y acuerdos en el
anexo correspondiente del documento maestro. No se registran aquí reuniones sin evidencia.

## Prácticas de desarrollo seguro aplicadas

Siguiendo el ciclo de vida ágil de desarrollo seguro (Miguel y Luis Eduardo, 2020) y la propuesta
AEGIS-MD (Amaya Balaguera, 2015): requisitos de seguridad explícitos (RNF-02, RNF-06), revisión de
dependencias (`npm audit`), validación en servidor, aislamiento por usuario probado (CP-12),
minimización de datos enviados a la IA (CP-10), secretos fuera del repositorio y pruebas
automatizadas repetibles antes de cada commit.

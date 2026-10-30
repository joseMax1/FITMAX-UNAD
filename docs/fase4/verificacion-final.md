# Verificación final y lista de chequeo (Fase 4)

Fecha: 30 de octubre de 2026. Versión 0.4.1. Código probado: commit `987c6cc`, en una copia limpia
del repositorio (`git clone`) y una base de datos nueva. Verificación anterior: 28/10/2026, versión
0.4.0, commit `1329b81`, 61 de 61 pruebas.

## Verificación ejecutada

| Paso | Comando | Resultado |
|---|---|---|
| Instalación reproducible | `npm ci` | Correcto (430 paquetes) |
| Vulnerabilidades | `npm audit` | 0 vulnerabilidades |
| Tipos | `npm run typecheck` | Sin errores |
| Estilo y errores comunes | `npm run lint` | 0 errores, 0 advertencias |
| Esquema | `npx prisma validate` | Válido |
| Migraciones en base vacía | `npm run db:migrate` | `0_init` y `1_fotos_progreso` aplicadas; `migrate diff` sin diferencias |
| Compilación | `npm run build` | Correcta |
| Pruebas | `npm test` + `npm run test:e2e` | 63 de 63 aprobadas (17 + 23 + 23), sin reintentos |
| Limpieza de datos de prueba | consulta a la base | 0 usuarios y 0 fotos al terminar |
| Cabeceras | `curl -I /login` | nosniff, `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy, HSTS |
| Secretos | `git grep` en todo el historial (claves `sk-ant-`, `npg_`, cadenas con contraseña, hosts de Neon) | Solo valores de ejemplo de `.env.example`; `.env` ignorado |
| Datos personales | `git log --format='%an %ae'` y búsqueda de correos | Autor genérico `Equipo FITMAX`; sin correos ni teléfonos personales. Los datos de las pruebas son ficticios (`@e2e.fitmax.test`) y la imagen de prueba es sintética |

## Lista de chequeo

| Entregable | Estado |
|---|---|
| Diagnóstico A/B/C/D, cambios frente a la Fase 3 | Hecho (`diagnostico.md`) |
| Requisito RF-08 fotos de progreso | Hecho y probado (CP-08, CP-12) |
| Pruebas CP-01 a CP-12 (más CP-04b) con registro | Hecho (`docs/pruebas.md`) |
| Metodología Scrum + CDIO (ejecutado y planeado) | Hecho; actas de ceremonias **a cargo del equipo** |
| Matriz de trazabilidad RF/RNF | Hecho (`matriz-trazabilidad.xlsx`) |
| Instrumento de usabilidad (T1 a T6, SUS) | Hecho; **sin aplicar** |
| Evaluación TRL | TRL 4 demostrado; TRL 5 **no declarado** |
| README e instrucciones de GitHub | Hecho; **repositorio sin publicar** |
| Guion del video | Hecho; **video sin grabar** |
| Documento maestro Fase 4 (Word) | Hecho, con los enlaces de GitHub y video por completar |

## Requiere acción del equipo

1. Rotar la contraseña de Neon y la API key de Anthropic (expuestas en capturas el 10/10/2026).
2. Publicar el repositorio en GitHub con acceso de lectura para el tutor y pegar el enlace real.
3. Desplegar en Vercel + Neon, probar con la API real y en teléfonos reales, y aplicar la evaluación
   de usabilidad (brecha TRL 5 de `trl.md`).
4. Grabar el video con las dos cámaras encendidas y pegar el enlace.
5. Participar en el foro, comentar los proyectos de compañeros y adjuntar las capturas.

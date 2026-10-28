# Diagnóstico técnico de FITMAX (Fase 4)

Fecha de la auditoría: 28 de octubre de 2026. Base auditada: versión entregada el 9 de octubre de
2026 (commit `42f8284`). Versión resultante: 0.4.0 (commit `203984b`).

Método: revisión del código de las 16 rutas de API, 9 pantallas, middleware, esquema de datos y
Service Worker; `npm audit`; `tsc`; ESLint; ejecución de la app contra PostgreSQL y pruebas
automatizadas en navegador.

## 1. Estado por categoría

**A. Implementado y verificado** (con prueba automatizada aprobada, ver `docs/pruebas.md`)

| Funcionalidad | Evidencia |
|---|---|
| Registro, inicio de sesión y cierre de sesión | CP-01 |
| Protección de rutas y APIs privadas | CP-02 |
| Perfil y metas personalizadas | CP-03 |
| Rutina semanal editable | CP-04 |
| Calendario mensual de entrenamientos | CP-05 |
| Biblioteca de ejercicios con búsqueda y filtro | CP-06 |
| Registro de comidas y totales del día | CP-07 |
| Peso, medidas corporales e historial | CP-08 |
| Hidratación y check-in de recuperación | CP-09 |
| Flujo del asistente y manejo de errores (con simulador) | CP-10 |
| Diseño adaptable escritorio y móvil (emulado) | CP-11 |
| Aislamiento de datos entre usuarios, exportar y borrar cuenta | CP-12 |
| Cálculos (macros, recuperación, fechas en zona Colombia) y validaciones | 17 pruebas unitarias |

**B. Implementado, falta probar**

| Funcionalidad | Qué falta |
|---|---|
| Respuesta real de Claude | Prueba con la API key del equipo |
| Modo entrenamiento (cronómetro, series, terminar sesión) | Prueba por interfaz; hoy el guardado se prueba por API |
| Gráficas de fuerza y volumen, anillos del dashboard | Prueba de los valores mostrados |
| PWA instalable y Service Worker | Instalación en teléfonos reales |
| Despliegue Vercel + Neon | Ejecución en la nube del equipo |
| `iniciar.bat` | Ejecución en Windows |

**C. Incompleto o con limitaciones conocidas**

| Aspecto | Efecto | Recomendación |
|---|---|---|
| Límite de intentos en memoria (`lib/limite.ts`) | En varias instancias serverless cada una cuenta por separado; si la app no está detrás de un proxy, la cabecera `x-forwarded-for` puede falsearse | Almacén compartido (Redis/Upstash) y confiar solo en la IP del proxy de la plataforma |
| Sin política CSP para scripts | Menor defensa en profundidad contra XSS (React ya escapa el contenido) | CSP con nonce en el middleware |
| Sin recuperación de contraseña ni verificación de correo | Un usuario que olvida la clave no puede recuperarla | Flujo con token por correo |
| Valores nutricionales aproximados | Totales orientativos | Citar fuentes (USDA, ICBF) en la interfaz |
| Escritorio como columna centrada | Desaprovecha el ancho en pantallas grandes | Decisión de diseño "móvil primero"; mejorar si la evaluación de usabilidad lo pide |

**D. No implementado**

Módulo de administrador y roles, recuperación de contraseña, notificaciones push, sincronización
sin conexión, integración con relojes o bandas, fotos de progreso, auditoría formal de
accesibilidad (WCAG) y evaluación de usabilidad con participantes.

## 2. Problemas encontrados y corregidos en la Fase 4

Severidad: Crítica (explotable de forma remota o pérdida de datos), Alta, Media, Baja.

| # | Problema | Archivo | Severidad | Efecto | Corrección | Evidencia |
|---|---|---|---|---|---|---|
| 1 | Next.js 14.2.35 con avisos de seguridad críticos (ejecución remota de código en el optimizador de imágenes, SSRF, denegación de servicio, envenenamiento de caché); la rama 14 ya no recibe parches | `package.json` | Crítica | Riesgo de compromiso del servidor | Actualización controlada a Next 15.5.28 y React 19.2.8 (no se actualizaron todos los paquetes); `postcss` anidado forzado a 8.5.32 | `npm audit`: 0 vulnerabilidades; build y 61 pruebas aprobadas. Commit `227b646` |
| 2 | No existía `.gitignore` | raíz | Alta | Riesgo de subir `.env` con claves a GitHub | `.gitignore` que excluye `.env*` (salvo `.env.example`), `node_modules`, `.next`, reportes | Commit `227b646` |
| 3 | Sin límite de intentos en login y registro | `lib/auth.ts`, `app/api/register/route.ts` | Alta | Fuerza bruta de contraseñas y registros masivos | 10 intentos/15 min por IP y correo; 5 registros/hora por IP; bcrypt costo 12 | Prueba unitaria "límite de intentos" |
| 4 | Contraseña mínima de 6 caracteres | `lib/validacion.ts`, `app/register/page.tsx` | Media | Contraseñas débiles | Mínimo 8, máximo 72 (límite de bcrypt) en servidor e interfaz | CP-01c |
| 5 | Validación manual e incompleta de entradas; tipos `any` | APIs de registro, perfil, peso, entrenamientos, rutinas | Media | Datos fuera de rango o corruptos | Esquemas zod en el servidor con mensajes por campo | CP-03, CP-04, CP-08, pruebas unitarias |
| 6 | Rutinas y entrenamientos aceptaban ejercicios de otro usuario | `app/api/rutinas/route.ts`, `app/api/workouts/route.ts` | Media | Referencia a datos ajenos (IDOR) | Solo se aceptan ejercicios globales o propios | CP-12 |
| 7 | El contexto enviado a la IA incluía el nombre del usuario | `app/api/chat/route.ts` | Media | Datos personales innecesarios a un tercero | Se quitó el nombre; se envían solo datos de entrenamiento y salud necesarios para personalizar | CP-10 (revisa la petición enviada) |
| 8 | Sin límite de uso del chat | `app/api/chat/route.ts` | Media | Costos de API sin control | 20 preguntas cada 10 minutos por usuario | Código; prueba unitaria del limitador |
| 9 | Sin cabeceras de seguridad HTTP | `next.config.js` | Media | Clickjacking, rastreo por Referer, MIME sniffing | nosniff, X-Frame-Options, frame-ancestors, Referrer-Policy, Permissions-Policy, HSTS; `no-store` en la API; sin `X-Powered-By` | `curl -I` en la verificación final |
| 10 | Sin forma de descargar ni borrar los datos propios | nuevo `app/api/cuenta/route.ts`, `PerfilClient.tsx` | Media | Incumple derechos de acceso y supresión (Ley 1581 de 2012) | Exportación JSON sin hash y borrado de cuenta con contraseña | CP-12 |
| 11 | Un cuerpo JSON `null` causaba error 500 | 6 rutas de API | Baja | Errores internos ante entradas inesperadas | Se trata como cuerpo vacío y responde 400 | Revisión de código |
| 12 | Búsqueda distinguía tildes ("frijoles" no encontraba "Fríjoles") | `app/api/alimentos/route.ts`, `EntrenarClient.tsx` | Baja | Usuario no encuentra alimentos o ejercicios | Búsqueda normalizada sin tildes (`lib/texto.ts`) | CP-06, CP-07 |
| 13 | Sin ESLint configurado; 18 errores al activarlo | raíz | Baja | Defectos sin detectar | ESLint 9 con reglas de Next; 0 errores, 0 advertencias | `npm run lint` |
| 14 | Sin migraciones versionadas (solo `db push`) | `prisma/` | Baja | Instalación no reproducible | Migración base `0_init` verificada en base vacía | `prisma migrate deploy` + `migrate diff` sin diferencias |
| 15 | Sin pruebas automatizadas | raíz | Media | Regresiones sin detectar | 17 unitarias + CP-01 a CP-12 en dos dispositivos | `docs/pruebas.md` |
| 16 | Pestañas y escalas sin semántica accesible | `components/Tabs.tsx`, `BienestarClient.tsx`, `IAClient.tsx` | Baja | Lectores de pantalla no las anuncian | `role="tab"`, `aria-selected`, `role="group"`, etiqueta "Enviar" | CP-04, CP-09, CP-10 |

## 3. Riesgos que siguen abiertos

1. Credenciales reales expuestas en capturas compartidas en el chat del proyecto el 10 de octubre de
   2026 (contraseña de la base Neon y API key de Anthropic). **Acción del equipo:** rotar ambas
   (Neon: Reset password; Anthropic: revocar y crear una nueva key) antes de publicar o entregar.
2. Límite de intentos por instancia (categoría C).
3. Respuesta real del modelo sin prueba (categoría B).

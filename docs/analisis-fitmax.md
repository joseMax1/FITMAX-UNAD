# FITMAX: análisis del proyecto y esquema propuesto

Fecha: 9 de octubre de 2026

## 1. Qué es hoy la app

**Tipo:** app **web** instalable en el móvil (PWA). Funciona en el navegador del computador, y en Android o iPhone se agrega a la pantalla de inicio como si fuera una app. No es una app de escritorio nativa; en Windows se ejecuta con `iniciar.bat` y se abre en el navegador.

**Tecnología:** Next.js 14 (App Router) + React 18 + Tailwind, Prisma con PostgreSQL (pensado para Neon), NextAuth con correo y contraseña, Recharts para gráficas y la API de Anthropic para el chat.

| Área | Qué hay hoy | Qué le falta |
|---|---|---|
| **Dashboard** (`/dashboard`) | Rutina de hoy, racha, peso actual, nivel por XP, objetivo, frase del día, acceso al chat | Indicadores de la semana (entrenos hechos y la meta), calorías y proteína de hoy, agua de hoy, metas con progreso |
| **Entrenamiento** (`/entrenar`) | Semana fija según días/semana, modo entrenamiento con cronómetro de descanso, registro de series kg×reps, biblioteca de 30 ejercicios fijos en el código | Calendario real (qué días entrenó), rutinas editables, ejercicios propios, récords personales, notas y duración de la sesión |
| **Nutrición** (`/nutricion`) | Cálculo de calorías y macros (Mifflin-St Jeor) y menú económico de texto | **Registro de comidas**, base de alimentos con macros, totales del día frente a la meta |
| **Progreso** (`/progreso`) | Gráfica de peso, registro de peso, últimos 10 entrenamientos | Medidas corporales, % grasa, evolución de fuerza por ejercicio, volumen semanal |
| **Claude** (`/ia`) | Chat con historial guardado por usuario | (Corregido en esta entrega, ver sección 3) |
| **Bienestar** | No existe (el ícono de gota del dashboard no hacía nada) | Hidratación, sueño, check-in diario de recuperación |

**Base de datos actual:** 5 tablas: `User`, `WeightLog`, `WorkoutLog`, `SetLog`, `ChatMessage`. La biblioteca de ejercicios, las rutinas (`SPLITS`) y el menú están escritos directamente en el código (`lib/exercises.ts`, `lib/nutrition.ts`), así que el usuario no puede personalizarlos.

## 2. Errores encontrados y corregidos en esta entrega

| # | Problema | Efecto | Archivo |
|---|---|---|---|
| 1 | `GET /api/profile` devolvía el **hash de la contraseña** | Fuga de datos sensibles | `app/api/profile/route.ts` |
| 2 | El Service Worker guardaba en caché **todas** las páginas y respuestas `/api` | Sin conexión se podían ver datos de otra cuenta usada en el mismo teléfono, o datos viejos | `public/sw.js` |
| 3 | El chat enviaba a la IA los **30 mensajes más antiguos**, no los más recientes | Desde el mensaje 31 el asistente dejaba de ver lo que el usuario escribía | `app/api/chat/route.ts` |
| 4 | Si la IA fallaba, el texto de error se guardaba como si fuera una respuesta, y la pantalla mostraba una burbuja vacía | Historial ensuciado y errores invisibles | chat (API y pantalla) |
| 5 | "Hoy", la racha y las fechas se calculaban con el reloj **UTC** del servidor (Vercel) | Después de las 7 p. m. hora Colombia mostraba la rutina del día siguiente y la racha podía romperse | `lib/fecha.ts` (nuevo), dashboard, entrenar, progreso |
| 6 | Registrar peso no actualizaba el perfil | Macros y asistente usaban para siempre el peso del registro inicial | `app/api/weight/route.ts` |
| 7 | Se podía terminar un entrenamiento **sin series** y sumar XP; repetirlo varias veces el mismo día sumaba XP cada vez | XP inflada | `app/api/workouts/route.ts` |
| 8 | El correo distinguía mayúsculas (`Max@x.com` ≠ `max@x.com`) | No podía iniciar sesión con otra capitalización | registro y login |
| 9 | Sin validación de números (peso "abc", días/semana fuera de 2-6) | Datos corruptos | APIs de peso, perfil y registro |
| 10 | Al terminar entrenamiento no había manejo de error ni refresco | Si fallaba la red se perdía la sesión sin aviso | `EntrenarClient.tsx` |
| 11 | La biblioteca mostraba solo 10 de 30 ejercicios | Ejercicios ocultos | ahora con filtro por grupo muscular |
| 12 | Campos kg/reps/peso sin teclado numérico en el móvil, ejes de la gráfica ilegibles en el tema oscuro, ícono de gota para "Meta" | Detalles de UX | varios |

**Copiloto → Claude:** se quitó el "Copiloto" y el chat ahora es **Mi Claude**. Usa el SDK oficial `@anthropic-ai/sdk` con el modelo `claude-opus-5-5`, configurable con `ANTHROPIC_MODEL` en `.env`. Claude recibe el contexto del usuario (perfil, rutina de hoy, racha, último entrenamiento, meta de macros). Los errores se muestran claros (falta la API key, key inválida, límite de uso) y el mensaje vuelve al campo de texto para reintentar. Si los filtros de seguridad rechazan una pregunta, la API la reintenta sola con el modelo de respaldo recomendado (`fallbacks: "default"`).

**Verificación:** `tsc` sin errores, `next build` correcto, y una prueba de punta a punta contra PostgreSQL local: registro, login, perfil sin hash, peso válido e inválido, entrenamiento sin series rechazado, XP solo una vez por día, todas las páginas responden 200, y el chat responde con el mensaje correcto sin key o con key inválida. **No probé una respuesta real de Claude** porque no tengo tu API key. Pruébalo con la tuya.

## 3. Esquema propuesto para las 6 áreas

Archivo completo y validado: [`schema-propuesto.prisma`](schema-propuesto.prisma). Es **solo aditivo**: no borra ninguna tabla ni columna con datos. Lo comprobé con `prisma migrate diff`, y lo único que "elimina" son 3 índices simples que se reemplazan por índices compuestos más rápidos.

```
User ─┬─ WeightLog            (peso, ya existe)
      ├─ BodyMeasurement      NUEVA  cintura, cadera, pecho, brazo, muslo, cuello, % grasa
      ├─ Routine ── RoutineDay ── RoutineExercise ── Exercise
      ├─ WorkoutLog ── SetLog ─────────────────────── Exercise   (+ duración, notas, RPE)
      ├─ Exercise             NUEVA  biblioteca: globales (userId null) + propios
      ├─ Food                 NUEVA  alimentos con macros: globales + propios
      ├─ MealLog ── MealItem ── Food                 NUEVA  comidas del día por tipo
      ├─ WaterLog             NUEVA  agua (ml) por día
      ├─ WellnessLog          NUEVA  sueño, energía, estrés, dolor muscular (1 por día)
      └─ ChatMessage          (+ modelo y tokens usados, para controlar el costo)
```

Columnas nuevas en `User` para las metas del Dashboard: `pesoObjetivo`, `metaAguaMl` (2500), `metaSuenoH` (8), `metaKcal` y `metaProteina` (opcionales; si están vacías se usan los macros calculados).

**Decisiones de diseño:**
- Los registros diarios (comidas, agua, bienestar) guardan `fecha` como texto `"YYYY-MM-DD"` en la zona de la app. Así "lo de hoy" no depende del servidor.
- `MealItem` **copia** los macros al registrar, para que editar un alimento no cambie el historial.
- `SetLog` mantiene el nombre del ejercicio y agrega `exerciseId` opcional, así los entrenamientos ya guardados siguen funcionando.
- Los récords personales y el volumen semanal **se calculan** a partir de `SetLog`; no necesitan tabla propia.

## 4. Implementado (versión 2)

| Área | Pantallas | APIs |
|---|---|---|
| Dashboard | `/dashboard`: rutina de hoy (o "hecho"), anillos de semana, kcal, proteína y agua, racha, peso frente al objetivo, nivel con barra de XP, recuperación | `GET /api/resumen` |
| Entrenamiento | `/entrenar` con pestañas Semana · Calendario · Rutina (editor por día) · Ejercicios (buscador, récord, 1RM estimado, últimas sesiones, ejercicios propios). Modo entrenamiento con peso sugerido de la última vez, quitar series, RPE, notas y duración | `/api/rutinas`, `/api/ejercicios`, `/api/workouts?mes=` |
| Nutrición | `/nutricion`: navegación por días, totales frente a la meta, 6 tipos de comida, buscador de 70 alimentos colombianos, alimentos propios | `/api/comidas`, `/api/alimentos` |
| Progreso | `/progreso` con pestañas Peso (con línea de objetivo) · Medidas · Fuerza · Volumen · Historial | `/api/medidas`, `/api/weight` |
| Bienestar | `/bienestar`: agua con botones de +250/+500/+750 ml, check-in diario y puntaje de recuperación 1-5 con sugerencia, gráficas de sueño y agua de 7 días | `/api/agua`, `/api/bienestar` |
| Claude | `/ia` y botón flotante en todas las pantallas. Respuesta en streaming, contexto con rutina, comidas, agua y check-in de hoy. Guarda el modelo y los tokens de cada respuesta | `/api/chat` |
| Perfil | `/perfil` (tocando tu nombre): datos y metas (peso objetivo, kcal, proteína, agua, sueño) | `/api/profile` |

La barra inferior quedó como Inicio · Entrenar · Nutrición · Progreso · Bienestar, y Claude es el botón flotante.

**Verificado:** `tsc` y `next build` sin errores. Migración sobre una base con datos de la versión 1 sin pérdidas. Probé todas las APIs (casos válidos e inválidos), las 7 pantallas en un navegador con tamaño de móvil, y el chat en streaming contra un servidor simulado de Anthropic (incluido el caso de rechazo). La única pieza sin probar contra la API real es la respuesta de Claude, porque requiere tu API key.

**Limitaciones conocidas:** el buscador de alimentos distingue tildes ("frijoles" no encuentra "Fríjoles"). Los valores nutricionales son aproximados (tablas USDA e ICBF).

## 5. Notas

- **Costo de Claude:** `claude-opus-5-5` es el más capaz. Para que el chat cueste menos, cambia `ANTHROPIC_MODEL` en `.env` a `"claude-sonnet-5-5"` o `"claude-haiku-5-5"`; no hace falta tocar el código.
- **Base de datos en tu PC:** el `.bat` usa la `DATABASE_URL` del `.env`. Con Neon puedes usar la misma base en el PC y en Vercel.

# FITMAX

Aplicación web progresiva (PWA) de entrenamiento, nutrición, progreso y bienestar, con un asistente
basado en Claude (Anthropic). Proyecto de grado, Fase 4. Versión 0.4.0.

> Este repositorio **no contiene secretos**. Las credenciales van en un archivo `.env` local que
> Git ignora. Usa `.env.example` como plantilla.

## Funcionalidades

| Módulo | Ruta | Qué hace |
|---|---|---|
| Acceso | `/login`, `/register` | Registro e inicio de sesión con correo y contraseña (mínimo 8 caracteres, bcrypt, límite de intentos) |
| Inicio | `/dashboard` | Rutina de hoy, metas del día (entrenos, kcal, proteína, agua), racha, peso, nivel, recuperación |
| Entrenar | `/entrenar` | Semana, calendario mensual, editor de rutina, biblioteca de 30 ejercicios con búsqueda y filtro, modo entrenamiento |
| Nutrición | `/nutricion` | Registro de comidas por día y tipo, 70 alimentos colombianos, alimentos propios, totales frente a la meta |
| Progreso | `/progreso` | Peso, medidas corporales, fuerza (1RM estimado), volumen semanal e historial |
| Bienestar | `/bienestar` | Hidratación y check-in diario de sueño, energía, estrés y dolor con puntaje de recuperación |
| Mi Claude | `/ia` y botón flotante | Chat en tiempo real con contexto de la rutina, comidas, agua y descanso del día |
| Perfil | `/perfil` | Datos, metas, descarga de mis datos (JSON) y eliminación de la cuenta |

## Arquitectura

```
Navegador (PWA, React 19)
   │  páginas App Router (servidor) + componentes cliente
   ▼
Next.js 15 (Node.js)
   ├─ middleware.ts ............ exige sesión en las rutas privadas
   ├─ app/api/* ................ API REST; cada consulta filtra por el userId de la sesión
   │    └─ lib/validacion.ts ... validación con zod en el servidor
   ├─ lib/auth.ts .............. NextAuth (JWT, credenciales) + límite de intentos
   ├─ lib/claude.ts ............ SDK oficial de Anthropic (streaming)
   ▼
Prisma ORM ──► PostgreSQL (Neon en producción)
```

- **Datos:** 15 modelos (`prisma/schema.prisma`). Los registros diarios usan la fecha `YYYY-MM-DD`
  en la zona `APP_TZ` (Colombia por defecto).
- **Privacidad:** el asistente recibe solo los datos necesarios para personalizar (sin nombre, correo
  ni identificadores). El Service Worker solo guarda archivos estáticos, nunca respuestas de la API.
- **Seguridad:** cabeceras HTTP (nosniff, frame-ancestors, Referrer-Policy, Permissions-Policy,
  HSTS), `Cache-Control: no-store` en la API, límite de intentos en login, registro, chat y borrado
  de cuenta.

## Requisitos

- Node.js 20.9 o superior (probado con 22.22).
- PostgreSQL 14 o superior (probado con 16; en producción, Neon).
- Una API key de Anthropic solo si se quiere usar el chat real.

## Variables de entorno

Copia `.env.example` a `.env` y complétalo:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión de PostgreSQL |
| `NEXTAUTH_SECRET` | Sí | Texto aleatorio largo (por ejemplo `openssl rand -hex 32`) |
| `NEXTAUTH_URL` | Sí | URL pública de la app (`http://localhost:3000` en local) |
| `ANTHROPIC_API_KEY` | No | Sin ella toda la app funciona y el chat muestra un aviso |
| `ANTHROPIC_MODEL` | No | Modelo de Claude; por defecto `claude-opus-5-5` |
| `APP_TZ` | No | Zona horaria; por defecto `America/Bogota` |

## Instalación y ejecución

```bash
npm ci                    # instala exactamente las versiones del package-lock.json
npm run db:migrate        # crea las tablas (prisma migrate deploy)
npm run dev               # desarrollo en http://localhost:3000
# o en modo producción:
npm run build && npm start
```

**Base de datos creada antes con `prisma db push`** (versiones anteriores o `iniciar.bat`): márcala
una sola vez como migrada con `npx prisma migrate resolve --applied 0_init`; después usa
`npm run db:migrate`.

**Windows con doble clic:** `iniciar.bat` revisa Node.js y el `.env`, instala dependencias, sincroniza
las tablas y abre el navegador.

## Calidad y pruebas

```bash
npm run typecheck         # TypeScript sin errores
npm run lint              # ESLint (next/core-web-vitals + next/typescript)
npm test                  # 17 pruebas unitarias (no necesitan base de datos)
npm run test:e2e          # CP-01 a CP-12 en escritorio y móvil (ver docs/pruebas.md)
```

Las pruebas de punta a punta necesitan la app corriendo contra una base de datos **de prueba** y el
servidor simulado de Anthropic (`npm run mock:ia`), de modo que no se gasta ni se expone una API key
real. El procedimiento completo, la matriz de casos y el último registro de ejecución están en
[`docs/pruebas.md`](docs/pruebas.md).

| Caso | Qué se comprueba |
|---|---|
| CP-01 | Login válido, contraseña incorrecta, registro con contraseña corta y válida |
| CP-02 | Rutas y APIs privadas sin sesión (redirección y 401) |
| CP-03 | Editar, guardar y recuperar el perfil; validación de rangos en el servidor |
| CP-04 | Configurar la rutina semanal y verla en la semana |
| CP-05 | Navegar el calendario por meses y ver un entrenamiento |
| CP-06 | Buscar (sin tildes) y filtrar ejercicios |
| CP-07 | Registrar un alimento y ver los totales del día |
| CP-08 | Registrar peso y medidas y verlos en el historial |
| CP-09 | Hidratación y check-in de bienestar |
| CP-10 | Asistente: respuesta, rechazo, API key inválida, sin API key, datos enviados |
| CP-11 | Pantallas en escritorio (1280×720) y móvil (Pixel 7) sin desbordes |
| CP-12 | Aislamiento entre usuarios (no hay módulo de administrador; ver docs/pruebas.md) |

## Estructura

```
app/            páginas y API (App Router)
components/     componentes de interfaz compartidos
lib/            lógica: auth, validación, fechas, nutrición, Claude, semillas
prisma/         esquema y migraciones
public/         manifest, íconos y Service Worker
tests/          unitarias, e2e (Playwright) y simulador de Anthropic
docs/           diagnóstico, pruebas y documentación de la Fase 4
```

## Despliegue (Vercel + Neon)

1. Crea la base en Neon y copia su cadena de conexión.
2. Importa el repositorio en Vercel y define `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` y,
   si se usará el chat, `ANTHROPIC_API_KEY`.
3. Desde tu equipo, con el `.env` apuntando a esa base, ejecuta `npm run db:migrate`.
4. La app se instala en el teléfono desde el navegador (Android: menú, "Instalar app"; iPhone:
   compartir, "Añadir a pantalla de inicio").

## Limitaciones conocidas

- El límite de intentos se guarda en memoria: en un despliegue con varias instancias cada una cuenta
  por separado. Para producción a escala se recomienda un almacén compartido (por ejemplo Redis).
- No hay recuperación de contraseña por correo ni verificación de correo.
- Los valores nutricionales son aproximados (tablas USDA e ICBF) y la app no reemplaza a un
  profesional de la salud.
- La respuesta real de Claude no está cubierta por las pruebas automáticas (se usa un simulador).
- En escritorio la interfaz se muestra como una columna centrada (diseño pensado primero para móvil).

## Licencia

Proyecto académico. Definir licencia antes de publicar el repositorio.

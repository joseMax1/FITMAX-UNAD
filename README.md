# FITMAX

App web (PWA) de entrenamiento, nutrición y asistente Claude. Next.js 14 + Prisma + PostgreSQL + NextAuth
+ SDK oficial de Anthropic (`@anthropic-ai/sdk`).

## 0. Ejecutar en Windows con un doble clic

1. Instala **Node.js LTS** desde https://nodejs.org (solo una vez).
2. Haz doble clic en **`iniciar.bat`**.
   - La primera vez crea el archivo `.env` y lo abre en el Bloc de notas: completa `DATABASE_URL`
     (el connection string de Neon, ver paso 3), `NEXTAUTH_SECRET` (cualquier texto largo) y
     `ANTHROPIC_API_KEY` (tu key de console.anthropic.com). Guarda y vuelve a abrir `iniciar.bat`.
   - Luego instala dependencias, crea las tablas y abre http://localhost:3000 en el navegador.
3. Para detener la app, cierra la ventana negra.

Variables opcionales en `.env`: `ANTHROPIC_MODEL` (por defecto `claude-opus-5-5`) y `APP_TZ`
(por defecto `America/Bogota`, define qué es "hoy" para la rutina y la racha).

---

## Qué incluye

- **Inicio:** rutina de hoy, anillos de metas (entrenos de la semana, kcal, proteína, agua), racha, peso frente al objetivo, nivel y recuperación.
- **Entrenar:** semana, calendario mensual de sesiones, editor de rutina, biblioteca de ejercicios con récords y ejercicios propios, modo entrenamiento con cronómetro, RPE y notas.
- **Nutrición:** registro de comidas por día y tipo, buscador de alimentos colombianos con macros, alimentos propios, totales frente a la meta.
- **Progreso:** peso, medidas corporales, fuerza (1RM estimado por ejercicio), volumen semanal e historial.
- **Bienestar:** agua con un toque y check-in diario de sueño, energía, estrés y dolor muscular con puntaje de recuperación.
- **Mi Claude** (botón flotante): chat con respuestas en tiempo real, que conoce tu rutina, tus comidas, tu agua y tu descanso de hoy.
- **Perfil** (toca tu nombre arriba): datos y metas personalizadas.

La biblioteca de ejercicios y alimentos se carga sola la primera vez que se abre la app.

---

## 1. Qué necesitas (todo gratis)

1. Una cuenta en **GitHub** (github.com) — gratis.
2. Una cuenta en **Vercel** (vercel.com) — gratis, puedes entrar con tu cuenta de GitHub.
3. Una base de datos Postgres gratis en **Neon** (neon.tech) — plan gratuito, no pide tarjeta.
4. Una **API key de Anthropic** (console.anthropic.com) para que el asistente Claude funcione. Esto sí tiene costo
   de uso (muy bajo, por mensaje), no es parte del hosting gratis. Si no la agregas, toda la app funciona
   igual, solo el chat con Claude no responderá.

## 2. Subir el proyecto a GitHub

1. Descomprime el archivo `fitmax-web.zip` que te compartí.
2. Ve a github.com → **New repository** → nómbralo `fitmax` → créalo vacío (sin README).
3. En tu computador, dentro de la carpeta del proyecto:
   ```
   git init
   git add .
   git commit -m "FITMAX inicial"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/fitmax.git
   git push -u origin main
   ```
   (Si no tienes `git` instalado o prefieres no usar la terminal, GitHub Desktop hace lo mismo con clics.)

## 3. Crear la base de datos gratis en Neon

1. Entra a neon.tech → crea cuenta → **New Project**.
2. Copia el **Connection string** que te dan (empieza con `postgresql://...`).
3. Guárdalo, lo vas a pegar en Vercel en el paso siguiente como `DATABASE_URL`.

## 4. Desplegar en Vercel

1. Entra a vercel.com → **Add New → Project** → importa el repositorio `fitmax` que subiste.
2. En **Environment Variables**, agrega:
   - `DATABASE_URL` → el connection string de Neon.
   - `NEXTAUTH_SECRET` → cualquier texto largo aleatorio (puedes generarlo en
     https://generate-secret.vercel.app/32).
   - `NEXTAUTH_URL` → la URL que Vercel te va a asignar, algo como `https://fitmax-tuusuario.vercel.app`
     (si aún no la sabes, despliega primero, cópiala, y vuelve a poner esta variable después).
   - `ANTHROPIC_API_KEY` → tu API key de Anthropic (para el chat con Claude).
3. Dale a **Deploy**. Vercel instala todo y construye el proyecto solo.

## 5. Crear las tablas en la base de datos

Después del primer deploy, necesitas crear las tablas en Neon. Desde tu computador, con el proyecto
descargado y las variables de entorno en un archivo `.env` (copia `.env.example` y complétalo con los
mismos valores que pusiste en Vercel):

```
npm install
npx prisma db push
```

Esto crea todas las tablas (usuarios, rutinas, entrenamientos, comidas, medidas, agua, bienestar, chat) en tu base de datos de Neon.
Si ya tenías la versión anterior con datos, este comando solo agrega tablas y columnas nuevas: no borra nada.
Solo se hace una vez (y de nuevo cada vez que cambies el `schema.prisma`).

## 6. Listo

Entra a tu URL de Vercel, crea la cuenta de MAX, cierra sesión, crea la cuenta de la segunda persona.
Cada quien ve solo sus propios datos — está separado a nivel de base de datos, no es solo de apariencia.

---

## 7. Instalar en el teléfono (Android e iPhone)

Ya es una PWA instalable sin nada adicional:

- **Android (Chrome):** entra a la URL → menú (⋮) → "Instalar app" o "Añadir a pantalla de inicio".
- **iPhone (Safari):** entra a la URL → botón compartir → "Añadir a pantalla de inicio".

Esto la pone como un ícono normal en el teléfono, pantalla completa, sin barra del navegador.

## 8. Publicarla en Google Play y App Store (la parte que no es gratis del todo)

Esto ya no depende de Vercel ni de mí desde este chat — son procesos que tú ejecutas con herramientas
en tu computador. Lo importante para que sepas qué esperar:

- **Android / Google Play:** se envuelve la PWA con **Bubblewrap** o **PWABuilder** (pwabuilder.com,
  gratis) para generar un `.aab`. Google Play Console cobra **una sola vez USD 25** para poder publicar
  apps de por vida. No hay forma de evitar ese pago si quieres estar en la tienda oficial.
- **iPhone / App Store:** Apple exige una cuenta de **Apple Developer, USD 99 al año**, y normalmente un
  Mac con Xcode para compilar (si no tienes Mac, servicios como Codemagic o Ionic Appflow compilan en la
  nube por ti). Se suele envolver la web con **Capacitor** para convertirla en app nativa instalable.
  Este costo tampoco se puede evitar si quieres estar en la App Store — es una política de Apple, no mía.

Si quieres, cuando tengas la web ya funcionando y probada en Vercel, seguimos con el paso de Capacitor
para generar los proyectos de Android/iOS listos para subir a las tiendas.

## 9. Qué falta del documento original y por qué

- **Notificaciones push reales del sistema:** son posibles con Web Push (`web-push` + Service Worker),
  pero requieren que el usuario acepte permisos y algo de configuración adicional (VAPID keys). No
  las incluí en este MVP para no bloquear el despliegue; se agregan después sin rehacer nada.
- **Panel de administrador, fotos de progreso, videos, gamificación avanzada:** quedaron fuera del MVP
  a propósito — son la fase 2 una vez que confirmes que la base (auth + rutinas + nutrición + progreso +
  IA) funciona bien en producción con ustedes dos usándola.

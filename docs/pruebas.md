# Pruebas de FITMAX: procedimiento y registro de ejecución

## 1. Cómo ejecutar las pruebas

Las pruebas usan Playwright 1.56.1 (`@playwright/test`) tanto para las unitarias como para las de
punta a punta. **Nunca ejecutes las pruebas de punta a punta contra la base de producción**: crean
cuentas con el dominio reservado `e2e.fitmax.test` y las borran al terminar.

```bash
# 0) Una base PostgreSQL vacía solo para pruebas, en .env:
#    DATABASE_URL="postgresql://.../fitmax_e2e"   NEXTAUTH_URL="http://localhost:3000"
#    ANTHROPIC_API_KEY="cualquier-texto"           (el simulador no la valida)
npm ci
npm run db:migrate
npm run build

# 1) Simulador de la API de Anthropic (terminal 1)
npm run mock:ia

# 2) App apuntando al simulador (terminal 2)
#    PowerShell: $env:ANTHROPIC_BASE_URL="http://localhost:4010"; npm start
ANTHROPIC_BASE_URL=http://localhost:4010 npm start

# 3) Opcional, para el caso "sin API key": segunda instancia sin clave (terminal 3)
ANTHROPIC_API_KEY= NEXTAUTH_URL=http://localhost:3001 npx next start -p 3001

# 4) Pruebas (terminal 4)
npm test                                            # unitarias
E2E_SIN_CLAVE_URL=http://localhost:3001 npm run test:e2e
npx playwright show-report                          # reporte HTML con capturas
```

Si la máquina no tiene el navegador de Playwright: `npx playwright install chromium`.

Salidas: `playwright-report/` (reporte HTML), `test-results/resultados.json` (resultado de cada caso),
`test-results/evidencias/<escritorio|movil>/*.png` (capturas de cada caso).

## 2. Entorno de la ejecución registrada

| Campo | Valor |
|---|---|
| Fecha y hora | 30 de octubre de 2026, pruebas de punta a punta desde 22:40:55 UTC (17:40 hora Colombia), duración 67 s |
| Versión | 0.4.1, commit `987c6cc`, en una copia limpia del repositorio (`git clone`) |
| Sistema | Linux 6.18 (contenedor de desarrollo en la nube), Node.js 22.22.0 |
| Base de datos | PostgreSQL 16.15 local, base nueva y vacía `fitmax_v4` creada con `prisma migrate deploy` (migraciones `0_init` y `1_fotos_progreso`) |
| Navegador | Chromium 141.0.7390.37 (Playwright 1.56.1), sin interfaz gráfica |
| Dispositivos | "escritorio": Desktop Chrome 1280×720. "movil": Pixel 7 emulado, 412×915, táctil |
| IA | Servidor simulado `tests/mocks/anthropic-simulado.mjs`; **no** se usó la API real de Anthropic |
| Datos de prueba | Cuentas generadas por la suite (`u…@e2e.fitmax.test`, contraseña de prueba definida en `tests/e2e/utilidades.ts`), perfil: mujer, 28 años, 62 kg, 165 cm, hipertrofia, 4 días |
| Ejecutó | Claude (asistente de IA) en el entorno de desarrollo del proyecto, a solicitud del equipo |

Antes de las pruebas, en la misma ejecución: `npm ci` sin errores, `npm audit` con 0
vulnerabilidades, `tsc --noEmit` sin errores, ESLint sin errores ni advertencias, `prisma validate`
correcto, migraciones aplicadas en base vacía, `prisma migrate diff` sin diferencias entre la base y el
esquema y `next build` correcto.

**Resultado global: 63 de 63 pruebas aprobadas** (17 unitarias, 23 en escritorio y 23 en móvil), 0
omitidas, 0 inestables, sin reintentos. Al terminar, la base de prueba quedó con 0 usuarios y 0
fotos (la limpieza automática borró las cuentas de prueba).

Registro anterior: 28 de octubre de 2026, versión 0.4.0 (commit `1329b81`), 61 de 61 aprobadas.

## 3. Registro por caso

Estado: **Aprobado** = se ejecutó y se cumplió todo lo esperado en escritorio y en móvil.

| ID | Pasos (resumen) | Resultado esperado | Resultado observado | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-01 | a) Ingresar correo y contraseña válidos. b) Contraseña incorrecta. c) Registro con "corta" y luego con 8+ caracteres | a) Llega a /dashboard con su nombre. b) "Correo o contraseña incorrectos" y sigue en /login. c) El navegador bloquea la contraseña corta; con la válida crea la cuenta y entra | Igual a lo esperado en ambos dispositivos | Aprobado | CP-01a, CP-01b, CP-01c |
| CP-02 | Sin sesión, abrir /dashboard, /entrenar, /nutricion, /progreso, /bienestar, /perfil, /ia y llamar 14 rutas de la API (incluye `/api/fotos`) | Redirección a /login; la API responde 401 sin datos | 7 de 7 rutas redirigen; 14 de 14 llamadas responden 401 y ninguna contiene `passwordHash` | Aprobado | Reporte HTML |
| CP-03 | Perfil: cambiar nombre, peso objetivo 58,5 y agua 3000; guardar; recargar. Enviar edad 5 a la API | "Guardado ✓"; los valores persisten; la API rechaza la edad con 400 | Valores recuperados tras recargar; 400 con mensaje sobre "edad"; la respuesta del perfil no incluye el hash | Aprobado | CP-03 |
| CP-04 | Rutina: abrir sábado (descanso), nombrarlo "Full body E2E", agregar Press banca y Dominadas, guardar, recargar y ver la semana. Enviar dos días repetidos a la API | "Rutina guardada ✓" y el sábado aparece con sus ejercicios; la API rechaza días repetidos | Igual a lo esperado; la API respondió 400 | Aprobado | CP-04 |
| CP-04b | Lunes: Iniciar modo entrenamiento, registrar una serie de 40 kg × 10, saltar el descanso, avanzar por los ejercicios, terminar y guardar | Aparece el descanso; la sesión queda guardada con la serie registrada | La API del mes devuelve 1 entrenamiento con la serie 40 × 10 | Aprobado | CP-04b |
| CP-05 | Registrar un entrenamiento (API), abrir Calendario, tocar el día de hoy, ir al mes siguiente y a dos meses atrás | Mes actual con "1 días entrenados", detalle 60×8, 60×8; los encabezados cambian de mes | Igual a lo esperado | Aprobado | CP-05 (2 capturas) |
| CP-06 | Ejercicios: buscar "jalon" (sin tilde), luego filtrar por Pecho y buscar un texto inexistente | 30 ejercicios al inicio; 1 resultado "Jalón al pecho"; solo Pecho; 0 resultados | Igual a lo esperado | Aprobado | CP-06 (2 capturas) |
| CP-07 | Nutrición: Agregar en Desayuno, buscar "frijoles", elegir "Fríjoles rojos cocidos", 200 g, agregar, recargar. Enviar gramos negativos | Vista previa 254 kcal; total del día 254; persiste; la API rechaza con 400 | Igual a lo esperado | Aprobado | CP-07 |
| CP-08 | Progreso: peso "abc", luego 61,5 y 61; Medidas: cintura 72 y grasa 24,5; recargar. Fotos: subir una imagen sintética con nota "Semana 1"; enviar un archivo que no es imagen; borrar la foto | Error con "abc"; peso actual 61 kg y gráfica; medidas en el historial; perfil con peso 61; "Foto guardada ✓" y la imagen se muestra; el archivo falso se rechaza con 400; la foto se borra | Igual a lo esperado | Aprobado | CP-08 (3 capturas) |
| CP-09 | Bienestar: +250 y +500 ml; check-in 7,5 h, calidad 4, energía 4, estrés 2, dolor 2; guardar; recargar. Enviar 99 999 ml | 750 / 2500 ml; "Check-in guardado ✓"; puntaje 4 / 5; la API rechaza la cantidad | Igual a lo esperado | Aprobado | CP-09 |
| CP-10 | Chat: pregunta normal, recargar; revisar la petición enviada; mensaje que provoca rechazo; mensaje que provoca 401; mensaje vacío y de 4001 caracteres; instancia sin API key | Respuesta en streaming guardada; aviso visible de qué datos recibe el asistente; la petición no incluye nombre, correo ni id; avisos claros sin detalles internos; la pregunta vuelve al campo; 400 en entradas inválidas; aviso de configuración sin clave | Igual a lo esperado. El historial guarda solo la conversación exitosa | Aprobado (con simulador) | CP-10a, CP-10b, CP-10c |
| CP-11 | Con sesión, abrir las 7 pantallas en escritorio y en móvil | Sin desbordes horizontales; barra inferior visible | Ancho del contenido ≤ ancho de la vista en las 14 combinaciones | Aprobado | CP-11 (7 capturas por dispositivo) |
| CP-12 | Usuaria A crea alimento, comida, ejercicio, medida, agua y una foto de progreso. Usuario B intenta borrarlos, verlos y usarlos; exporta sus datos; prueba /admin, /api/admin, /api/users; borra su cuenta con clave incorrecta y correcta | B recibe 404 (también al ver o borrar la foto de A) y los datos de A siguen intactos; B no ve ni usa datos de A; su exportación solo tiene datos suyos; no hay rutas administrativas; borrar exige la contraseña y no afecta a A | Igual a lo esperado | Aprobado (adaptado) | Reporte HTML |

**CP-12 adaptado:** FITMAX no tiene rol ni panel de administrador. En lugar de "acceso de administrador
sin autorización" se probó el riesgo equivalente en esta arquitectura: acceso de un usuario
autenticado a datos de otro (IDOR) y la ausencia de rutas administrativas expuestas.

**CP-10 con simulador:** el caso valida el flujo de la app, el manejo de errores y la minimización de
datos. **No** demuestra la calidad de las respuestas de Claude ni la conexión con la API real, que
requiere la API key del equipo (pendiente, ver sección 5).

## 4. Incidentes y reprueba

Durante la primera ejecución en escritorio (28/10/2026, ~23:27 UTC, antes del commit `31a5679`)
fallaron 3 casos. Ninguno era un defecto de la app; se corrigieron y se volvieron a ejecutar:

| Caso | Qué falló | Causa | Corrección | Reprueba |
|---|---|---|---|---|
| CP-09 | La prueba no encontraba los botones 1-5 del check-in | Las escalas no tenían una etiqueta accesible que las agrupara | Se agregó `role="group"` y `aria-label` a cada escala (mejora de accesibilidad en `BienestarClient.tsx`) | Aprobado |
| CP-10 | Tras recargar no aparecía la respuesta | La prueba recargaba antes de que el servidor terminara de guardar la conversación (se guarda al cerrar el stream) | La prueba espera a que el historial tenga los 2 mensajes antes de recargar | Aprobado |
| CP-12 | La exportación de B contenía el texto "Ejercicio privado A" | Error en los datos de la prueba: B registró un entrenamiento propio con ese nombre | La serie de B usa otro nombre; el aislamiento ya funcionaba (el `exerciseId` de A se descartó) | Aprobado |

En la ejecución registrada del 30/10/2026 no hubo fallos. Los incidentes anteriores se conservan
como historial.

## 5. Lo que no se ha probado todavía

| Aspecto | Por qué | Cómo cerrarlo |
|---|---|---|
| Respuesta real de Claude | Requiere la API key del equipo; no se usa ni se expone en este entorno | Con la key en `.env`, hacer 3 preguntas en /ia y registrar fecha, modelo y resultado |
| Despliegue en Vercel + Neon | Requiere las cuentas del equipo | Desplegar, ejecutar `npm run db:migrate` y repetir CP-01, CP-02 y CP-10 sobre la URL pública |
| Dispositivos físicos | Se usó emulación de Pixel 7 | Repetir CP-11 en un Android y un iPhone reales e instalar la PWA |
| `iniciar.bat` en Windows | El entorno de pruebas es Linux | Ejecutar en un PC con Windows y registrar el resultado |
| Usabilidad con personas | No hay participantes todavía | Aplicar `docs/fase4/usabilidad-sus.md` y registrar los resultados reales |

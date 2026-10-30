# Guion del video de la Fase 4 (máximo 10 minutos)

Requisitos de la guía: **los dos integrantes, Maximiliano José de León Cera y Fabián Enrique Herrera
Zabala, aparecen con la cámara encendida durante todo el video** (cámara en una esquina mientras se
comparte la pantalla); duración máxima de 10 minutos; el enlace va en el anexo del documento
maestro. Grabar en 1080p con una cuenta de demostración (no una cuenta personal) y **sin mostrar el
archivo `.env`, el panel de Neon con la contraseña ni ninguna clave**.

| Tiempo | Sección | Quién habla | Qué se muestra | Qué se dice (ideas clave) |
|---|---|---|---|---|
| 0:00-0:40 | Presentación | Maximiliano y Fabián | Ambos en cámara; portada del documento | Nombres, programa de Ingeniería de Sistemas, curso Proyecto de grado, Fase 4; problema: información de entrenamiento, nutrición y progreso fragmentada en varias herramientas |
| 0:40-1:30 | Objetivos y lo que cambió desde la Fase 3 | Maximiliano | Objetivos OE1-OE5; tabla de cambios del diagnóstico | Qué se propuso en la Fase 3 y qué se hizo en la Fase 4 (fotos de progreso, seguridad, pruebas) |
| 1:30-2:40 | Metodología Scrum + CDIO | Fabián (Scrum Master) | Roles, Definición de Terminado, tabla de incrementos I1 a I5 y planeados I6 a I8 | Cómo se organizó el trabajo; qué incrementos tienen evidencia en Git |
| 2:40-3:30 | Diseño integral | Fabián | Diagrama de arquitectura y modelo de datos del documento | Next.js + API + Prisma + PostgreSQL + Claude; aislamiento por usuario; datos mínimos a la IA |
| 3:30-6:30 | Demostración funcional | Maximiliano maneja, Fabián narra | Login → Inicio → Entrenar (semana, calendario, ejercicios, modo entrenamiento) → Nutrición (registrar un alimento) → Progreso (peso, medidas, foto de progreso) → Bienestar (agua y check-in) → Mi Claude → Perfil (descargar mis datos) | Qué resuelve cada módulo; relación con RF-01 a RF-11 |
| 6:30-7:20 | Seguridad y privacidad | Fabián | Abrir /dashboard sin sesión; cabeceras en las herramientas del navegador; aviso de privacidad de las fotos | Rutas protegidas, límite de intentos, fotos solo del dueño, Ley 1581 de 2012 |
| 7:20-8:40 | Pruebas | Maximiliano | Terminal con `npm test` y `npm run test:e2e` o el reporte HTML; `docs/pruebas.md` | 63 de 63 pruebas aprobadas el 30/10/2026 en escritorio y móvil emulado; CP-10 con simulador; qué falta probar |
| 8:40-9:30 | TRL y usabilidad | Fabián | Tabla de `trl.md`; hoja SUS | TRL 4 demostrado; condiciones pendientes para TRL 5; resultados SUS solo si ya se aplicó con participantes reales |
| 9:30-10:00 | Conclusiones | Ambos | Ambos en cámara | Logros, limitaciones y siguientes pasos |

Consejos: ensayar con cronómetro; cargar los datos de demostración antes de grabar; si el chat real no
está configurado o no se desplegó la app, decirlo y mostrar el aviso controlado en lugar de simular
una respuesta. Si se logra el despliegue y las pruebas de la brecha TRL 5 antes de grabar, mostrar la
URL pública y actualizar las cifras de esta tabla.

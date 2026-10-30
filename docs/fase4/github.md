# Publicar FITMAX en GitHub

No se publicó ningún repositorio: requiere la cuenta del equipo y su autorización. El proyecto ya
está listo para subirlo con su historial de commits.

## Antes de subir

1. Rota las credenciales que se compartieron en capturas el 10/10/2026 (contraseña de Neon y API key
   de Anthropic).
2. Comprueba que no hay secretos en el repositorio:
   ```bash
   git status --ignored | grep .env       # .env debe aparecer como ignorado
   git log -p | grep -E "sk-ant-api|npg_[A-Za-z0-9]" || echo "sin secretos en el historial"
   git log --format='%an %ae' | sort -u   # autor genérico, sin correos personales
   ```
   El historial se reescribió el 30/10/2026 con el autor `Equipo FITMAX <equipo-fitmax@example.invalid>`.
   Para los commits nuevos, configura el correo privado que GitHub ofrece en Settings → Emails
   ("Keep my email addresses private"):
   `git config user.email "<id>+<usuario>@users.noreply.github.com"`.
3. Ejecuta `npm run typecheck && npm run lint && npm test`.

## Subir (con el historial de commits incluido en el zip)

1. En github.com: **New repository**, nombre `fitmax`, visibilidad según lo que pida el curso, sin
   README ni .gitignore (ya existen).
2. En la carpeta del proyecto:
   ```bash
   git remote add origin https://github.com/USUARIO/fitmax.git
   git branch -M main
   git push -u origin main
   ```
3. Agrega al otro integrante como colaborador y al tutor con rol de **lectura** (la guía pide ese
   rol). En un repositorio personal, GitHub da escritura a los colaboradores; para dar solo lectura,
   crea una organización gratuita, mueve el repositorio allí y asigna al tutor el rol *Read*. Si el
   curso lo permite, un repositorio público también da lectura al tutor.
4. Opcional: en Settings → Secrets and variables, **no** pongas claves si no vas a usar Actions.

## Enlace para el documento

Cuando exista, copia la URL real del repositorio en el anexo G del documento maestro de la Fase 4. No se debe
poner un enlace antes de que el repositorio exista.

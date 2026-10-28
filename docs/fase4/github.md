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
   ```
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
3. Agrega a los integrantes y al tutor como colaboradores (Settings → Collaborators).
4. Opcional: en Settings → Secrets and variables, **no** pongas claves si no vas a usar Actions.

## Enlace para el documento

Cuando exista, copia la URL real del repositorio en el Anexo A del documento maestro. No se debe
poner un enlace antes de que el repositorio exista.

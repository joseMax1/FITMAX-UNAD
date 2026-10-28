@echo off
setlocal
title FITMAX
cd /d "%~dp0"

echo ==========================================
echo   FITMAX - iniciando en http://localhost:3000
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No se encontro Node.js.
  echo Instala la version LTS desde https://nodejs.org y vuelve a abrir este archivo.
  pause
  exit /b 1
)

if defined DATABASE_URL (
  echo [AVISO] Windows tiene una variable de entorno DATABASE_URL que reemplaza la del archivo .env.
  echo Borrala en: Configuracion ^> Sistema ^> Informacion ^> Configuracion avanzada ^> Variables de entorno.
  pause
  exit /b 1
)

if exist ".env.txt" if not exist ".env" (
  ren ".env.txt" ".env"
  echo Se renombro .env.txt a .env ^(el Bloc de notas le habia agregado .txt^).
)
if exist ".env.txt" (
  echo [AVISO] Hay un archivo .env.txt ademas de .env. La app solo lee .env.
  echo Copia tus datos al archivo .env y borra .env.txt.
  start "" notepad ".env"
  pause
  exit /b 1
)

if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo [AVISO] Se creo el archivo .env a partir de .env.example.
  echo Completa DATABASE_URL, NEXTAUTH_SECRET y ANTHROPIC_API_KEY, guarda el archivo
  echo y vuelve a ejecutar iniciar.bat.
  start "" notepad ".env"
  pause
  exit /b 1
)

findstr /c:"@host/" ".env" >nul
if not errorlevel 1 (
  echo [AVISO] El archivo .env todavia tiene la DATABASE_URL de ejemplo.
  echo 1. Entra a https://neon.tech, crea un proyecto gratis y copia el "Connection string".
  echo 2. Pegalo en .env en la linea DATABASE_URL="..." y guarda.
  echo 3. Vuelve a ejecutar iniciar.bat.
  start "" notepad ".env"
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias, la primera vez tarda unos minutos...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Fallo npm install. Revisa tu conexion a internet.
    pause
    exit /b 1
  )
)

echo Carpeta: %CD%
echo Sincronizando tablas de la base de datos...
call npx prisma db push
if errorlevel 1 (
  echo [ERROR] No se pudo conectar a la base de datos. Revisa DATABASE_URL en .env.
  pause
  exit /b 1
)

echo.
echo Abriendo el navegador. Para detener la app cierra esta ventana o presiona Ctrl+C.
start "" cmd /c "timeout /t 8 >nul & start http://localhost:3000"
call npm run dev

pause

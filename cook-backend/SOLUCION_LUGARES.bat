@echo off
echo ========================================
echo SOLUCION MODULO DE LUGARES
echo ========================================
echo.

echo [1/3] Deteniendo procesos de Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo [2/3] Generando cliente de Prisma...
call npx prisma generate

echo.
echo [3/3] Iniciando backend...
call npm run start:dev

pause

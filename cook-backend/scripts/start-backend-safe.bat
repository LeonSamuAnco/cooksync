@echo off
echo ========================================
echo  COOKSYNC - INICIO SEGURO DEL BACKEND
echo ========================================
echo.

REM Verificar si el puerto 3002 está ocupado
echo [1/4] Verificando puerto 3002...
netstat -ano | findstr :3002 > nul
if %errorlevel% equ 0 (
    echo [!] Puerto 3002 ocupado. Liberando...
    
    REM Obtener el PID del proceso en el puerto 3002
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002 ^| findstr LISTENING') do (
        echo [!] Deteniendo proceso %%a...
        taskkill /PID %%a /F > nul 2>&1
    )
    
    echo [OK] Puerto 3002 liberado
    timeout /t 2 > nul
) else (
    echo [OK] Puerto 3002 disponible
)

echo.
echo [2/4] Verificando dependencias...
if not exist "node_modules" (
    echo [!] Instalando dependencias...
    call npm install
) else (
    echo [OK] Dependencias instaladas
)

echo.
echo [3/4] Generando cliente Prisma...
call npx prisma generate > nul 2>&1
echo [OK] Cliente Prisma generado

echo.
echo [4/4] Iniciando servidor...
echo ========================================
echo  Backend iniciando en http://localhost:3002
echo  Presiona Ctrl+C para detener
echo ========================================
echo.

call npm run start:dev

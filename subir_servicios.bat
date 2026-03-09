@echo off
setlocal EnableDelayedExpansion
title Iniciar Servicios de Finanzas Personales

echo ==============================================================
echo Iniciando Sistema de Finanzas Personales
echo ==============================================================

:: 1. Verificación de Administrador
echo [*] Verificando privilegios de administrador...
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] No se detectaron privilegios de administrador.
    echo [*] Solicitando elevacion de privilegios...
    powershell -Command "Start-Process '%~dpnx0' -Verb RunAs"
    exit /b
)
echo [OK] Privilegios de administrador confirmados.

:: Directorio base
set BASE_DIR=%~dp0
cd /d "%BASE_DIR%"

:: 2. Iniciar Docker (Base de datos Postgres)
echo [*] Iniciando contenedores Docker (Base de datos)...
docker-compose up -d
if %errorLevel% neq 0 (
    echo [ERROR] Falló al iniciar Docker. Por favor asegúrese de que Docker Desktop esté ejecutándose.
    pause
    exit /b
)
echo [OK] Base de datos iniciada.

:: 3. Iniciar Backend
echo [*] Iniciando servidor Backend en puerto 3001...
cd /d "%BASE_DIR%backend"
start "Servidor Backend - npm run start:dev" cmd /c "npm run start:dev"
echo [OK] Comando de inicio de backend ejecutado en nueva ventana.

:: 4. Iniciar Frontend
echo [*] Iniciando cliente Frontend en puerto 3000...
cd /d "%BASE_DIR%frontend"
start "Cliente Frontend - npm run dev" cmd /c "npm run dev"
echo [OK] Comando de inicio de frontend ejecutado en nueva ventana.

:: 5. Verificación de Estado
echo.
echo ==============================================================
echo Esperando a que los servicios estén listos...
echo ==============================================================

set MAX_RETRIES=30
set RETRY_COUNT=0

:check_backend
:: Utilizamos netstat para ver si el puerto está escuchando
netstat -ano | find "LISTENING" | find ":3001" >nul
if %errorLevel% equ 0 (
    echo [OK] Backend esta online en el puerto 3001.
    goto check_frontend
)

:: Si no está listo, esperamos 2 segundos y reintentamos
set /a RETRY_COUNT+=1
if %RETRY_COUNT% geq %MAX_RETRIES% (
    echo [ERROR] Tiempo de espera agotado para el Backend ^(puerto 3001^). Revisar manualmente la ventana del Backend.
    goto check_frontend
)
timeout /t 2 /nobreak >nul
goto check_backend


:check_frontend
set RETRY_COUNT=0

:check_frontend_loop
netstat -ano | find "LISTENING" | find ":3000" >nul
if %errorLevel% equ 0 (
    echo [OK] Frontend esta online en el puerto 3000.
    goto all_done
)

:: Si no está listo, esperamos 2 segundos y reintentamos
set /a RETRY_COUNT+=1
if %RETRY_COUNT% geq %MAX_RETRIES% (
    echo [ERROR] Tiempo de espera agotado para el Frontend ^(puerto 3000^). Revisar manualmente la ventana del Frontend.
    goto all_done
)
timeout /t 2 /nobreak >nul
goto check_frontend_loop

:all_done
echo.
echo ==============================================================
echo                     SISTEMA ONLINE
echo ==============================================================
echo * Base de datos lista
echo * Backend sirviendo API
echo * Aplicacion disponible en: http://localhost:3000
echo.
echo Puede acceder a la aplicacion en su navegador.
echo Esta ventana se cerrara en 10 segundos...
timeout /t 10
exit

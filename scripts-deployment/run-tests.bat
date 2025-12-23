@echo off
echo Attente du demarrage du serveur...
timeout /t 3 /nobreak >nul
echo.
echo ============================================================
echo Execution des tests API
echo ============================================================
echo.
node test-api.js
echo.
echo ============================================================
echo Tests termines !
echo ============================================================
pause

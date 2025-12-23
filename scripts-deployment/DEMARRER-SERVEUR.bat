@echo off
echo ========================================
echo   DEMARRAGE DU SERVEUR SENICO
echo ========================================
echo.
echo Verification de WAMP...
netstat -ano | findstr :3306 >nul
if %errorlevel% neq 0 (
    echo [ERREUR] MySQL n'est pas demarre!
    echo Veuillez demarrer WAMP d'abord.
    echo.
    pause
    exit
)
echo [OK] MySQL est demarre
echo.
echo Demarrage du serveur Node.js...
echo.
cd /d "%~dp0"
node server-mysql.js
pause

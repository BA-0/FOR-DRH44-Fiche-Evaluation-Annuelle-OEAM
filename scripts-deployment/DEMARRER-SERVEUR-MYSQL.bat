@echo off
echo ========================================
echo    SENICO SA - Serveur d'Evaluation
echo ========================================
echo.
echo Demarrage du serveur sur le port 3001...
echo.

cd /d "%~dp0"
cd ..

REM Verifier si Node.js est installe
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Demarrer le serveur
echo Serveur demarre avec succes!
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
node server/server-mysql.js

pause

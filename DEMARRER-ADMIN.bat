@echo off
:: ============================================
:: Script de démarrage - Dashboard Admin
:: SENICO SA - Système d'Évaluation
:: ============================================

title SENICO - Dashboard Admin

:: Couleurs pour le terminal
color 0A

echo.
echo ============================================================
echo         SENICO SA - Systeme d'Evaluation
echo         Dashboard Administrateur
echo ============================================================
echo.

:: Vérifier si Node.js est installé
echo [1/4] Verification de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe ou n'est pas dans le PATH
    echo.
    echo Telechargez Node.js depuis: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js detecte
echo.

:: Vérifier si WAMP est démarré
echo [2/4] Verification de MySQL (WAMP)...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if %errorlevel% neq 0 (
    echo [ATTENTION] MySQL n'est pas demarre
    echo.
    echo Veuillez demarrer WAMP Server avant de continuer.
    echo L'icone WAMP doit etre VERTE dans la barre des taches.
    echo.
    pause
    echo.
    echo Verification de MySQL...
    tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
    if %errorlevel% neq 0 (
        echo [ERREUR] MySQL n'est toujours pas demarre
        pause
        exit /b 1
    )
)
echo [OK] MySQL est actif
echo.

:: Se déplacer dans le dossier du serveur
echo [3/4] Navigation vers le dossier serveur...
cd /d "%~dp0server"
if %errorlevel% neq 0 (
    echo [ERREUR] Impossible de trouver le dossier serveur
    pause
    exit /b 1
)
echo [OK] Dossier serveur trouve
echo.

:: Démarrer le serveur
echo [4/4] Demarrage du serveur Node.js...
echo.
echo ============================================================
echo.
echo Le serveur est en cours de demarrage...
echo.
echo Une fois demarre:
echo   - Dashboard Admin:  http://localhost:3001/admin-dashboard.html
echo   - Page de connexion: http://localhost:3001/login.html
echo   - Dashboard N1:     http://localhost:3001/dashboard.html
echo   - Validation N2:    http://localhost:3001/validation.html
echo.
echo Identifiants admin par defaut:
echo   Username: admin
echo   Password: (defini dans la base de donnees)
echo.
echo Pour arreter le serveur: Appuyez sur CTRL+C
echo.
echo ============================================================
echo.

:: Démarrer le serveur avec gestion d'erreur
node server-mysql.js
if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Le serveur a rencontre une erreur
    echo.
    echo Verifications a effectuer:
    echo   1. WAMP Server est bien demarre (icone verte)
    echo   2. La base de donnees 'formulaire_evaluation' existe
    echo   3. Le fichier db.config.js contient les bons parametres
    echo   4. Les modules Node.js sont installes (npm install)
    echo.
    pause
    exit /b 1
)

pause

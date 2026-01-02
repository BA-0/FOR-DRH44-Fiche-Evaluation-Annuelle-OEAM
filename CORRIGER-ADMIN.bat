@echo off
:: ============================================
:: Script de correction - Rôle Admin
:: SENICO SA - Système d'Évaluation
:: ============================================

title SENICO - Correction Admin

color 0C

echo.
echo ============================================================
echo         SENICO SA - Correction Role Administrateur
echo ============================================================
echo.

echo [DIAGNOSTIC] Verification du role admin dans la base...
echo.

:: Détecter le chemin de MySQL dans WAMP
set "MYSQL_PATH="
if exist "C:\wamp64\bin\mysql\mysql8.2.0\bin\mysql.exe" set "MYSQL_PATH=C:\wamp64\bin\mysql\mysql8.2.0\bin\mysql.exe"
if exist "C:\wamp64\bin\mysql\mysql8.3.0\bin\mysql.exe" set "MYSQL_PATH=C:\wamp64\bin\mysql\mysql8.3.0\bin\mysql.exe"
if exist "C:\wamp\bin\mysql\mysql8.2.0\bin\mysql.exe" set "MYSQL_PATH=C:\wamp\bin\mysql\mysql8.2.0\bin\mysql.exe"
if exist "C:\wamp\bin\mysql\mysql8.3.0\bin\mysql.exe" set "MYSQL_PATH=C:\wamp\bin\mysql\mysql8.3.0\bin\mysql.exe"

if not defined MYSQL_PATH (
    echo [ERREUR] Impossible de trouver mysql.exe dans WAMP
    echo.
    echo Veuillez executer cette commande manuellement dans phpMyAdmin:
    echo.
    echo ALTER TABLE users MODIFY COLUMN role ENUM('N1', 'N2', 'admin') NOT NULL;
    echo UPDATE users SET role = 'admin' WHERE username = 'admin';
    echo.
    pause
    exit /b 1
)

echo [OK] MySQL trouve: %MYSQL_PATH%
echo.

:: Créer un fichier SQL temporaire pour vérifier et corriger
echo USE formulaire_evaluation; > "%TEMP%\check_admin.sql"
echo SELECT id, username, role, name FROM users WHERE username='admin'; >> "%TEMP%\check_admin.sql"

echo Execution de la verification...
echo.

"%MYSQL_PATH%" -u root formulaire_evaluation < "%TEMP%\check_admin.sql"

if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Impossible de se connecter a MySQL
    echo.
    echo Verifications:
    echo   1. WAMP Server est demarre (icone verte^)
    echo   2. MySQL fonctionne
    echo   3. La base formulaire_evaluation existe
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo.
echo Si le role n'est PAS 'admin', appuyez sur ENTREE pour corriger
echo Sinon, appuyez sur CTRL+C pour annuler
echo.
pause

echo.
echo [CORRECTION] Application des corrections...
echo.

:: Créer le fichier de correction
echo USE formulaire_evaluation; > "%TEMP%\fix_admin.sql"
echo. >> "%TEMP%\fix_admin.sql"
echo -- Modifier la colonne role pour accepter 'admin' >> "%TEMP%\fix_admin.sql"
echo ALTER TABLE users MODIFY COLUMN role ENUM('N1', 'N2', 'admin') NOT NULL; >> "%TEMP%\fix_admin.sql"
echo. >> "%TEMP%\fix_admin.sql"
echo -- Mettre a jour l'utilisateur admin >> "%TEMP%\fix_admin.sql"
echo UPDATE users SET role = 'admin' WHERE username = 'admin'; >> "%TEMP%\fix_admin.sql"
echo. >> "%TEMP%\fix_admin.sql"
echo -- Verification >> "%TEMP%\fix_admin.sql"
echo SELECT id, username, role, name, email FROM users WHERE username = 'admin'; >> "%TEMP%\fix_admin.sql"

:: Exécuter la correction
"%MYSQL_PATH%" -u root formulaire_evaluation < "%TEMP%\fix_admin.sql"

if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] La correction a echoue
    pause
    exit /b 1
)

echo.
echo ============================================================
echo.
echo [SUCCES] Le role admin a ete corrige !
echo.
echo Prochaines etapes:
echo   1. Deconnectez-vous de l'application
echo   2. Reconnectez-vous avec le compte admin
echo   3. Vous serez redirige vers admin-dashboard.html
echo.
echo ============================================================
echo.

:: Nettoyer les fichiers temporaires
del "%TEMP%\check_admin.sql" 2>NUL
del "%TEMP%\fix_admin.sql" 2>NUL

pause

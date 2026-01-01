@echo off
:: ============================================
:: Vérifier le contenu de la base de données
:: ============================================

title Vérification Base de Données

color 0E

echo.
echo ============================================================
echo        VERIFICATION BASE DE DONNEES
echo ============================================================
echo.

SET MYSQL_PATH=C:\wamp64\bin\mysql\mysql8.2.0\bin\mysql.exe

if not exist "%MYSQL_PATH%" (
    echo [ERREUR] MySQL introuvable. Verifiez le chemin.
    pause
    exit /b 1
)

echo [1] Nombre d'utilisateurs:
"%MYSQL_PATH%" -u root -e "SELECT COUNT(*) as total_users FROM formulaire_evaluation.users;"

echo.
echo [2] Nombre d'evaluations:
"%MYSQL_PATH%" -u root -e "SELECT COUNT(*) as total_evaluations FROM formulaire_evaluation.evaluations;"

echo.
echo [3] Utilisateur admin:
"%MYSQL_PATH%" -u root -e "SELECT id, username, email, role, is_active FROM formulaire_evaluation.users WHERE username='admin';"

echo.
echo [4] Exemples d'evaluations:
"%MYSQL_PATH%" -u root -e "SELECT id, annee, status, evalue_nom FROM formulaire_evaluation.evaluations LIMIT 5;"

echo.
echo ============================================================
echo.
pause

@echo off
chcp 65001 > nul
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔧 PROCESSUS COMPLET DE TEST
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📋 ÉTAPE 1: Ouvrir phpMyAdmin pour exécuter le script SQL
echo.
echo    1. Une fenêtre de navigateur va s'ouvrir
echo    2. Cliquez sur l'onglet "SQL"
echo    3. Ouvrez le fichier: reparer-base.sql
echo    4. Copiez TOUT le contenu
echo    5. Collez dans la zone SQL de phpMyAdmin
echo    6. Cliquez "Exécuter"
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Appuyez sur une touche quand le script SQL est exécuté...
start http://localhost/phpmyadmin/
pause > nul

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🚀 ÉTAPE 2: Démarrage du serveur Node.js
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
start "Serveur Node.js" cmd /k "cd /d %~dp0 && npm start"

echo Attente du démarrage du serveur...
timeout /t 5 /nobreak > nul

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🧪 ÉTAPE 3: Exécution des tests automatisés
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
node test-complet.js

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📊 ÉTAPE 4: Ouverture du rapport
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
start RAPPORT-TESTS.html

echo.
echo ✅ PROCESSUS TERMINÉ !
echo.
echo Appuyez sur une touche pour fermer...
pause > nul

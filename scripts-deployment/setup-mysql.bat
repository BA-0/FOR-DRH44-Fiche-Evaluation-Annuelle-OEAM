@echo off
echo ========================================
echo  CONFIGURATION MYSQL - WAMP SERVER
echo ========================================
echo.
echo Etape 1: Verifier que WAMP est demarre
echo ----------------------------------------
echo L'icone WAMP doit etre VERTE
echo Si elle est orange ou rouge, clic droit ^> Redemarrer tous les services
echo.
pause
echo.
echo Etape 2: Ouverture de phpMyAdmin...
echo ----------------------------------------
start http://localhost/phpmyadmin
echo.
echo Instructions:
echo 1. Dans phpMyAdmin, cliquez sur l'onglet "SQL"
echo 2. Ouvrez le fichier database.sql avec Notepad
echo 3. Copiez TOUT le contenu
echo 4. Collez dans phpMyAdmin
echo 5. Cliquez sur "Executer"
echo.
echo Attendez quelques secondes pour que phpMyAdmin s'ouvre...
timeout /t 3 >nul
echo.
echo Etape 3: Ouverture du guide...
echo ----------------------------------------
start DEMARRAGE-RAPIDE.md
echo.
echo ========================================
echo  FICHIERS IMPORTANTS
echo ========================================
echo.
echo  database.sql         - Script a executer dans phpMyAdmin
echo  DEMARRAGE-RAPIDE.md  - Guide d'installation (3 min)
echo  MIGRATION.md         - Documentation complete
echo  TROUBLESHOOTING.md   - Aide au depannage
echo.
echo ========================================
echo  PROCHAINES ETAPES
echo ========================================
echo.
echo 1. Executez database.sql dans phpMyAdmin
echo 2. Revenez ici et appuyez sur une touche
echo.
pause
echo.
echo Etape 4: Demarrage du serveur MySQL...
echo ----------------------------------------
echo.
npm start

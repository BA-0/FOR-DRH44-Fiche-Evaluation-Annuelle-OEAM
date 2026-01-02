@echo off
:: ============================================
:: Test de connexion admin - Diagnostic
:: ============================================

title Test Admin - Diagnostic

color 0E

echo.
echo ============================================================
echo              DIAGNOSTIC CONNEXION ADMIN
echo ============================================================
echo.

echo [1] Test de connexion au serveur...
echo.

curl -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"Test123@\"}"

echo.
echo.
echo ============================================================
echo.
echo Si vous voyez "role":"admin" ci-dessus, le serveur fonctionne !
echo Sinon, verifiez:
echo   1. Le serveur est demarre
echo   2. Le mot de passe est correct
echo   3. Le role dans la base est bien 'admin'
echo.
echo ============================================================
echo.

pause

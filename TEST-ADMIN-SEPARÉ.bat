@echo off
:: ============================================
:: Test admin - A lancer dans un AUTRE terminal
:: ============================================

title Test Admin (Nouveau Terminal)

color 0A

echo.
echo ============================================================
echo   ATTENDEZ 3 SECONDES pour que le serveur soit pret...
echo ============================================================
echo.

timeout /t 3 /nobreak > nul

echo [TEST] Connexion en tant qu'admin...
echo.

curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"Test123@\"}"

echo.
echo.
echo ============================================================
echo.
pause

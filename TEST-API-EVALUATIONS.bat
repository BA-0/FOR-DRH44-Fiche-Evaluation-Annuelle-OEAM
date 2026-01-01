@echo off
title Test API Evaluations

echo.
echo Test de l'API /api/evaluations/all...
echo.

REM D'abord récupérer le token
echo [1] Connexion admin pour obtenir le token...
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"Test123@\"}" > temp_token.txt

echo.
echo.
echo [2] Extraction du token...
for /f "tokens=2 delims=:," %%a in ('findstr /r "\"token\"" temp_token.txt') do set TOKEN=%%a
set TOKEN=%TOKEN:"=%
set TOKEN=%TOKEN: =%

echo Token: %TOKEN%
echo.
echo [3] Test GET /api/evaluations/all avec Bearer token...
curl -X GET http://localhost:3001/api/evaluations/all -H "Authorization: Bearer %TOKEN%"

echo.
echo.
del temp_token.txt
pause

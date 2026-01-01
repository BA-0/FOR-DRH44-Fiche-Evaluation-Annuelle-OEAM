@echo off
:: ============================================
:: Réinitialiser mot de passe admin
:: ============================================

title Reset Admin Password

color 0B

echo.
echo ============================================================
echo      REINITIALISATION MOT DE PASSE ADMIN
echo ============================================================
echo.
echo Ce script va definir le mot de passe admin a: Test123@
echo.
echo Appuyez sur une touche pour continuer...
pause > nul

cd /d "%~dp0"

node reset-admin-password.js

echo.
pause

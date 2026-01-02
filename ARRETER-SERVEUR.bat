@echo off
title Arrêter tous les serveurs Node.js

color 0C

echo.
echo ============================================================
echo        ARRET DE TOUS LES SERVEURS NODE.JS
echo ============================================================
echo.

echo [1] Recherche des processus Node.js...
tasklist | findstr node.exe

echo.
echo [2] Arrêt de tous les processus Node.js...
taskkill /F /IM node.exe

echo.
echo ============================================================
echo.
echo Tous les serveurs Node.js ont ete arretes.
echo Vous pouvez maintenant relancer le serveur.
echo.
echo ============================================================
echo.
pause

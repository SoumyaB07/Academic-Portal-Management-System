@echo off
title Academic Portal Management System - Full Stack Server
echo ==========================================================
echo   Starting Academic Portal Management System (APMS)
echo   Backend: Node.js Express Server (Port 5000)
echo ==========================================================
echo.
cd /d "%~dp0backend"

REM Open the web browser after a brief 1-second pause
start "" cmd /c "timeout /t 1 /nobreak >nul & start http://localhost:5000"

REM Launch Node.js Server
"C:\Program Files\nodejs\node.exe" server.js
pause

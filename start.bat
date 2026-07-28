@echo off
title FanForge Engagement OS Launcher

echo ========================================================
echo        Starting FanForge Engagement OS
echo ========================================================
echo.

echo [1/2] Starting Python FastAPI Backend (Port 8000)...
start "FanForge Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --port 8000"

echo [2/2] Starting Vite Frontend (Port 5173)...
start "FanForge Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Both services launched!
echo - Frontend: http://localhost:5173/
echo - Backend API Docs: http://localhost:8000/docs
echo.
echo Opening browser in 3 seconds...
timeout /t 3 >nul
start http://localhost:5173/

exit

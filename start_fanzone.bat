@echo off
title FanZone Standalone Portal Launcher

echo ========================================================
echo        Starting Standalone FanZone Mobile Portal
echo ========================================================
echo.

echo [1/2] Starting FanZone Mobile Portal Server (Port 5175)...
start "FanZone Mobile Portal" cmd /k "cd /d %~dp0 && npm run dev:fanzone"

echo.
echo FanZone server launched!
echo - FanZone Portal: http://localhost:5175/
echo.
echo Opening FanZone in browser in 3 seconds...
timeout /t 3 >nul
start http://localhost:5175/

exit

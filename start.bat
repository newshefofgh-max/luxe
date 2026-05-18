@echo off
title Accessory - Dev Server
echo.
echo  Starting Accessory...
echo.

cd /d "%~dp0"

:: Kill anything on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Start the production server
echo  Server running at http://localhost:3000
echo  Press Ctrl+C to stop.
echo.
npm start

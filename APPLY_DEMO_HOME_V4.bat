@echo off
setlocal
cd /d "%~dp0"
echo.
echo Buddy Fleets - Demo Home Visual V4
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File ".\apply-demo-home-v4.ps1"
echo.
pause

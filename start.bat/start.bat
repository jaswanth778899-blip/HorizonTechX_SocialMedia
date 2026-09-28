@echo off
cd /d "%~dp0backend"

echo Starting HorizonTechX SocialMedia...
start "Backend" cmd /k "npm start"

timeout /t 4 /nobreak >nul

start "" "%~dp0frontend\index.html"

echo.
echo Project started!
echo Backend: http://localhost:5000
pause
@echo off
REM Investo Run Script for Windows
REM This script starts the application

echo =========================================
echo   Starting Investo
echo =========================================
echo.

REM Check if dependencies are installed
if not exist "frontend\node_modules" (
    echo Error: Dependencies not installed.
    echo Please run 'setup.bat' first.
    pause
    exit /b 1
)

REM Build and run the app
echo Building frontend and starting application...
echo.
cd frontend
call npm run app
cd ..

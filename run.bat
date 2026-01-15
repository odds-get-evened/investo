@echo off
REM Investo Run Script for Windows
REM This script starts the application in production mode

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

REM Check for Python dependencies
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python dependencies not installed.
    echo Please run 'setup.bat' first.
    pause
    exit /b 1
)

REM Build and run the app (Electron will auto-start the backend)
echo Building frontend and starting application...
echo.
cd frontend
call npm run app
cd ..

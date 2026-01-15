@echo off
REM Investo Setup Script for Windows
REM This script installs all dependencies

echo =========================================
echo   Investo Setup
echo =========================================
echo.

REM Check for Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js 16 or higher from nodejs.org
    pause
    exit /b 1
)

for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo ^> Found Node.js %NODE_VERSION%
echo.

REM Install Node.js dependencies
echo =========================================
echo Installing Node.js dependencies...
echo =========================================
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install Node.js dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo ^> Node.js dependencies installed
echo.

echo =========================================
echo   Setup Complete!
echo =========================================
echo.
echo To run the application:
echo   run.bat
echo.
pause

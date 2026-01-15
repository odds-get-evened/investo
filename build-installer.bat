@echo off
REM Investo Windows Installer Build Script
REM This script builds a Windows installer (.exe) for distribution

echo =========================================
echo   Building Investo Windows Installer
echo =========================================
echo.

REM Check if dependencies are installed
if not exist "frontend\node_modules" (
    echo Error: Dependencies not installed.
    echo Please run 'setup.bat' first.
    pause
    exit /b 1
)

echo This will create a Windows installer in frontend\release\
echo.
echo Building installer... This may take several minutes.
echo.

cd frontend
call npm run dist:win

if %errorlevel% neq 0 (
    echo.
    echo Error: Build failed!
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo =========================================
echo   Build Complete!
echo =========================================
echo.
echo The installer has been created in:
echo   frontend\release\
echo.
echo You can distribute the .exe file to users.
echo.
pause

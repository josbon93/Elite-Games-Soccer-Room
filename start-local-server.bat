@echo off
title Elite Games Soccer Room Server
echo.
echo ================================
echo Elite Games Soccer Room Server  
echo ================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Run network setup check
echo Checking network configuration...
node package-scripts/setup-local.js

echo.
echo Starting server...
echo.
echo Server will be available at:
echo http://localhost:5000
echo.
echo For tablet access, use the IP addresses shown above
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the application
call npm run dev

pause
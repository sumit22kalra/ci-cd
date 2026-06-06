@echo off

echo ====================================
echo Installing Dependencies
echo ====================================
call npm install

if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo ====================================
echo Running Lint
echo ====================================
call npm run lint

if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo ====================================
echo Building Angular Application
echo ====================================
call npm run build

if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo ====================================
echo BUILD SUCCESSFUL
echo ====================================

pause
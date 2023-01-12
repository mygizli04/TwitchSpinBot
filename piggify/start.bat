@echo off

cd src

if not exist node_modules (
    echo Please wait... Installing dependencies...

    rem Need to start another instance of cmd to run npm install because both Windows and npm are dumb dumb dumb dumb
    rem For some god forsaken reason, running npm causes the shell script to stop execution????
    cmd /C npm i --omit=dev
)

node out/piggify/loader.js

if %ERRORLEVEL% EQU 69 goto UPDATE

if %ERRORLEVEL% EQU 1 PAUSE

exit /B

:UPDATE
cd ..

rmdir /S /Q src

move update/src .
move /Y update/start.bat .

rmdir /S /Q update

SPINBOT_DO_NOT_CHECK_UPDATE=1
start.bat
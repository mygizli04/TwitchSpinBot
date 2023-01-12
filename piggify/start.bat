rem @echo off

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
echo Starting install...

cd ..

tar -xf update.zip

del update.zip

echo Installed successfully! Checking for dependency updates...

cd src
cmd /C npm i

echo Done! Starting the bot...

cd ..

set SPINBOT_DO_NOT_CHECK_UPDATE=1
cmd /C start.bat
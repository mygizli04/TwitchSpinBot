cd src
node out/piggify/loader.js

if ERRORLEVEL 69 goto UPDATE

if ERRORLEVEL 1 PAUSE

exit

:UPDATE
cd ..

rmdir /S /Q src

move update/src .
move /Y update/start.bat .

rmdir /S /Q update

SPINBOT_DO_NOT_CHECK_UPDATE=1
start.bat
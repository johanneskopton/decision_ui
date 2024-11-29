@ECHO OFF 
setlocal

REM change to frontend directory
CD /D "%~dp0/../"

npm run watch:webapp

endlocal
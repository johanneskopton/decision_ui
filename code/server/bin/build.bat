@ECHO OFF 
setlocal

REM change to server directory
CD /D "%~dp0/../"

npm run build

endlocal
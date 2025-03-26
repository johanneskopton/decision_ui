@ECHO OFF 
setlocal

REM change to backend directory
CD /D "%~dp0/../"

REM package backend
call code\backend\bin\package.bat

REM package electron
call code\frontend\bin\package-electron.bat

endlocal
@ECHO OFF 
setlocal

REM change to backend directory
CD /D "%~dp0/../"

REM build backend
call code\backend\bin\package.bat

REM build electron
call code\frontend\bin\package-electron.bat

endlocal
@ECHO OFF 
setlocal

REM change to root directory
CD /D "%~dp0/../"

REM build frontend
call code\frontend\bin\build-webapp.bat

REM build server
call code\server\bin\build.bat

endlocal
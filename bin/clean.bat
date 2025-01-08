@ECHO OFF 
setlocal

REM change to root directory
CD /D "%~dp0/../"

REM clean backend
call code\backend\bin\clean.bat

REM clean frontend
call code\frontend\bin\clean.bat

REM clean server
call code\server\bin\clean.bat

endlocal
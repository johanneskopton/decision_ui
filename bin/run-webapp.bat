@ECHO OFF 
setlocal

REM watch both frontend and backend
concurrently -k -c auto -n server,backend "cmd.exe /c ..\code\server\bin\run.bat" "cmd.exe /c ..\code\backend\bin\run.bat"

endlocal
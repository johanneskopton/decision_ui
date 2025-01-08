@ECHO OFF 
setlocal

REM watch both frontend and backend
concurrently -k -c auto -n frontend,backend "cmd.exe /c ..\code\frontend\bin\watch-webapp.bat" "cmd.exe /c ..\code\backend\bin\watch.bat"

endlocal
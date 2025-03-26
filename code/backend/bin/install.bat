@ECHO OFF 
setlocal

REM change to script directory
CD /D "%~dp0/"

call install-python.bat
call install-r.bat

endlocal
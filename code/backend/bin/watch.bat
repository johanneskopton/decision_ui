@ECHO OFF 
setlocal

REM change to backend directory
CD /D "%~dp0/../"

REM activate python venv
call .venv/Scripts/activate.bat

REM start backend server
SET DSUI_R_SCRIPT_PATH=%cd%\resources\R\bin\Rscript.exe
python -m decision_backend.cli --host 0.0.0.0 --port 8000 --reload -v

endlocal
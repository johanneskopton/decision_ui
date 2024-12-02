REM @ECHO OFF 
setlocal

REM change to backend directory
CD /D "%~dp0/../"

REM activate python venv
call .venv/Scripts/activate.bat

REM start backend server
uvicorn decision_backend.main:app --host 0.0.0.0 --port 8000 --reload

endlocal
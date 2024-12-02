REM @ECHO OFF 
setlocal

REM change to backend directory
CD /D "%~dp0/../"

REM activate python venv
call .venv/Scripts/activate.bat

REM package python baclend as one executable
pyinstaller --onefile --hidden-import aiosqlite --collect-data decision_backend.translation.templates --name decision-support-ui-backend decision_backend/cli.py

endlocal
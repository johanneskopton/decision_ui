@ECHO OFF 
setlocal

REM change to backend directory
CD /D "%~dp0/../"

REM activate python venv
call .venv/Scripts/activate.bat

REM package python backend as one executable
pyinstaller^
    --onedir^
    --hidden-import aiosqlite^
    --hidden-import decision_backend.main^
    --collect-data decision_backend.translation.templates^
    --runtime-hook decision_backend\packaging\win-env-hook.py^
    --add-data resources/R:resources/R^
    --name decision-support-ui-backend^
    --noconfirm^
    decision_backend/cli.py

endlocal
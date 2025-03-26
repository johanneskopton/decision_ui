@ECHO OFF
setlocal

REM change to frontend directory
CD /D "%~dp0/../"

REM copy python backend
if not exist resources\decision-support-ui-backend (
    echo d | xcopy /y /e  ..\backend\dist\decision-support-ui-backend resources\decision-support-ui-backend
)

REM delete database
DEL /s /q resources\decision-support-ui-backend\data\decision-support-ui-backend.db

REM build setup.exe distributable
npm run build:electron:win

endlocal
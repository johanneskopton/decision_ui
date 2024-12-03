@ECHO OFF 
setlocal

REM change to frontend directory
CD /D "%~dp0/../"

REM copy python dir
if not exist resources\decision-support-ui-backend (
    xcopy /Y /e  ..\backend\dist\decision-support-ui-backend resources\decision-support-ui-backend
)

REM delete database
DEL /s /q resources\decision-support-ui-backend\test.db

REM build setup.exe distributable
npm run build:electron:win

endlocal
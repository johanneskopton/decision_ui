@ECHO OFF 
setlocal

REM change to frontend directory
CD /D "%~dp0/../"

REM copy python dir
if not exist resources\decision-support-ui-backend (
    xcopy /Y /e  ..\backend\dist\decision-support-ui-backend resources\decision-support-ui-backend
)

REM build setup.exe distributable
SET VITE_BACKEND_BASE_URL=http://127.0.0.1:8000
npm run build:electron:win

endlocal
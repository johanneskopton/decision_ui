@ECHO OFF 
setlocal

REM change to frontend directory
CD /D "%~dp0/../"

REM copy python backend
if not exist resources\decision-support-ui-backend (
    echo d | xcopy /y /e  ..\backend\dist\decision-support-ui-backend resources\decision-support-ui-backend
)

SET VITE_BACKEND_BASE_URL=http://127.0.0.1:8000
npm run watch:electron

endlocal
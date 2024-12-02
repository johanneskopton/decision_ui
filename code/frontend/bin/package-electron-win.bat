@ECHO OFF 
setlocal

REM change to frontend directory
CD /D "%~dp0/../"

REM copy python executable
if not exist resources\python mkdir resources\python
xcopy /Y  ..\backend\dist\decision-support-ui-backend.exe resources\python\

REM build setup.exe distributable
SET VITE_BACKEND_BASE_URL=http://127.0.0.1:8000
npm run build:electron:win

endlocal
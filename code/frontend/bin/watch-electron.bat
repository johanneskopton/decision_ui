@ECHO OFF 
setlocal

REM change to frontend directory
CD /D "%~dp0/../"

SET VITE_BACKEND_BASE_URL=http://127.0.0.1:8000
npm run watch:electron

endlocal
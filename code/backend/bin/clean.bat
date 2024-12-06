@ECHO OFF
setlocal

REM change to backend directory
CD /D "%~dp0/../"

@RD /S /Q .venv
@RD /S /Q build
@RD /S /Q dist
@RD /S /Q resources\R
@RD /S /Q decision_backend.egg-info
DEL /s /q decision-support-ui-backend.db
DEL /s /q decision-support-ui-backend.spec

endlocal
@ECHO OFF
setlocal

REM change to backend directory
CD /D "%~dp0/../"

@RD /S /Q .venv
@RD /S /Q build
@RD /S /Q dist
@RD /S /Q resources\R
@RD /S /Q resources\download
@RD /S /Q decision_backend.egg-info
@RD /S /Q decision_backend\__pycache__
DEL /s /q decision-support-ui-backend.spec
DEL /s /q data/decision-support-ui-backend.db

endlocal
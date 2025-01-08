@ECHO OFF 
setlocal

REM change to backend directory
CD /D "%~dp0/../"

REM activate venv
call .venv/Scripts/activate.bat

REM run pylint
pylint --max-line-length=120 --min-similarity-lines=8 ./decision_backend
pylint --max-line-length=120 --min-similarity-lines=8 ./tests

REM run flake8
flake8 --ignore=D301,W503 --max-line-length=120 ./decision_backend
flake8 --ignore=D301,W503 --max-line-length=120 ./tests

REM run bandit
bandit -c .bandit.yaml -r ./decision_backend

endlocal
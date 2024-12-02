REM @ECHO OFF 
setlocal

REM change to backend directory
CD /D "%~dp0/../"

REM setup new python virtual environment
python -m venv .venv

REM activate python venv
call .venv/Scripts/activate.bat

REM install python dependencies
pip install -e .[dev]

REM print currently installed libraries and their versions
python -m pip list

endlocal
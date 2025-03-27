@ECHO OFF
setlocal

REM change to backend directory
CD /D "%~dp0/../"

SET R_VERSION=4.4.3
SET ROOT_PATH=%cd%
SET RESOURCES_DIR=%root_path%\resources
SET DOWNLOAD_DIR=%resources_dir%\download
SET R_DOWNLOAD_URL=https://cran.r-project.org/bin/windows/base/R-%r_version%-win.exe
SET R_DOWNLOAD_PATH=%download_dir%\R-%r_version%-win.exe
SET R_INSTALL_DIR=%resources_dir%\R
SET R_BINARY_PATH=%r_install_dir%\bin\R.exe

REM donwload R into resources directory
IF NOT EXIST %download_dir% mkdir %download_dir%
IF EXIST %r_download_path% (
    echo R-%r_version%-win.exe already exists, skip download
) ELSE (
    powershell -Command "Invoke-WebRequest %r_download_url% -OutFile %r_download_path%"
)

REM install R into resources directory
IF EXIST %r_install_dir% (
    echo R already installed, skip install
) ELSE (
    call %r_download_path% /SILENT /CURRENTUSER /NOICONS /MERGETASKS="!desktopicon" /DIR="%r_install_dir%"
)

REM check if dependencies are already installed
call %r_binary_path% --no-echo -e "library(readr); library(decisionSupport);"

REM install decision support package
IF %ERRORLEVEL% == 0 (
    echo R dependencies are installed and can be loaded
) ELSE (
    call %r_binary_path% -e "options(warn=2); install.packages(c(""decisionSupport"", ""readr""), INSTALL_opts=c(""--no-docs"", ""--no-html"", ""--no-help""), repos=""https://cran.uni-muenster.de/"");"
)

endlocal
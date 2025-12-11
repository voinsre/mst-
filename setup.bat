@echo off
echo Installing dependencies...
python -m pip install aiohttp beautifulsoup4 pandas
if %errorlevel% neq 0 (
    echo.
    echo Error installing dependencies. Please ensure Python is installed and added to PATH.
    echo You can download it from python.org or the Microsoft Store.
    pause
    exit /b
)
echo.
echo Dependencies installed successfully!
pause

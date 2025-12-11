@echo off
cd /d "%~dp0"
echo Running daily update...
python scraper.py --update
pause

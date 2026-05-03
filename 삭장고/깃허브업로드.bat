@echo off
chcp 65001 > nul
set PATH=%PATH%;C:\Program Files\Git\cmd
cd /d "%~dp0"

git add 삭장고리스트.html
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo No changes.
    timeout /t 3 > nul
    exit /b
)

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set msg=%dt:~0,4%-%dt:~4,2%-%dt:~6,2% %dt:~8,2%:%dt:~10,2% update

git commit -m "%msg%"
git push

echo Done! GitHub Pages will update in 1-2 minutes.
timeout /t 5 > nul
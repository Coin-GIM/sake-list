@echo off
chcp 65001 > nul
set PATH=%PATH%;C:\Program Files\Git\cmd

echo.
echo  [삭장고리스트] GitHub 업데이트 중...
echo.

cd /d "%~dp0"
git add 삭장고리스트.html
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo  변경된 내용이 없습니다.
    timeout /t 3 > nul
    exit /b
)

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set msg=%dt:~0,4%-%dt:~4,2%-%dt:~6,2% %dt:~8,2%:%dt:~10,2% 업데이트

git commit -m "%msg%"
git push

echo.
echo  완료! 1~2분 후 GitHub Pages에 반영됩니다.
echo  https://coin-gim.github.io/sake-list/삭장고리스트.html
echo.
timeout /t 5 > nul

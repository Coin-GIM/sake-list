@echo off
chcp 65001 > nul
echo.
echo  [삭장고리스트 서버 시작 중...]
echo.
start "" "http://localhost:8080/삭장고리스트.html"
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0서버시작.ps1"
pause

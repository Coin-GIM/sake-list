@echo off
chcp 65001 > nul
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0서버시작_모바일.ps1"
pause

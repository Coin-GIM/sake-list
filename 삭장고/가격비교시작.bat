@echo off
cd /d "%~dp0"

net session > nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

netsh advfirewall firewall show rule name="sake-input-server" > nul 2>&1
if %errorlevel% neq 0 (
    netsh advfirewall firewall add rule name="sake-input-server" dir=in action=allow protocol=TCP localport=3001 > nul
)

timeout /t 1 /nobreak > nul
start "" "http://localhost:3001/가격비교.html"

node server.js
pause

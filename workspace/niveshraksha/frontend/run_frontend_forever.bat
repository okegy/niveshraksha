
@echo off
:loop
cd /d "D:\sangyam hackathon\workspace
iveshraksharontend"
call npm run start
timeout /t 3 >nul
goto loop

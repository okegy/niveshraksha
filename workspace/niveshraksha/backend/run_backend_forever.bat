
@echo off
:loop
cd /d "D:\sangyam hackathon\workspace
iveshrakshaackend"
python -m uvicorn app.main:app --port 8000
timeout /t 3 >nul
goto loop

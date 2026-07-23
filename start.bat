@echo off
echo Starting RM Mail Merge Tools Dev Server...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Killing process on port 3001 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

echo Installing dependencies...
call npm install

echo Starting dev server on https://localhost:3001
call npm run dev
pause

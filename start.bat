@echo off
echo =======================================================
echo 🌾 Starting KisanAI (Backend + Frontend)
echo =======================================================

cd /d "%~dp0"

echo 🐍 [1/2] Starting Python FastAPI Backend...
start "KisanAI Python Backend" cmd /k "cd ml_service && venv\Scripts\activate && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo 💻 [2/2] Starting React Vite Frontend...
cd frontend
npm run dev

pause

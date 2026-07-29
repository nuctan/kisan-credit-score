#!/bin/bash

echo "======================================================="
echo "🌾 Starting Kisan Credit AI (100% Pure Python Stack)"
echo "======================================================="

# Get directory of script
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$PROJECT_DIR"

# 1. Start Python FastAPI Server (Port 8000) using venv python binary directly
echo "🐍 [1/2] Starting Python FastAPI Server on http://localhost:8000 ..."
cd "$PROJECT_DIR/ml_service"
./venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
PYTHON_PID=$!

# Wait 2 seconds for Python server to initialize
sleep 2

# 2. Start React Vite Frontend (Port 3000)
echo "💻 [2/2] Starting React Vite Frontend on http://localhost:3000 ..."
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "======================================================="
echo "✅ Kisan Credit AI is RUNNING!"
echo "🌐 Open Frontend: http://localhost:3000"
echo "🐍 Python Backend: http://localhost:8000"
echo "Press CTRL+C anytime to stop both servers."
echo "======================================================="

# Trap CTRL+C to cleanly kill both background processes
trap "kill $PYTHON_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM EXIT

# Keep script running
wait $PYTHON_PID $FRONTEND_PID

#!/usr/bin/env fish
# Fish shell startup script for Kisan Credit AI

echo "======================================================="
echo "🌾 Starting Kisan Credit AI"
echo "======================================================="

set PROJECT_DIR /home/nuctan/Desktop/kisaanai

# Start Python FastAPI Backend
echo "🐍 Starting Python Backend on http://localhost:8000 ..."
cd $PROJECT_DIR/ml_service
$PROJECT_DIR/ml_service/venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
set PYTHON_PID $last_pid

sleep 2

# Start React Frontend
echo "💻 Starting React Frontend on http://localhost:3000 ..."
cd $PROJECT_DIR/frontend
npm run dev &
set FRONTEND_PID $last_pid

echo ""
echo "✅ Both servers started!"
echo "🌐 Open your browser at: http://localhost:3000"
echo "🔑 Login: admin / admin"
echo ""
echo "Press CTRL+C to stop."
echo "======================================================="

wait

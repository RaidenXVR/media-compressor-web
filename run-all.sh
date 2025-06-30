#!/bin/bash
echo "Starting backend (FastAPI)..."
(cd backend && source .venv/bin/activate && uvicorn app.main:app --reload) &

echo "Starting frontend (Vite)..."
(cd frontend && npm run dev) &

echo "Both frontend and backend are starting..."
wait
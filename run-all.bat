@echo off
REM Start backend (FastAPI) in a new terminal window with venv activated
start cmd /k "cd backend && call .venv\Scripts\activate.bat && uvicorn app.main:app --reload"

REM Start frontend (Vite) in a new terminal window
start cmd /k "cd frontend && npm run dev"

echo Both frontend and backend are starting...
pause
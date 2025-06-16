@echo off
echo Installing backend Python dependencies...
cd backend

IF NOT EXIST .venv (
    echo Creating virtual environment...
    python -m venv .venv
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat

python -m pip install --upgrade pip
pip install -r requirements.txt

echo Installing backend system dependencies...
IF EXIST packages.txt (
    for /f "usebackq delims=" %%p in (packages.txt) do (
        echo Please install '%%p' manually if not already installed.
    )
)

call deactivate

cd ..

echo Installing frontend Node.js dependencies...
cd frontend
npm install

echo All dependencies installed.
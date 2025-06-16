#!/bin/bash
echo "Installing backend Python dependencies..."
cd backend

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

echo "Activating virtual environment..."
# shellcheck disable=SC1091
source .venv/bin/activate

python3 -m pip install --upgrade pip
pip3 install -r requirements.txt

echo "Installing backend system dependencies..."
if [ -f packages.txt ]; then
    while IFS= read -r pkg; do
        echo "Please install '$pkg' manually if not already installed."
    done < packages.txt
fi

deactivate

cd ..

echo "Installing frontend Node.js dependencies..."
cd frontend
npm install

echo "All dependencies installed."
cd
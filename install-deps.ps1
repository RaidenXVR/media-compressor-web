Write-Host "Installing backend Python dependencies..."
Set-Location backend

if (-Not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv
}

Write-Host "Activating virtual environment..."
& .\.venv\Scripts\Activate.ps1

python -m pip install --upgrade pip
pip install -r requirements.txt

Write-Host "Installing backend system dependencies..."
if (Test-Path packages.txt) {
    Get-Content packages.txt | ForEach-Object {
        Write-Host "Please install '$_' manually if not already installed."
    }
}

deactivate

Set-Location ..

Write-Host "Installing frontend Node.js dependencies..."
Set-Location frontend
npm install

Write-Host "All dependencies installed."
Set-Location ..
Pause
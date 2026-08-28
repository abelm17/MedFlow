#!/bin/bash

# Move to the project root, regardless of where the script is run from
cd "$(dirname "$0")/.."

echo "Setting up Python environment..."
python3 -m venv backend/.venv

echo "Installing Python dependencies..."
source backend/venv/bin/activate
pip install -r backend/requirements.txt

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Setup complete!"
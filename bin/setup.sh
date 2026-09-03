#!/usr/bin/env bash

# This file gets a brand new clone of this application running with a single command
# It creates the backend .venv if it doesn't already exist, it installs our python dependencies,
# creates backend/.env from the template if it doesn't already exist, then it installs 
# our frontend dependencies

## NOTE this must be run from a GitBash terminal!!
## Command to run this file in the robopulse directory:
## bash bin/setup.sh

set -e

echo "== MedFlow Setup =="

cd backend

# create our virtual environment if it doesn't already exist
If [! -d ".venv"]; then 
    echo "Creating virtual environment..."
    python -m venv .venv
fi

source .venv/Scripts/activate
pip install -r requirements.txt

# Create .env file if it doesn't exist already
If [! -d ".env"]; then 
    echo "No .env found - copying from .env.example."
    echo "Fill in real values in backend/.env before running this app."
    cp .env.example .env
fi

# Frontend setup
cd ../frontend
npm install

echo "Setup complete"
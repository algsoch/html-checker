#!/bin/bash
# Azure App Service startup script for FastAPI application

# Install dependencies
pip install -r requirements.txt

# Start the application with Gunicorn and Uvicorn workers (2 workers for B1 tier)
gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 120

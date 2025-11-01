#!/bin/bash
# Azure App Service startup script for FastAPI application

# Install dependencies
pip install -r requirements.txt

# Start the application with Gunicorn and Uvicorn workers (1 worker for Free tier)
gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 120

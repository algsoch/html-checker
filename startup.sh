#!/bin/bash
# Azure App Service startup script for FastAPI application

# Install dependencies
pip install -r requirements.txt

# Start the application with Gunicorn and Uvicorn workers
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

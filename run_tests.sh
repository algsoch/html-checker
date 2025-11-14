#!/bin/bash

# Quick Test Runner for HTML Checker API
# This script runs all tests against https://html-checker-yc8t.onrender.com/

echo "============================================"
echo "HTML Checker API - Test Runner"
echo "============================================"
echo ""

# Check if pytest is installed
if ! python3 -c "import pytest" 2>/dev/null; then
    echo "Installing test dependencies..."
    python3 -m pip install -q pytest requests
    echo "✅ Dependencies installed"
    echo ""
fi

# Run tests with verbose output
echo "Running comprehensive test suite..."
echo ""

python3 -m pytest test_api.py -v --tb=short

echo ""
echo "============================================"
echo "Test run complete!"
echo "============================================"

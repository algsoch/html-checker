# Azure Deployment Script for HTML Citation Cleaner
# Run this script in PowerShell

# Configuration
$RESOURCE_GROUP = "html-checker-rg"
$APP_NAME = "html-citation-cleaner-$(Get-Random -Maximum 9999)"  # Unique name
$LOCATION = "centralindia"  # Change to: eastus, westus2, southeastasia, westeurope, uksouth
$SUBSCRIPTION = "863a7ee7-692b-475c-a7d5-9dde85fa770c"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Deployment for HTML Citation Cleaner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set subscription
Write-Host "Setting Azure subscription..." -ForegroundColor Yellow
az account set --subscription $SUBSCRIPTION

# Create resource group
Write-Host "Creating resource group: $RESOURCE_GROUP in $LOCATION..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION --output table

# Create App Service Plan (Free F1 tier)
Write-Host "Creating App Service Plan..." -ForegroundColor Yellow
az appservice plan create `
    --name "${APP_NAME}-plan" `
    --resource-group $RESOURCE_GROUP `
    --location $LOCATION `
    --sku F1 `
    --is-linux `
    --output table

# Create Web App
Write-Host "Creating Web App: $APP_NAME..." -ForegroundColor Yellow
az webapp create `
    --resource-group $RESOURCE_GROUP `
    --plan "${APP_NAME}-plan" `
    --name $APP_NAME `
    --runtime "PYTHON:3.11" `
    --output table

# Configure startup command
Write-Host "Configuring startup command..." -ForegroundColor Yellow
az webapp config set `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --startup-file "gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000" `
    --output table

# Enable local Git deployment
Write-Host "Enabling Git deployment..." -ForegroundColor Yellow
az webapp deployment source config-local-git `
    --name $APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --output tsv

# Get deployment URL
$deployUrl = az webapp deployment source config-local-git `
    --name $APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --query url `
    --output tsv

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "App Name: $APP_NAME" -ForegroundColor Cyan
Write-Host "Resource Group: $RESOURCE_GROUP" -ForegroundColor Cyan
Write-Host "Location: $LOCATION" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Add Azure remote:" -ForegroundColor White
Write-Host "   git remote add azure $deployUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Push to Azure:" -ForegroundColor White
Write-Host "   git push azure main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Your app will be available at:" -ForegroundColor White
Write-Host "   https://$APP_NAME.azurewebsites.net" -ForegroundColor Green
Write-Host ""
Write-Host "4. View logs:" -ForegroundColor White
Write-Host "   az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP" -ForegroundColor Gray
Write-Host ""

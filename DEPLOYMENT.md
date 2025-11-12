# Deployment Guide

## Available Azure Regions (App Service Supported)

**Recommended regions for Azure for Students:**
- `eastus` - East US (Low latency for US)
- `westus2` - West US 2 (Low latency for West Coast)
- `centralindia` - Central India (Best for India)
- `southeastasia` - Southeast Asia (Best for Asia-Pacific)
- `westeurope` - West Europe (Best for Europe)
- `uksouth` - UK South (Best for UK/Europe)

## Deploy to Azure App Service

### Prerequisites
- Azure CLI installed
- Logged in: `az login`

### Quick Deployment (Choose one region)

```powershell
# Set variables
$RESOURCE_GROUP = "html-checker-rg"
$APP_NAME = "html-citation-cleaner"
$LOCATION = "centralindia"  # Change to your preferred region
$SUBSCRIPTION = "863a7ee7-692b-475c-a7d5-9dde85fa770c"

# Set subscription
az account set --subscription $SUBSCRIPTION

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan (Free F1 tier)
az appservice plan create --name "${APP_NAME}-plan" --resource-group $RESOURCE_GROUP --location $LOCATION --sku F1 --is-linux

# Create Web App with Python 3.11 runtime
az webapp create --resource-group $RESOURCE_GROUP --plan "${APP_NAME}-plan" --name $APP_NAME --runtime "PYTHON:3.11"

# Configure startup command
az webapp config set --resource-group $RESOURCE_GROUP --name $APP_NAME --startup-file "gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000"

# Deploy code from local Git
az webapp deployment source config-local-git --name $APP_NAME --resource-group $RESOURCE_GROUP

# Get deployment credentials
az webapp deployment list-publishing-credentials --name $APP_NAME --resource-group $RESOURCE_GROUP --query "{username:publishingUserName, password:publishingPassword}" --output table

# Add Azure remote and push
git remote add azure https://<username>@$APP_NAME.scm.azurewebsites.net/$APP_NAME.git
git push azure main
```

## Deploy to Render

### Quick Deployment

1. Go to https://render.com
2. Connect your GitHub repository: `algsoch/html-checker`
3. Create new Web Service
4. Render will auto-detect `render.yaml` configuration
5. Click "Create Web Service"

**Configuration in `render.yaml`:**
```yaml
plan: free  # or 'starter' for $7/month always-on service
startCommand: gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120
```

**Free Tier Limitations:**
- Service sleeps after 15 minutes of inactivity
- ~50 second cold start on first request
- 750 hours/month limit

**Upgrade to Starter ($7/month) for:**
- Always-on service (no sleep)
- No cold starts
- Unlimited hours

### Troubleshooting

If your deployment fails or gets suspended, see our comprehensive [**Render Troubleshooting Guide**](RENDER_TROUBLESHOOTING.md).

Or use Render CLI:
```powershell
# Install Render CLI
npm install -g render-cli

# Login
render login

# Deploy
render deploy
```

## Post-Deployment

### Azure URL:
`https://<APP_NAME>.azurewebsites.net`

### Render URL:
`https://<APP_NAME>.onrender.com`

## Troubleshooting

### Azure Logs
```powershell
az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP
```

### Check deployment status
```powershell
az webapp deployment list --name $APP_NAME --resource-group $RESOURCE_GROUP
```

# Deployment Guide

## Multiple Deployment Options

This guide covers deployment to various cloud platforms. Choose the one that best fits your needs and budget.

---

## 1. Deploy to Azure App Service

Azure offers reliable hosting with good integration with GitHub Actions.

### Available Azure Regions (App Service Supported)

**Recommended regions:**
- `eastus` - East US (Low latency for US)
- `westus2` - West US 2 (Low latency for West Coast)
- `centralindia` - Central India (Best for India)
- `southeastasia` - Southeast Asia (Best for Asia-Pacific)
- `westeurope` - West Europe (Best for Europe)
- `uksouth` - UK South (Best for UK/Europe)

### Prerequisites
- Azure CLI installed
- Logged in: `az login`

### Quick Deployment

```bash
# Set variables
RESOURCE_GROUP="html-checker-rg"
APP_NAME="html-citation-cleaner"
LOCATION="centralindia"  # Change to your preferred region

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan
# Free F1: Good for testing
# Basic B1: Recommended for production ($13/month)
az appservice plan create --name "${APP_NAME}-plan" --resource-group $RESOURCE_GROUP --location $LOCATION --sku B1 --is-linux

# Create Web App with Python 3.11 runtime
az webapp create --resource-group $RESOURCE_GROUP --plan "${APP_NAME}-plan" --name $APP_NAME --runtime "PYTHON:3.11"

# Configure startup command
az webapp config set --resource-group $RESOURCE_GROUP --name $APP_NAME --startup-file "gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 120"

# Deploy code from GitHub (recommended)
# Or use local Git deployment (see below)
```

### GitHub Actions Deployment (Recommended)

The repository includes `.github/workflows/main_html-checker.yml` for automatic deployment:

1. Create Azure App Service
2. Configure deployment credentials in GitHub secrets
3. Push to main branch - auto-deploys!

### Azure Pricing
- **Free F1**: $0/month (60 CPU min/day, 1GB RAM, 1GB storage)
- **Basic B1**: ~$13/month (Unlimited, 1.75GB RAM) - **Recommended**
- **Standard S1**: ~$70/month (Better performance, auto-scaling)

### Troubleshooting

**View Logs:**
```bash
az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP
```

**Check Deployment Status:**
```bash
az webapp deployment list --name $APP_NAME --resource-group $RESOURCE_GROUP
```

**Your App URL:**
`https://<APP_NAME>.azurewebsites.net`

---

## 2. Deploy to DigitalOcean App Platform

Simple deployment with competitive pricing.

### Deployment Steps

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository: `algsoch/html-checker`
4. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Run Command**: `gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120`
   - **HTTP Port**: 8080
5. Choose your plan:
   - **Basic**: $5/month (512MB RAM)
   - **Professional**: $12/month (1GB RAM)
6. Click "Launch App"

**Auto-deploys** on every push to main branch!

---

## 3. Deploy to Railway

Modern platform with good developer experience.

### Deployment Steps

1. Go to [Railway](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `algsoch/html-checker`
5. Railway auto-detects Python and installs dependencies
6. Add environment variable (if needed):
   - `PORT`: 8000
7. Update start command in settings:
   ```
   gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120
   ```

### Railway Pricing
- **Hobby**: $5/month (512MB RAM, shared CPU)
- **Pro**: From $20/month

---

## 4. Deploy to Heroku

### Prerequisites
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- `Procfile` (already included in repository)

### Deployment Steps

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main

# Open app
heroku open
```

### Heroku Pricing
- **Basic**: $7/month per dyno
- **Standard**: $25-50/month per dyno

**Note:** Heroku discontinued free tier in November 2022.

---

## 5. Deploy to Google Cloud Run

Serverless deployment with pay-per-use pricing.

### Deployment Steps

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Create `Dockerfile`:
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   EXPOSE 8080
   CMD ["gunicorn", "main:app", "--workers", "2", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080", "--timeout", "120"]
   ```
3. Deploy:
   ```bash
   gcloud run deploy html-checker --source . --platform managed --region us-central1 --allow-unauthenticated
   ```

### Google Cloud Run Pricing
- **Free Tier**: 2 million requests/month
- **After Free Tier**: ~$0.24 per million requests

---

## 6. Deploy to Fly.io

Global deployment platform.

### Deployment Steps

1. Install [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)
2. Login:
   ```bash
   fly auth login
   ```
3. Initialize and deploy:
   ```bash
   fly launch
   fly deploy
   ```

### Fly.io Pricing
- **Free**: 3 shared-cpu-1x VMs with 256MB RAM
- **Paid**: Starting at $1.94/month per VM

---

## Deployment Comparison Table

| Platform | Entry Price | Free Tier | Best For |
|----------|-------------|-----------|----------|
| **Azure App Service** | $13/month (B1) | Limited F1 | Enterprise, reliability |
| **DigitalOcean** | $5/month | No | Simple pricing |
| **Railway** | $5/month | 500 hrs/mo | Modern dev experience |
| **Heroku** | $7/month | No | Quick deployment |
| **Google Cloud Run** | Pay-per-use | 2M req/mo | Variable traffic |
| **Fly.io** | $1.94/month | Limited | Global edge |

---

## Recommendations

### For Students/Learning:
- **Railway**: Good trial, easy to use
- **Azure F1**: Free tier (with limitations)
- **Fly.io**: Generous free tier

### For Production:
- **Azure B1**: Reliable, $13/month ⭐ **Recommended**
- **DigitalOcean**: Simple, $5-12/month
- **Railway**: Modern, $5/month

### For Variable Traffic:
- **Google Cloud Run**: Pay only for what you use

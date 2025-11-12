# Render Deployment Troubleshooting Guide

## 🔴 My Render Deployment Failed or Was Suspended - What Should I Do?

If your Render deployment has failed or been suspended, follow this guide to get it back up and running.

---

## Common Issues and Solutions

### 1. **Service Suspended Due to Free Tier Limits**

**Symptoms:**
- Your service shows as "Suspended" in the Render dashboard
- You see a message about exceeding free tier limits
- Your app is not accessible

**Solution:**

#### Option A: Wait for Monthly Reset (Recommended for Students/Personal Use)
Render's free tier includes:
- 750 hours per month of runtime
- Automatic service sleep after 15 minutes of inactivity
- Services resume on incoming requests (cold start ~50 seconds)

If suspended, your service will automatically reset at the start of next month. Meanwhile:
1. Go to your [Render Dashboard](https://dashboard.render.com)
2. Check your usage under "Account Settings" → "Usage"
3. If you've exceeded 750 hours, wait for monthly reset

#### Option B: Upgrade to Paid Plan (Recommended for Production)
If you need your service available 24/7:
1. Go to your service settings in Render dashboard
2. Click "Settings" → "Plan"
3. Upgrade to **Starter Plan** ($7/month):
   - No cold starts
   - Always-on service
   - Better performance
4. Update your `render.yaml`:
   ```yaml
   plan: starter  # Change from 'free' to 'starter'
   ```

#### Option C: Disable Keep-Alive Workflow (Reduce Free Tier Usage)
The GitHub Actions keep-alive workflow pings your service every 5 minutes, which can consume your free hours quickly:

**To disable it:**
1. Go to your GitHub repository
2. Navigate to `.github/workflows/keep-alive.yml`
3. Either delete the file or disable the workflow:
   - Go to "Actions" tab in GitHub
   - Click "Keep Render Service Alive" workflow
   - Click "..." (three dots) → "Disable workflow"

**Note:** Disabling keep-alive means your free tier service will sleep after 15 minutes of inactivity.

---

### 2. **Deployment Failed During Build**

**Symptoms:**
- Build fails with errors in Render dashboard
- "Build failed" status
- Error messages in logs

**Common Causes & Solutions:**

#### A. Dependency Installation Issues
```bash
# Check your requirements.txt has correct versions
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
gunicorn==21.2.0
```

#### B. Python Version Mismatch
Make sure `render.yaml` specifies a supported Python version:
```yaml
envVars:
  - key: PYTHON_VERSION
    value: 3.13.0  # or 3.11, 3.12
```

#### C. Build Command Issues
Ensure your build command is correct:
```yaml
buildCommand: pip install -r requirements.txt
```

**To fix:**
1. Check build logs in Render dashboard
2. Fix any dependency or syntax errors
3. Push changes to GitHub (auto-deploys)
4. Or click "Manual Deploy" → "Clear build cache & deploy"

---

### 3. **Service Starts But Crashes Immediately**

**Symptoms:**
- Service deploys successfully but immediately goes down
- "Service unavailable" errors
- Health check fails

**Solutions:**

#### Check Start Command
Ensure your start command is correct in `render.yaml`:
```yaml
# For free tier - use 1 worker
startCommand: gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120

# For paid tier - can use 2-4 workers
startCommand: gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120
```

#### Check Port Configuration
Render automatically sets the `PORT` environment variable. Make sure your app uses it:
```python
# In main.py - this should already be correct
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

#### View Logs
1. Go to Render dashboard → Your service
2. Click "Logs" tab
3. Look for error messages
4. Common issues:
   - Port binding errors
   - Module import errors
   - File permission errors

---

### 4. **Cold Starts Are Too Slow (Free Tier)**

**Symptoms:**
- First request after inactivity takes ~50 seconds
- Service works fine after warming up

**This is expected behavior for free tier.** Solutions:

#### Option A: Accept Cold Starts (Free)
Free tier services automatically sleep after 15 minutes of inactivity:
- First request wakes the service (~50 seconds)
- Subsequent requests are fast
- No cost

#### Option B: Keep Service Warm (Uses More Hours)
Re-enable the keep-alive workflow:
1. Keep `.github/workflows/keep-alive.yml` enabled
2. This pings your service every 5 minutes
3. **Warning:** Uses ~12 hours per day = 360 hours/month of your 750-hour limit

#### Option C: Upgrade to Paid Plan
Starter plan ($7/month) keeps your service always-on with no cold starts.

---

## How to Redeploy Your Service

### If Your Service is Suspended:

1. **Check Your Usage:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Check "Account Settings" → "Usage"
   - See if you've exceeded free tier limits

2. **Wait for Reset (If Exceeded):**
   - Free tier resets monthly
   - Or upgrade to paid plan

3. **Redeploy:**
   - Make a small change to your repo (e.g., update README)
   - Push to GitHub → Auto-deploys
   - Or click "Manual Deploy" in Render dashboard

### If Deployment Failed:

1. **Check Build Logs:**
   - Render dashboard → Your service → "Logs" tab
   - Look for error messages during build

2. **Clear Cache and Retry:**
   - Render dashboard → "Manual Deploy"
   - Check "Clear build cache"
   - Click "Deploy"

3. **Verify Configuration:**
   - Check `render.yaml` is correct
   - Check `requirements.txt` has all dependencies
   - Check Python version matches

---

## Recommended Setup for Different Users

### For Students / Personal Projects (Free)
```yaml
# render.yaml
plan: free
startCommand: gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120
```
- **Keep-Alive:** Disabled (save hours)
- **Expected:** Cold starts after 15 min inactivity
- **Cost:** $0/month

### For Production / Always-On (Paid)
```yaml
# render.yaml
plan: starter  # $7/month
startCommand: gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120
```
- **Keep-Alive:** Can keep enabled
- **Expected:** No cold starts, always responsive
- **Cost:** $7/month

---

## Quick Checklist

- [ ] Check if service is suspended in Render dashboard
- [ ] Check usage limits (Account Settings → Usage)
- [ ] Verify `render.yaml` has correct configuration
- [ ] Verify `requirements.txt` has all dependencies
- [ ] Check build logs for errors
- [ ] Decide if you want to use free tier or upgrade
- [ ] Disable keep-alive workflow if using free tier
- [ ] Redeploy from GitHub or Render dashboard

---

## Still Having Issues?

1. **Check Render Status:** https://status.render.com
2. **View Render Docs:** https://render.com/docs
3. **Check Logs:** Render Dashboard → Your Service → Logs
4. **Open Issue:** https://github.com/algsoch/html-checker/issues

---

## Additional Resources

- [Render Free Tier Limits](https://render.com/docs/free)
- [Render Troubleshooting Guide](https://render.com/docs/troubleshooting)
- [Render Python Deployment](https://render.com/docs/deploy-fastapi)
- [GitHub Actions Usage](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)

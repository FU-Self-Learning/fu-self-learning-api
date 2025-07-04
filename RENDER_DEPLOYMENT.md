# Render.com Deployment Guide

## Quick Setup

### Option 1: Automatic Deployment (Recommended)

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` configuration

2. **Deploy**
   - Render will automatically build and deploy your application
   - No additional configuration needed

### Option 2: Manual Configuration

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Settings**
   - **Name**: `fu-learning-api`
   - **Environment**: `Node`
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn start`

3. **Environment Variables**
   Add these in the Render dashboard:
   ```
   NODE_ENV=production
   NODE_OPTIONS=--max-old-space-size=2048
   PORT=3000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your application

## Memory Optimization

The application is configured with:
- **Build Memory**: 4GB (via NODE_OPTIONS)
- **Runtime Memory**: 2GB (via start script)
- **Health Checks**: Available at `/health`

## Troubleshooting

### Memory Issues
If you still encounter memory issues:

1. **Increase Memory in Render Dashboard**:
   - Go to your service settings
   - Upgrade to a higher plan (Starter → Standard)

2. **Check Environment Variables**:
   - Ensure `NODE_OPTIONS=--max-old-space-size=2048` is set

3. **Verify Build Process**:
   - Check build logs for any errors
   - Ensure `yarn build` completes successfully

### Health Check
Test your deployment:
```bash
curl https://your-app-name.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Support

If you continue to have issues:
1. Check Render's [troubleshooting guide](https://render.com/docs/troubleshooting-deploys)
2. Review build logs in Render dashboard
3. Ensure all environment variables are properly set 
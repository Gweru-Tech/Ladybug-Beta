# 🐛 Deployment Troubleshooting Guide

## Common Docker Build Issues & Solutions

### ❌ Error: `npm ci --only=production` failed

**Problem**: The `npm ci` command requires exact package-lock.json versions and `--only=production` is deprecated.

**Solution**: 
1. Use `npm install --omit=dev` instead
2. Or use `npm install --production`
3. Updated in Dockerfile.render

### ❌ Error: Missing native dependencies

**Problem**: FFmpeg, ImageMagick, or other system dependencies missing.

**Solution**: 
1. Use `Dockerfile.render` which includes all system deps
2. Add `RUN apk add --no-cache ffmpeg imagemagick` to Dockerfile

### ❌ Error: Baileys import issues

**Problem**: Incompatible baileys version or missing dependencies.

**Solution**:
1. Use exact version: `"@whiskeysockets/baileys": "^6.6.0"`
2. Remove Boom import if not needed
3. Check all baileys function calls

### ❌ Error: Node.js version too old

**Problem**: Render.com using old Node.js version.

**Solution**:
```yaml
# In render.yaml
env: node
runtime: node-18
```

## Quick Fix Deploy Options

### Option 1: Use Simplified Dockerfile
```bash
# Use Dockerfile.render instead of Dockerfile
mv Dockerfile.render Dockerfile
```

### Option 2: Render.com Direct Node.js Deploy
1. Don't use Docker
2. Use Node.js environment directly
3. Set build command: `npm install --verbose`
4. Set start command: `npm start`

### Option 3: Manual Dependencies
```bash
# Remove problematic packages
npm uninstall jimp sharp fluent-ffmpeg
# Keep only essential ones
npm install @whiskeysockets/baileys express socket.io ejs chalk axios
```

## Step-by-Step Render.com Fix

1. **Update render.yaml**:
```yaml
services:
  - type: web
    name: ladybug-beta-bot
    env: node
    plan: starter
    buildCommand: npm install --verbose
    startCommand: npm start
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
```

2. **Use simplified package.json**:
```json
{
  "dependencies": {
    "@whiskeysockets/baileys": "^6.6.0",
    "express": "^4.18.2",
    "socket.io": "^4.7.4",
    "ejs": "^3.1.9",
    "chalk": "^4.1.2",
    "axios": "^1.6.2",
    "qrcode": "^1.5.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "node-cron": "^3.0.3",
    "dotenv": "^16.3.1"
  }
}
```

3. **Remove problematic imports**:
```javascript
// Remove these from all files:
// const { Boom } = require('@hapi/boom');
// const jimp = require('jimp');
// const sharp = require('sharp');
// const ffmpeg = require('fluent-ffmpeg');
```

## Testing Locally Before Deploy

```bash
# Test with minimal setup
npm install --verbose
npm start

# If works, then deploy
git add .
git commit -m "Fix deployment issues"
git push origin main
```

## Common Render.com Specific Issues

### ❌ "Build failed: exit status 1"

**Causes & Fixes**:
1. **Package install failed**: Use `npm install --verbose` to see details
2. **Node version too old**: Add `runtime: node-18` to render.yaml
3. **Memory limit exceeded**: Use starter plan with more RAM
4. **Timeout**: Increase build timeout in Render dashboard

### ❌ "Application not responding"

**Causes & Fixes**:
1. **Port hardcoded**: Use `process.env.PORT || 3000`
2. **Health check failing**: Set correct health check path
3. **Server crash**: Check Render logs for errors

### ❌ "WebSocket connection failed"

**Causes & Fixes**:
1. **Socket.io version mismatch**: Use latest stable version
2. **CORS issues**: Configure cors properly
3. **HTTPS issues**: Use `https://` not `http://`

## Final Working Configuration

### render.yaml (Working Version)
```yaml
services:
  - type: web
    name: ladybug-beta-bot
    env: node
    runtime: node-18
    plan: starter
    buildCommand: npm install --verbose
    startCommand: npm start
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: BOT_NAME
        value: LADYBUG BETA
      - key: OWNER_NAME
        value: Knight Developer
      - key: OWNER_NUMBER
        value: 263718456744
      - key: AUTO_START
        value: true
      - key: AI_ENABLED
        value: true
```

### package.json (Minimal Working Version)
```json
{
  "name": "ladybug-beta-bot",
  "version": "2.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "^6.6.0",
    "express": "^4.18.2",
    "socket.io": "^4.7.4",
    "ejs": "^3.1.9",
    "chalk": "^4.1.2",
    "axios": "^1.6.2",
    "qrcode": "^1.5.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "node-cron": "^3.0.3",
    "dotenv": "^16.3.1",
    "fs-extra": "^11.1.1",
    "node-cache": "^5.1.2",
    "awesome-phonenumber": "^6.5.0",
    "moment": "^2.29.4"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Still Having Issues?

1. **Check Render.com logs**: Dashboard → Logs
2. **Test locally**: `npm install && npm start`
3. **Use minimal version**: Remove all non-essential features
4. **Contact support**: Render.com support is very helpful

## Deploy Success Indicators

✅ **Build completes** without errors  
✅ **Health check passes**  
✅ **Application starts** and responds  
✅ **Web dashboard loads** at your URL  
✅ **Bot connects** to WhatsApp  

If you follow these fixes, your deployment should work! 🚀
# Deployment Guide

This guide provides detailed instructions for deploying the Discord bot on various platforms.

## ⚠️ Platform Compatibility

### ❌ INCOMPATIBLE Platforms

**DO NOT** attempt to deploy this bot on:
- **Cloudflare Workers** - Cannot maintain WebSocket connections
- **Cloudflare Pages** - Designed for static sites, not long-running processes
- **AWS Lambda** - Serverless functions with execution time limits
- **Vercel** - Serverless platform optimized for web apps
- **Netlify Functions** - Serverless functions, not long-running processes

**Why these don't work:**
Discord bots require persistent WebSocket connections to Discord's Gateway API. These platforms are designed for stateless, short-lived serverless functions and cannot maintain the long-running connections that Discord bots need.

### ✅ COMPATIBLE Platforms

## Option 1: Railway (Recommended - Easy & Free)

Railway is perfect for Discord bots with a generous free tier.

1. **Prerequisites:**
   - GitHub account
   - Railway account (sign up at https://railway.app)

2. **Deployment Steps:**
   ```bash
   # Install Railway CLI (optional)
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   
   # Add environment variables
   railway variables set TOKEN=your_discord_bot_token
   
   # Deploy
   railway up
   ```

3. **Via Dashboard:**
   - Go to https://railway.app/new
   - Select "Deploy from GitHub repo"
   - Choose this repository
   - Add environment variables in the Variables tab
   - Railway will auto-deploy using the Dockerfile

## Option 2: Heroku

1. **Install Heroku CLI:**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Ubuntu/Debian
   sudo snap install --classic heroku
   ```

2. **Deploy:**
   ```bash
   # Login
   heroku login
   
   # Create app
   heroku create your-bot-name
   
   # Set environment variables
   heroku config:set TOKEN=your_discord_bot_token
   
   # Deploy
   git push heroku main
   ```

## Option 3: Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Add `TOKEN` and other variables
5. Click "Create Web Service"

## Option 4: DigitalOcean Droplet (VPS)

1. **Create Droplet:**
   - Choose Ubuntu 22.04 LTS
   - Select appropriate plan ($6/month minimum recommended)

2. **Setup Server:**
   ```bash
   # SSH into your server
   ssh root@your-droplet-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt-get install -y nodejs
   
   # Install PM2 (process manager)
   npm install -g pm2
   
   # Clone repository
   git clone https://github.com/Axlirr/All-in-one-cheese.git
   cd All-in-one-cheese
   
   # Install dependencies
   npm install
   
   # Create .env file
   nano .env
   # Add your TOKEN and other variables
   
   # Start bot with PM2
   pm2 start src/index.js --name discord-bot
   pm2 save
   pm2 startup
   ```

## Option 5: Docker Deployment

The repository includes a Dockerfile for containerized deployment.

1. **Build the image:**
   ```bash
   docker build -t discord-bot .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name discord-bot \
     -e TOKEN=your_discord_bot_token \
     -e MONGODB_URI=your_mongodb_uri \
     --restart unless-stopped \
     discord-bot
   ```

3. **Deploy to container platforms:**
   - Railway (auto-detects Dockerfile)
   - DigitalOcean App Platform
   - Google Cloud Run
   - AWS ECS

## Option 6: Local/Home Server

Run the bot on your own computer:

1. **Install Node.js 20+:**
   - Download from https://nodejs.org

2. **Clone and Setup:**
   ```bash
   git clone https://github.com/Axlirr/All-in-one-cheese.git
   cd All-in-one-cheese
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your bot token and settings
   ```

4. **Run the Bot:**
   ```bash
   npm start
   ```

5. **Keep Running (Optional):**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start with PM2
   pm2 start src/index.js --name discord-bot
   pm2 save
   pm2 startup
   ```

## Environment Variables

Required environment variables:

```env
TOKEN=your_discord_bot_token
MONGODB_URI=your_mongodb_connection_string
```

Optional environment variables (see `.env.example` for full list):
- `PREFIX` - Bot command prefix
- `WEBHOOK_ID` - Discord webhook ID for logging
- `WEBHOOK_TOKEN` - Discord webhook token
- `PORT` - Port for keep-alive server (default: 3000)

## Troubleshooting

### "Missing entry-point to Worker script"
This error occurs when trying to deploy to Cloudflare Workers. This bot cannot run on Cloudflare Workers - use one of the compatible platforms listed above.

### "Canvas package build failed"
The bot automatically skips canvas packages. If you see this error:
1. Make sure `.npmrc` and `bunfig.toml` files exist
2. These files configure the installer to skip optional dependencies
3. Image manipulation commands will be disabled but the bot will work

### Bot goes offline after deployment
- Make sure you're using a platform that supports long-running processes (not serverless)
- Check that environment variables are set correctly
- Review logs for connection errors

## Performance Recommendations

- **Memory:** Minimum 512MB RAM, 1GB recommended
- **Storage:** At least 1GB for bot files and node_modules
- **Network:** Stable internet connection with low latency to Discord

## Support

If you encounter issues:
1. Check the logs on your deployment platform
2. Join the support server: https://discord.gg/uoaio
3. Review the setup video: https://youtu.be/CQP6M9AbO_E

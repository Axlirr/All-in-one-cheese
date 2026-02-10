# Discord-Bot
## 🤖 Discord bot with over 500+ commands.

![image](https://images-ext-2.discordapp.net/external/g3g819pEvW-xa-WU2rqgFRFkhuPflF4_mxoK63VPZ0A/https/storage.googleapis.com/replit/images/1671693930209_5b7ac25cf82388ebc5dc9793fa0bbc97.png)


# [ALL IN ONΞ™](https://tinyurl.com/3jvb65tv)
## [YouTube](https://tinyurl.com/3jvb65tv )
### [Support Server](https://discord.gg/uoaio)

# How to setup the bot?
- Watch YouTube Video: [Click Here](https://youtu.be/CQP6M9AbO_E)
- **📖 [Deployment Guide](DEPLOYMENT.md)** - Detailed instructions for deploying on various platforms
---

## ⚠️ Important: Deployment Platform Compatibility

### ❌ **NOT Compatible with Cloudflare Workers**

**This Discord bot CANNOT run on Cloudflare Workers, Cloudflare Pages, or similar serverless platforms.**

**Why?**
- Discord bots require **persistent WebSocket connections** to Discord's Gateway
- Cloudflare Workers are **stateless serverless functions** that cannot maintain long-lived connections
- Discord bots need to run continuously, while Workers are event-driven with short execution times

If you see an error like "Missing entry-point to Worker script" when deploying to Cloudflare, this is expected - the platform is incompatible with Discord bots.

### ✅ **Compatible Deployment Options:**

This bot should be deployed on platforms that support long-running Node.js processes:

1. **VPS/Cloud Servers**
   - DigitalOcean Droplets
   - AWS EC2
   - Google Cloud Compute Engine
   - Linode
   - Vultr

2. **Platform-as-a-Service (PaaS)**
   - [Railway](https://railway.app/) - Easy deployment, generous free tier
   - [Heroku](https://heroku.com/) - Traditional PaaS
   - [Render](https://render.com/) - Modern PaaS
   - [Fly.io](https://fly.io/) - Distributed platform

3. **Container Platforms**
   - Use the included `Dockerfile`
   - Deploy to any container platform (Railway, Render, DigitalOcean App Platform, etc.)

4. **Local/Self-Hosted**
   - Run on your own computer or home server
   - Keep the terminal/process running 24/7

### Installation & Build Configuration

The repository includes configuration files that automatically skip optional dependencies during build:
- **`.npmrc`** - Configures npm to skip optional dependencies
- **`bunfig.toml`** - Configures bun to skip optional dependencies

These files ensure successful builds without canvas native dependencies.

### Installation Options:

**Standard installation (recommended):**
```bash
npm install
# or
bun install
```
The `.npmrc` and `bunfig.toml` files automatically skip optional dependencies.

**For local development with all features:**
```bash
npm install --include=optional
# or
bun install --optional
```
This installs canvas packages for image manipulation features. Requires system dependencies (cairo, pango, pixman).

### Optional Features

The following features require canvas packages and will be disabled if not installed:
- **Image manipulation commands** (bed, blur, burn, colorify, darkness, facepalm, greyscale, kiss, podium, spank, wanted, clyde)
- **Rank card generation** (rank command)
- **Captcha verification system**

### Running the Bot

```bash
npm start
# or
node . --trace-warnings
```

---

### 💘 Emotes Servers 

* 1.0: https://discord.gg/RjHTDAQHkR
* 2.0: https://discord.gg/CAYR2SN76Z
* 2.1.0: https://discord.gg/fmhTFzruzP
* 3.0: https://discord.gg/hpwuhE2vVE
* 3.1.0: https://discord.gg/M7DWTrYEWZ

### 💕Credit
- Code By Arbaz
- Modified By Arbaz

## ✨ Discord Profile
<div align="center">
  <a width="100%" href="https://dsc.gg/uoaio"  target="_blank">
    <img align="mid" height="100%" width="100%" style="margin: 0 10px 0 0;" alt=" " src="https://discord.c99.nl/widget/theme-3/922120042651451423.png">
    <img align="mid" height="100%" width="100%" style="margin: 0 10px 0 0;" alt=" " src="https://discord.c99.nl/widget/theme-2/755297485328482356.png">  
  </a>
</div>
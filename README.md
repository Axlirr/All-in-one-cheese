# Discord-Bot
## 🤖 Discord bot with over 500+ commands.

![image](https://images-ext-2.discordapp.net/external/g3g819pEvW-xa-WU2rqgFRFkhuPflF4_mxoK63VPZ0A/https/storage.googleapis.com/replit/images/1671693930209_5b7ac25cf82388ebc5dc9793fa0bbc97.png)


# [ALL IN ONΞ™](https://tinyurl.com/3jvb65tv)
## [YouTube](https://tinyurl.com/3jvb65tv )
### [Support Server](https://discord.gg/uoaio)

# How to setup the bot?
- Watch YouTube Video: [Click Here](https://youtu.be/CQP6M9AbO_E)
---

## 🚀 Cloudflare Workers Deployment

This bot has been optimized for Cloudflare Workers deployment. Some features that require native dependencies (canvas rendering) are optional and will be disabled if not available:

### Optional Features (disabled in Cloudflare Workers):
- **Image manipulation commands** (bed, blur, burn, colorify, darkness, facepalm, greyscale, kiss, podium, spank, wanted, clyde)
- **Rank card generation** (rank command)
- **Captcha verification system**

### Build Configuration

The repository includes configuration files that automatically skip optional dependencies during build:
- **`.npmrc`** - Configures npm to skip optional dependencies
- **`bunfig.toml`** - Configures bun to skip optional dependencies

These files ensure that Cloudflare Workers and similar platforms can build without requiring native system dependencies.

### Installation Options:

**For Cloudflare Workers (without canvas) - Automatic:**
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

**Manual installation without optional deps:**
```bash
npm install --omit=optional
# or
bun install --optional=false
```

Note: Full installation requires system dependencies (cairo, pango, pixman) which are not available in Cloudflare Workers environment.

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
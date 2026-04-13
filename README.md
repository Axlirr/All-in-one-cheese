# All-in-one Cheese Bot
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
  <rect width="1200" height="400" fill="#0d1117" rx="15"/>
  <rect width="1200" height="400" fill="url(#grad)" rx="15" opacity="0.4"/>

  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fca311" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#5865F2" stop-opacity="0.1"/>
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffb703"/>
      <stop offset="100%" stop-color="#fb8500"/>
    </linearGradient>
  </defs>

  <circle cx="1050" cy="80" r="150" fill="#fca311" opacity="0.1" filter="blur(40px)"/>
  <circle cx="150" cy="320" r="200" fill="#5865F2" opacity="0.1" filter="blur(50px)"/>

  <g transform="translate(100, 120)">
    <path d="M 10 70 Q 30 10, 90 20 Q 130 50, 140 100 Q 80 130, 20 110 Z" fill="#ffb703"/>
    <circle cx="45" cy="55" r="12" fill="#0d1117" opacity="0.8"/>
    <circle cx="95" cy="45" r="8" fill="#0d1117" opacity="0.8"/>
    <circle cx="75" cy="85" r="15" fill="#0d1117" opacity="0.8"/>
    <circle cx="35" cy="95" r="6" fill="#0d1117" opacity="0.8"/>
    <circle cx="115" cy="75" r="10" fill="#0d1117" opacity="0.8"/>
  </g>

  <text x="300" y="180" font-family="Arial, sans-serif" font-weight="900" font-size="68" fill="url(#textGrad)">
    All-in-one Cheese
  </text>
  
  <text x="305" y="240" font-family="Arial, sans-serif" font-weight="400" font-size="28" fill="#c9d1d9">
    The Ultimate Moderation &amp; Utility Discord Bot
  </text>

  <g transform="translate(305, 290)">
    <rect x="0" y="0" width="160" height="40" rx="8" fill="#21262d"/>
    <text x="80" y="26" font-family="Arial, sans-serif" font-size="16" fill="#8b949e" text-anchor="middle">Discord.js v14</text>
    
    <rect x="175" y="0" width="130" height="40" rx="8" fill="#21262d"/>
    <text x="240" y="26" font-family="Arial, sans-serif" font-size="16" fill="#8b949e" text-anchor="middle">Moderation</text>
    
    <rect x="320" y="0" width="110" height="40" rx="8" fill="#21262d"/>
    <text x="375" y="26" font-family="Arial, sans-serif" font-size="16" fill="#8b949e" text-anchor="middle">MongoDB</text>
    
    <rect x="445" y="0" width="170" height="40" rx="8" fill="#21262d"/>
    <text x="530" y="26" font-family="Arial, sans-serif" font-size="16" fill="#8b949e" text-anchor="middle">Economy &amp; Utility</text>
  </g>
</svg>

A production-ready Discord bot focused on **moderation, utility, engagement, and server operations**.

## Highlights

- ✅ Slash-command architecture (Discord.js v14)
- ✅ Moderation suite (ban/kick/warn/timeout/lockdown/etc.)
- ✅ Ticketing, giveaways, invites, leveling, economy, music, automod
- ✅ WorldMonitor-style automated news posting to configurable channels
- ✅ MongoDB persistence for server configurations and user state
- ✅ Sharded runtime support
- ✅ Webhook-based operational logging

## New: Moderator Performance System

This release includes a built-in performance layer for moderation teams.

### What it tracks automatically

- moderation command activity per moderator
- command success/failure counts
- average command response time
- action-type breakdown (ban/kick/warn/etc.)
- last active moderation timestamp

### New moderation subcommands

- `/moderation performance [moderator]` → detailed moderator metrics
- `/moderation leaderboard` → top moderators by composite performance score
- `/moderation rate <moderator> <score> [note]` → manager/admin ratings (1–5)
- `/moderation resetstats [moderator]` → reset one moderator or all stats (admin)

## New: Automated News Channels (WorldMonitor-inspired)

You can now configure automatic news posting with source variants adapted from WorldMonitor feed strategy.

### Config commands

- `/config setnewschannel channel:<#channel> variant:<world|tech|finance|happy> interval:<5-120>`
- `/config newsstatus`
- `/config disablenews`
- `/config postnewsnow` (manual test trigger)

### How it works

- Polls curated RSS sources by selected variant
- Posts only unseen links to avoid duplicates
- Maintains per-guild state (channel, variant, interval, seen links)
- Runs in a resilient background cycle without blocking bot startup

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env` and set required values:

- `DISCORD_TOKEN`
- `MONGO_TOKEN`
- optional webhook and external API tokens

### 3) Start the bot

```bash
npm start
```

## Project Structure

- `src/interactions` → slash/context menu command definitions
- `src/commands` → subcommand implementations
- `src/events` → Discord event handlers
- `src/handlers` → loaders/utilities/core helpers
- `src/database/models` → MongoDB models

## Economy Stability Improvements

- Reworked core economy helpers to use safer update patterns
- Added transfer helper with explicit insufficient-funds handling
- Hardened `/economy daily`, `/economy pay`, `/economy buy`, and `/economy balance`
- Added purchase rollback logic when role assignment fails

## Owner-Only Sensitive Commands

Sensitive commands are restricted to the owner ID:

- `632558364664004652`

Configured via:

- `OWNER_ID` in `.env`

Current restrictions include high-risk command areas like developer controls and selected economy/config/admin subcommands.

## Command Health Checks

Run this to detect missing command handlers before deploying:

```bash
npm run health:commands
```

## Cleanup & Hardening Included

- Removed obsolete Replit artifacts and Windows desktop metadata
- Removed unnecessary package dependencies (`fs`, `util`, `i`)
- Removed duplicate keepalive HTTP server in shard process
- Improved moderation safety check in kick flow
- Added safer subcommand loader with graceful fallback errors

## License

MIT

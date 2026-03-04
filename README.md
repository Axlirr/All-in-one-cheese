# All-in-one Cheese Bot

A production-ready Discord bot focused on **moderation, utility, engagement, and server operations**.

## Highlights

- ✅ Slash-command architecture (Discord.js v14)
- ✅ Moderation suite (ban/kick/warn/timeout/lockdown/etc.)
- ✅ Ticketing, giveaways, invites, leveling, economy, music, automod
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

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env` and set required values:

- `DISCORD_TOKEN`
- `MONGO_URI`
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

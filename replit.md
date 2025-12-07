# Discord Bot

A feature-rich Discord bot with 400+ commands including moderation, music, games, economy, leveling, tickets, and more.

## Overview
- **Framework**: Discord.js v14
- **Database**: MongoDB
- **Node.js**: v17.9.1

## Environment Variables

### Required
- `DISCORD_TOKEN` - Bot token from Discord Developer Portal
- `MONGO_TOKEN` - MongoDB connection string
- `DISCORD_ID` - Application ID for slash command registration

### Optional
- `WEBHOOK_ID` & `WEBHOOK_TOKEN` - For logging to Discord webhooks
- `SPOTIFY_CLIENT_ID` & `SPOTIFY_CLIENT_SECRET` - For Spotify music integration
- `LAVALINK_HOST`, `LAVALINK_PORT`, `LAVALINK_PASSWORD` - For music playback
- `TOPGG_TOKEN` - For Top.gg bot listing integration
- `DISCORD_STATUS` - Custom status messages (comma-separated)

## Project Structure
```
src/
├── commands/          # Legacy prefix commands (organized by category)
├── interactions/      # Slash commands and context menus
├── events/           # Discord event handlers
├── handlers/         # Core bot handlers (commands, events, etc.)
├── database/         # MongoDB models and connection
├── config/           # Bot configuration files
├── assets/           # Utilities and static assets
├── bot.js           # Main bot client
└── index.js         # Sharding manager entry point
```

## Running the Bot
The bot runs via the "Discord Bot" workflow using `npm start`.

## Bot Invite Link
```
https://discord.com/oauth2/authorize?client_id=1439599263368740865&scope=applications.commands+bot&permissions=8
```

## Features
- Moderation (ban, kick, warn, timeout, etc.)
- Music playback (requires Lavalink server)
- Economy system
- Leveling system
- Ticket system
- Giveaways
- Games and fun commands
- Server statistics
- Auto-moderation
- Reaction roles
- And much more!

## Recent Changes
- December 2024: Fixed webhook initialization to handle missing credentials gracefully
- December 2024: Rebuilt canvas module for Node.js compatibility

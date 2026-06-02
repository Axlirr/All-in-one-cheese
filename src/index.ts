import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { connect } from 'mongoose';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { loadCommands } from './handlers/commandHandler';
import { loadEvents } from './handlers/eventHandler';

// Extend the Discord Client to include a commands collection
declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, any>;
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// Connect to MongoDB
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing from .env');
  process.exit(1);
}
connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

// Load commands and events
loadCommands(client);
loadEvents(client);

client.login(process.env.DISCORD_TOKEN);

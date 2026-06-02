import { Client, TextChannel, Guild } from 'discord.js';
import { User } from '../database/User';

export interface AgentContext {
  client: Client;
  guildId: string;
  channelId: string;
  userId?: string;
}

export const agentTools = {
  editMessage: async ({ client, guildId, channelId }: AgentContext, targetChannelId: string, messageId: string, newContent: string) => {
    try {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return 'Failed: Guild not found.';
      const channel = guild.channels.cache.get(targetChannelId) as TextChannel;
      if (!channel) return 'Failed: Channel not found.';
      const msg = await channel.messages.fetch(messageId);
      if (!msg) return 'Failed: Message not found.';
      
      await msg.edit(newContent);
      return `Successfully edited message ${messageId}.`;
    } catch (e: any) {
      return `Error editing message: ${e.message}`;
    }
  },
  
  deleteMessage: async ({ client, guildId, channelId }: AgentContext, targetChannelId: string, messageId: string) => {
    try {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return 'Failed: Guild not found.';
      const channel = guild.channels.cache.get(targetChannelId) as TextChannel;
      if (!channel) return 'Failed: Channel not found.';
      const msg = await channel.messages.fetch(messageId);
      if (!msg) return 'Failed: Message not found.';
      
      await msg.delete();
      return `Successfully deleted message ${messageId}.`;
    } catch (e: any) {
      return `Error deleting message: ${e.message}`;
    }
  },

  kickUser: async ({ client, guildId }: AgentContext, userId: string, reason: string) => {
    try {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return 'Failed: Guild not found.';
      const member = await guild.members.fetch(userId);
      if (!member) return 'Failed: User not found in guild.';
      
      await member.kick(reason);
      return `Successfully kicked user ${userId}.`;
    } catch (e: any) {
      return `Error kicking user: ${e.message}`;
    }
  },

  banUser: async ({ client, guildId }: AgentContext, userId: string, reason: string) => {
    try {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return 'Failed: Guild not found.';
      
      await guild.members.ban(userId, { reason });
      return `Successfully banned user ${userId}.`;
    } catch (e: any) {
      return `Error banning user: ${e.message}`;
    }
  },

  chargeCheese: async ({ guildId, userId }: AgentContext, amount: number, reason: string) => {
    if (!userId) return 'Failed: Cannot charge cheese, user ID is unknown.';
    try {
      let userDb = await User.findOne({ userId, guildId });
      if (!userDb) return 'Failed: User not found in database.';
      
      if (userDb.cheese < amount) {
        return `Failed: User only has ${userDb.cheese} cheese, but ${amount} was required for the bribe. Bribe rejected!`;
      }

      userDb.cheese -= amount;
      await userDb.save();
      return `Success: Deducted ${amount} cheese from the user. Their new balance is ${userDb.cheese}. Bribe accepted! Proceed with their request.`;
    } catch (e: any) {
      return `Error charging cheese: ${e.message}`;
    }
  }
};

export const agentToolDeclarations = [
  {
    name: 'editMessage',
    description: 'Edits an existing Discord message.',
    parameters: {
      type: 'object',
      properties: {
        targetChannelId: { type: 'string', description: 'The ID of the channel containing the message' },
        messageId: { type: 'string', description: 'The ID of the message to edit' },
        newContent: { type: 'string', description: 'The new text content for the message' }
      },
      required: ['targetChannelId', 'messageId', 'newContent']
    }
  },
  {
    name: 'deleteMessage',
    description: 'Deletes a Discord message.',
    parameters: {
      type: 'object',
      properties: {
        targetChannelId: { type: 'string', description: 'The ID of the channel containing the message' },
        messageId: { type: 'string', description: 'The ID of the message to delete' }
      },
      required: ['targetChannelId', 'messageId']
    }
  },
  {
    name: 'kickUser',
    description: 'Kicks a user from the server.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'The Discord ID of the user to kick' },
        reason: { type: 'string', description: 'The reason for kicking the user' }
      },
      required: ['userId', 'reason']
    }
  },
  {
    name: 'banUser',
    description: 'Bans a user from the server.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'The Discord ID of the user to ban' },
        reason: { type: 'string', description: 'The reason for banning the user' }
      },
      required: ['userId', 'reason']
    }
  },
  {
    name: 'chargeCheese',
    description: 'Deducts cheese from the user to accept a bribe.',
    parameters: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'The amount of cheese to charge as a bribe' },
        reason: { type: 'string', description: 'The reason for the bribe' }
      },
      required: ['amount', 'reason']
    }
  }
];

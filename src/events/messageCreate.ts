import { Events, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ButtonInteraction } from 'discord.js';
import { processAgentCommand } from '../agent/gemini';
import { AgentContext } from '../agent/tools';
import { User } from '../database/User';

// Track active drops to prevent multiple at once per channel
const activeDrops = new Set<string>();

export default {
  name: Events.MessageCreate,
  async execute(message: Message, client: any) {
    if (message.author.bot || !message.guildId) return;

    // --- 1. Chat Rewards ---
    let dbUser = await User.findOne({ userId: message.author.id, guildId: message.guildId });
    if (!dbUser) {
      dbUser = new User({ userId: message.author.id, guildId: message.guildId });
    }

    const now = new Date();
    // 1 minute cooldown for chat rewards
    if (now.getTime() - dbUser.lastChatReward.getTime() >= 60 * 1000) {
      dbUser.cheese += 1; // 1 cheese per active minute
      dbUser.lastChatReward = now;
      await dbUser.save();
    }

    // --- 2. Random Cheese Drops (0.5% chance) ---
    if (!activeDrops.has(message.channelId) && Math.random() < 0.005) {
      if ('send' in message.channel) {
        activeDrops.add(message.channelId);
        
        const dropAmount = Math.floor(Math.random() * 20) + 10; // 10-30 cheese drop
        
        const claimButton = new ButtonBuilder()
          .setCustomId('claim_cheese')
          .setLabel(`Claim ${dropAmount} 🧀`)
          .setStyle(ButtonStyle.Primary);
          
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(claimButton);
        
        const dropMessage = await message.channel.send({
          content: `**CHEESE DROP!** 🧀 Someone dropped **${dropAmount} cheese**! Quick, grab it!`,
          components: [row]
        });

        // Collector for the button
        const collector = dropMessage.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 60000 // 60 seconds to claim
        });

        collector.on('collect', async (interaction: ButtonInteraction) => {
          if (interaction.customId === 'claim_cheese') {
            let claimer = await User.findOne({ userId: interaction.user.id, guildId: message.guildId });
            if (!claimer) {
               claimer = new User({ userId: interaction.user.id, guildId: message.guildId! });
            }
            claimer.cheese += dropAmount;
            await claimer.save();

            await interaction.update({ content: `🎉 ${interaction.user} claimed the **${dropAmount} cheese**!`, components: [] });
            collector.stop('claimed');
          }
        });

        collector.on('end', (collected: any, reason: string) => {
          activeDrops.delete(message.channelId);
          if (reason !== 'claimed') {
            dropMessage.edit({ content: `The cheese rotted away because nobody claimed it. 😔`, components: [] }).catch(console.error);
          }
        });
      }
    }

    // --- 3. AI Agent Logic ---
    if (client.user && message.mentions.has(client.user.id)) {
      const prompt = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();

      if (!prompt) {
        await message.reply('Hello! Do you have some cheese for me?');
        return;
      }

      if ('sendTyping' in message.channel) {
        await message.channel.sendTyping();
      }

      const context: AgentContext = {
        client,
        guildId: message.guildId,
        channelId: message.channelId,
        userId: message.author.id // Pass the author ID for the bribing system
      };

      const response = await processAgentCommand(context, prompt);
      
      if (response.length > 2000) {
        await message.reply(response.substring(0, 1997) + '...');
      } else {
        await message.reply(response);
      }
    }
  },
};

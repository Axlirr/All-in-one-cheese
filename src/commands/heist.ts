import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { User } from '../database/User';

const activeHeists = new Set<string>();

export default {
  data: new SlashCommandBuilder()
    .setName('heist')
    .setDescription('Start a heist! High risk (lose 50%), high reward.'),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ content: 'Server only.', ephemeral: true });
    
    if (activeHeists.has(interaction.guildId)) {
      return interaction.reply('A heist is already being planned in this server!');
    }

    let starter = await User.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!starter || starter.cheese < 10) {
      return interaction.reply('You need at least 10 cheese to start a heist.');
    }

    activeHeists.add(interaction.guildId);
    
    const participants = new Set<string>();
    participants.add(interaction.user.id);

    const joinButton = new ButtonBuilder()
      .setCustomId('join_heist')
      .setLabel('Join Heist')
      .setStyle(ButtonStyle.Danger);
      
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(joinButton);

    const msg = await interaction.reply({
      content: `🚨 **CHEESE HEIST INITIATED BY <@${interaction.user.id}>!** 🚨\n\nYou have 60 seconds to join. **WARNING**: If you fail, you lose **50%** of your cheese!\n\nParticipants: 1`,
      components: [row],
      fetchReply: true
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000
    });

    collector.on('collect', async (btnInt) => {
      if (btnInt.customId === 'join_heist') {
        let pUser = await User.findOne({ userId: btnInt.user.id, guildId: interaction.guildId });
        if (!pUser || pUser.cheese < 10) {
          await btnInt.reply({ content: 'You need at least 10 cheese to join the heist!', ephemeral: true });
          return;
        }

        if (participants.has(btnInt.user.id)) {
          await btnInt.reply({ content: 'You are already in!', ephemeral: true });
          return;
        }

        participants.add(btnInt.user.id);
        await btnInt.update({ content: `🚨 **CHEESE HEIST INITIATED BY <@${interaction.user.id}>!** 🚨\n\nYou have 60 seconds to join. **WARNING**: If you fail, you lose **50%** of your cheese!\n\nParticipants: ${participants.size}`, components: [row] });
      }
    });

    collector.on('end', async () => {
      activeHeists.delete(interaction.guildId as string);
      
      // Base chance is 20% + 5% per participant (max 80%)
      const successChance = Math.min(0.20 + (participants.size * 0.05), 0.80);
      const isSuccess = Math.random() < successChance;

      let resultMsg = `**HEIST OVER**\nParticipants: ${participants.size}\nSuccess Chance: ${successChance * 100}%\n\n`;

      for (const userId of participants) {
        let userDb = await User.findOne({ userId, guildId: interaction.guildId });
        if (!userDb) continue;

        if (isSuccess) {
          const reward = Math.floor(Math.random() * 50) + 50 * participants.size; // 50-100 base + scale
          userDb.cheese += reward;
          resultMsg += `<@${userId}> stole **${reward} 🧀**!\n`;
        } else {
          const loss = Math.floor(userDb.cheese * 0.50); // 50% loss
          userDb.cheese -= loss;
          resultMsg += `<@${userId}> was caught and fined **${loss} 🧀** (50%)!\n`;
        }
        await userDb.save();
      }

      await interaction.followUp({ content: isSuccess ? `🎉 **HEIST SUCCESSFUL!** 🎉\n${resultMsg}` : `🚔 **HEIST FAILED!** 🚔\n${resultMsg}` });
    });
  },
};

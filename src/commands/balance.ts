import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { User } from '../database/User';

export default {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your cheese balance.'),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

    let user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!user) {
      user = new User({ userId: interaction.user.id, guildId: interaction.guildId });
      await user.save();
    }

    await interaction.reply(`🧀 You currently have **${user.cheese} cheese**!`);
  },
};

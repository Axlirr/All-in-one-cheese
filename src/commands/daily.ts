import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { User } from '../database/User';

export default {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily cheese!'),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

    let user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!user) {
      user = new User({ userId: interaction.user.id, guildId: interaction.guildId });
    }

    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;
    
    if (now.getTime() - user.lastDaily.getTime() < msInDay) {
      const remainingHours = Math.ceil((msInDay - (now.getTime() - user.lastDaily.getTime())) / (1000 * 60 * 60));
      return interaction.reply(`You have already claimed your daily cheese! Come back in ${remainingHours} hours.`);
    }

    const reward = Math.floor(Math.random() * 6) + 5; // 5 to 10 cheese
    user.cheese += reward;
    user.lastDaily = now;
    await user.save();

    await interaction.reply(`🧀 You claimed your daily **${reward} cheese**! This economy is brutal. Your new balance is **${user.cheese} cheese**.`);
  },
};

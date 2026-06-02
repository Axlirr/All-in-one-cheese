import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { User } from '../database/User';

export default {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work at the cheese factory to earn cheese!'),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

    let user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!user) {
      user = new User({ userId: interaction.user.id, guildId: interaction.guildId });
    }

    const now = new Date();
    const msInHour = 3 * 60 * 60 * 1000; // 3 hours
    
    // Can work every 3 hours
    if (now.getTime() - user.lastWork.getTime() < msInHour) {
      const remainingMinutes = Math.ceil((msInHour - (now.getTime() - user.lastWork.getTime())) / (1000 * 60));
      return interaction.reply(`You are too tired! Take a break and come back in ${remainingMinutes} minutes.`);
    }

    const reward = Math.floor(Math.random() * 4) + 2; // 2 to 5 cheese
    user.cheese += reward;
    user.lastWork = now;
    await user.save();

    const messages = [
      `You milked the cows and earned **${reward} cheese**.`,
      `You spent an hour aging cheddar and got paid **${reward} cheese**.`,
      `You successfully smuggled gouda across the border for **${reward} cheese**.`,
      `You stacked wheels of parmesan and received **${reward} cheese**.`
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await interaction.reply(`🧀 ${randomMessage} Your new balance is **${user.cheese} cheese**.`);
  },
};

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ShopItem } from '../database/ShopItem';

export default {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View the cheese shop.'),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

    const items = await ShopItem.find({ guildId: interaction.guildId });

    if (items.length === 0) {
      return interaction.reply('The cheese shop is currently empty!');
    }

    const embed = new EmbedBuilder()
      .setTitle('🧀 The Cheese Shop')
      .setColor('#ffcc00')
      .setDescription('Use `/buy <item_name>` to purchase an item.');

    items.forEach(item => {
      embed.addFields({
        name: `${item.name} - ${item.price} 🧀`,
        value: `${item.description}\nType: ${item.type}`,
        inline: false
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};

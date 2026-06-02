import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { User } from '../database/User';
import { ShopItem } from '../database/ShopItem';

export default {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the cheese shop.')
    .addStringOption(option => option.setName('item').setDescription('The name of the item to buy').setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

    const itemName = interaction.options.getString('item', true);
    
    // Find item
    const item = await ShopItem.findOne({ guildId: interaction.guildId, name: new RegExp('^' + itemName + '$', 'i') });
    if (!item) {
      return interaction.reply(`Item "${itemName}" not found in the shop.`);
    }

    // Find user
    let user = await User.findOne({ userId: interaction.user.id, guildId: interaction.guildId });
    if (!user) {
      user = new User({ userId: interaction.user.id, guildId: interaction.guildId });
    }

    if (user.cheese < item.price) {
      return interaction.reply(`You don't have enough cheese! You need **${item.price}**, but you only have **${user.cheese}**.`);
    }

    // Process purchase based on item type
    if (item.type === 'role') {
      if (!item.roleId) return interaction.reply('This role item is misconfigured (missing role ID).');
      try {
        const member = await interaction.guild?.members.fetch(interaction.user.id);
        if (member?.roles.cache.has(item.roleId)) {
          return interaction.reply('You already have this role!');
        }
        await member?.roles.add(item.roleId);
      } catch (e) {
        console.error(e);
        return interaction.reply('Failed to give you the role. The bot might not have permission.');
      }
    } else if (item.type === 'nitro') {
      // In a real scenario, this would generate a nitro link or notify an admin
      await interaction.user.send(`You bought a Nitro reward from the shop! An admin has been notified, or here is a dummy link: https://discord.gift/xxxx`);
    } else {
      await interaction.user.send(`You bought ${item.name}!`);
    }

    // Deduct balance
    user.cheese -= item.price;
    await user.save();

    await interaction.reply(`🎉 You successfully bought **${item.name}** for **${item.price} cheese**! You now have **${user.cheese} cheese** left.`);
  },
};

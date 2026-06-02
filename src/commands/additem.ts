import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { ShopItem } from '../database/ShopItem';

export default {
  data: new SlashCommandBuilder()
    .setName('additem')
    .setDescription('Add an item to the cheese shop.')
    .addStringOption(option => option.setName('name').setDescription('Item name').setRequired(true))
    .addStringOption(option => option.setName('description').setDescription('Item description').setRequired(true))
    .addIntegerOption(option => option.setName('price').setDescription('Price in cheese').setRequired(true))
    .addStringOption(option => 
      option.setName('type')
        .setDescription('Type of item')
        .setRequired(true)
        .addChoices(
          { name: 'Role', value: 'role' },
          { name: 'Nitro', value: 'nitro' },
          { name: 'Other', value: 'other' }
        )
    )
    .addRoleOption(option => option.setName('role').setDescription('The role to give (if type is Role)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

    const name = interaction.options.getString('name', true);
    const description = interaction.options.getString('description', true);
    const price = interaction.options.getInteger('price', true);
    const type = interaction.options.getString('type', true);
    const role = interaction.options.getRole('role');

    if (type === 'role' && !role) {
      return interaction.reply({ content: 'You must provide a role when creating a role item.', ephemeral: true });
    }

    const item = new ShopItem({
      guildId: interaction.guildId,
      name,
      description,
      price,
      type,
      roleId: role?.id,
    });

    await item.save();
    await interaction.reply(`Successfully added **${name}** to the cheese shop for **${price} cheese**!`);
  },
};

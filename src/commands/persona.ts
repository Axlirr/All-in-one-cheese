import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { GuildConfig } from '../database/GuildConfig';

export default {
  data: new SlashCommandBuilder()
    .setName('persona')
    .setDescription('Change the AI agent\'s personality.')
    .addStringOption(option => 
      option.setName('personality')
      .setDescription('The new personality instruction for the AI')
      .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ content: 'Server only.', ephemeral: true });

    const newPersona = interaction.options.getString('personality', true);

    let config = await GuildConfig.findOne({ guildId: interaction.guildId });
    if (!config) {
      config = new GuildConfig({ guildId: interaction.guildId });
    }

    config.aiPersona = newPersona;
    await config.save();

    await interaction.reply(`Successfully updated the AI's persona! It will now act according to: "${newPersona}"`);
  },
};

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('View server economy health (Admin only)'),

    run: async (client, interaction, args) => {
        await interaction.deferReply();
        return require(`${process.cwd()}/src/commands/economy/dashboard`)(client, interaction, args);
    },
};

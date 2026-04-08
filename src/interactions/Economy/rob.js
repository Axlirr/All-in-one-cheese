const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Rob another user for their cheese coins')
        .addUserOption(option => option.setName('user').setDescription('Select a user to rob').setRequired(true)),

    run: async (client, interaction, args) => {
        await interaction.deferReply({ fetchReply: true });
        return require(`${process.cwd()}/src/commands/economy/rob`)(client, interaction, args);
    },
};

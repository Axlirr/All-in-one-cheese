const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('See your cheese coin balance')
        .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false)),

    run: async (client, interaction, args) => {
        await interaction.deferReply();
        return require(`${process.cwd()}/src/commands/economy/balance`)(client, interaction, args);
    },
};

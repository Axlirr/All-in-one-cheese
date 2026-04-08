const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removemoney')
        .setDescription('Remove cheese coins from a user')
        .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true))
        .addNumberOption(option => option.setName('amount').setDescription('Amount to remove').setRequired(true)),

    run: async (client, interaction, args) => {
        await interaction.deferReply({ fetchReply: true });
        return require(`${process.cwd()}/src/commands/economy/removemoney`)(client, interaction, args);
    },
};

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addmoney')
        .setDescription('Add cheese coins to a user')
        .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true))
        .addNumberOption(option => option.setName('amount').setDescription('Amount to add').setRequired(true)),

    run: async (client, interaction, args) => {
        await interaction.deferReply({ fetchReply: true });
        return require(`${process.cwd()}/src/commands/economy/addmoney`)(client, interaction, args);
    },
};

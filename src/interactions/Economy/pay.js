const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Pay another user some cheese coins')
        .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true))
        .addNumberOption(option => option.setName('amount').setDescription('Amount to pay').setRequired(true)),

    run: async (client, interaction, args) => {
        await interaction.deferReply({ fetchReply: true });
        return require(`${process.cwd()}/src/commands/economy/pay`)(client, interaction, args);
    },
};

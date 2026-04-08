const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Withdraw cheese coins from your bank vault')
        .addNumberOption(option => option.setName('amount').setDescription('Amount to withdraw').setRequired(true)),

    run: async (client, interaction, args) => {
        await interaction.deferReply();
        return require(`${process.cwd()}/src/commands/economy/withdraw`)(client, interaction, args);
    },
};

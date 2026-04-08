const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Deposit cheese coins into your bank vault')
        .addNumberOption(option => option.setName('amount').setDescription('Amount to deposit').setRequired(true)),

    run: async (client, interaction, args) => {
        await interaction.deferReply();
        return require(`${process.cwd()}/src/commands/economy/deposit`)(client, interaction, args);
    },
};

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hourly')
        .setDescription('Claim your hourly cheese coins'),

    run: async (client, interaction, args) => {
        await interaction.deferReply({ fetchReply: true });
        return require(`${process.cwd()}/src/commands/economy/hourly`)(client, interaction, args);
    },
};

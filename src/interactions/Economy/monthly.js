const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('monthly')
        .setDescription('Claim your monthly cheese coins'),

    run: async (client, interaction, args) => {
        await interaction.deferReply({ fetchReply: true });
        return require(`${process.cwd()}/src/commands/economy/monthly`)(client, interaction, args);
    },
};

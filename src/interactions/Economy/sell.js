const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Sell items from your inventory'),

    run: async (client, interaction, args) => {
        await interaction.deferReply();
        return require(`${process.cwd()}/src/commands/economy/sell`)(client, interaction, args);
    },
};

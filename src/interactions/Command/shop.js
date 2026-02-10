const { CommandInteraction, Client, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Open the economy shop and buy items'),

    /** 
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        await interaction.deferReply({ withResponse: true });
        return require(`${process.cwd()}/src/commands/economy/buy`)(client, interaction, args);
    },
};

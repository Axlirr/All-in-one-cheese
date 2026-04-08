const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('additem')
        .setDescription('Add a role item to the economy store')
        .addRoleOption(option => option.setName('role').setDescription('Select a role').setRequired(true))
        .addNumberOption(option => option.setName('amount').setDescription('Price in cheese coins').setRequired(true)),

    run: async (client, interaction, args) => {
        await interaction.deferReply({ fetchReply: true });
        return require(`${process.cwd()}/src/commands/economy/additem`)(client, interaction, args);
    },
};

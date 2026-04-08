const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleteitem')
        .setDescription('Delete a role item from the economy store')
        .addRoleOption(option => option.setName('role').setDescription('Select a role to remove').setRequired(true)),

    run: async (client, interaction, args) => {
        await interaction.deferReply({ fetchReply: true });
        return require(`${process.cwd()}/src/commands/economy/deleteitem`)(client, interaction, args);
    },
};

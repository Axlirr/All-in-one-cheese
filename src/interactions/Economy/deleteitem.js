const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleteitem')
        .setDescription('Delete a customizable store item')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('What do you want to remove?')
                .setRequired(true)
                .addChoices(
                    { name: 'Role', value: 'role' },
                    { name: 'Custom Item/Subscription', value: 'custom' }
                )
        )
        .addRoleOption(option => option.setName('role').setDescription('Role to remove (for role type)'))
        .addStringOption(option => option.setName('key').setDescription('Custom item key (for custom type)')),

    run: async (client, interaction, args) => {
        await interaction.deferReply();
        return require(`${process.cwd()}/src/commands/economy/deleteitem`)(client, interaction, args);
    },
};

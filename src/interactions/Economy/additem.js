const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('additem')
        .setDescription('Add a customizable item to the economy store')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of store entry')
                .setRequired(true)
                .addChoices(
                    { name: 'Role', value: 'role' },
                    { name: 'Item', value: 'item' },
                    { name: 'Subscription', value: 'subscription' },
                    { name: 'Cosmetic', value: 'cosmetic' }
                )
        )
        .addRoleOption(option => option.setName('role').setDescription('Role to sell (required for role type)'))
        .addStringOption(option => option.setName('name').setDescription('Item name (required for non-role types)'))
        .addNumberOption(option => option.setName('buyprice').setDescription('Buy price in cheese coins').setRequired(true))
        .addNumberOption(option => option.setName('sellprice').setDescription('Sell price in cheese coins'))
        .addBooleanOption(option => option.setName('sellable').setDescription('Allow users to sell this item back?'))
        .addNumberOption(option => option.setName('maxowned').setDescription('Maximum copies one user can hold'))
        .addNumberOption(option => option.setName('durationdays').setDescription('Subscription duration in days'))
        .addNumberOption(option => option.setName('stock').setDescription('Stock limit for this item'))
        .addStringOption(option => option.setName('description').setDescription('Store description shown to users')),

    run: async (client, interaction, args) => {
        await interaction.deferReply();
        return require(`${process.cwd()}/src/commands/economy/additem`)(client, interaction, args);
    },
};

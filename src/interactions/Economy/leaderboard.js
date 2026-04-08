const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('See the cheese economy leaderboard')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The leaderboard type you want to see')
                .setRequired(true)
                .addChoices(
                    { name: 'Money', value: 'money' },
                    { name: 'Bank', value: 'bank' }
                )
        ),

    run: async (client, interaction, args) => {
        await interaction.deferReply();
        return require(`${process.cwd()}/src/commands/economy/leaderboard`)(client, interaction, args);
    },
};

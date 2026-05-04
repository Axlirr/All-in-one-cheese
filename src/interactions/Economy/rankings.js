const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rankings')
        .setDescription('View economy rankings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('wealth')
                .setDescription('View richest players')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('traders')
                .setDescription('View most active traders')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('earners')
                .setDescription('View top earners')
        ),

    run: async (client, interaction, args) => {
        await interaction.deferReply();
        return require(`${process.cwd()}/src/commands/economy/rankings`)(client, interaction, args);
    },
};

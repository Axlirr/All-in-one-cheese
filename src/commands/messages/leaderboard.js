const Discord = require('discord.js');

const Schema = require("../../database/models/messages");

module.exports = async (client, interaction, args) => {
    const period = interaction.options.getString('period') || 'all';
    const fieldMap = {
        all: 'Messages',
        daily: 'DailyMessages',
        weekly: 'WeeklyMessages',
        monthly: 'MonthlyMessages',
        yearly: 'YearlyMessages'
    };
    const labelMap = {
        all: 'All time',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly'
    };
    const field = fieldMap[period] || 'Messages';
    const label = labelMap[period] || 'All time';
    const rawLeaderboard = await Schema.find({ Guild: interaction.guild.id }).sort(([[field, 'descending']]));

    if (!rawLeaderboard) return client.errNormal({
        error: `No data found!`,
        type: 'editreply'
    }, interaction);

    const lb = rawLeaderboard.map(e => {
        const rank = rawLeaderboard.findIndex(i => i.Guild === interaction.guild.id && i.User === e.User) + 1;
        const value = e[field] || 0;
        return `**${rank}** | <@!${e.User}> - Messages: \`${value}\``;
    });

    await client.createLeaderboard(`💬・Messages (${label}) - ${interaction.guild.name}`, lb, interaction);
}


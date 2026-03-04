const Discord = require('discord.js');
const ModeratorPerformance = require('../../database/models/moderatorPerformance');

module.exports = async (client, interaction) => {
    const perms = await client.checkUserPerms({
        flags: [Discord.PermissionsBitField.Flags.ManageMessages],
        perms: [Discord.PermissionsBitField.Flags.ManageMessages]
    }, interaction);

    if (perms == false) return;

    const moderator = interaction.options.getUser('moderator') || interaction.user;
    const stats = await ModeratorPerformance.findOne({ Guild: interaction.guild.id, Moderator: moderator.id });

    if (!stats) {
        return client.errNormal({
            error: 'No moderation performance data found for this moderator yet.',
            type: 'editreply'
        }, interaction);
    }

    const successRate = stats.TotalActions > 0
        ? ((stats.SuccessfulActions / stats.TotalActions) * 100).toFixed(1)
        : '0.0';

    const topActions = Object.entries(stats.ActionsByType || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([action, count]) => `• **${action}**: ${count}`)
        .join('\n') || 'No actions recorded';

    const embed = client.templateEmbed()
        .setTitle('📊・Moderator Performance')
        .setDescription(`Performance snapshot for ${moderator}`)
        .addFields(
            { name: '👤 Moderator', value: `${moderator.tag}`, inline: true },
            { name: '⚡ Total Actions', value: `${stats.TotalActions}`, inline: true },
            { name: '✅ Success Rate', value: `${successRate}%`, inline: true },
            { name: '⏱️ Avg Response', value: `${stats.AvgResponseMs || 0}ms`, inline: true },
            { name: '⭐ Avg Rating', value: `${stats.RatingAvg || 0} (${stats.RatingCount || 0} ratings)`, inline: true },
            { name: '🕒 Last Action', value: stats.LastActionAt ? `<t:${Math.floor(stats.LastActionAt / 1000)}:R>` : 'N/A', inline: true },
            { name: '🧩 Top Actions', value: topActions, inline: false }
        )
        .setColor(client.config.colors.normal);

    interaction.editReply({ embeds: [embed] });
};

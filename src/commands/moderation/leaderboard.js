const Discord = require('discord.js');
const ModeratorPerformance = require('../../database/models/moderatorPerformance');

function score(doc) {
    const successRate = doc.TotalActions > 0 ? doc.SuccessfulActions / doc.TotalActions : 0;
    const speedBonus = doc.AvgResponseMs > 0 ? Math.max(0, 1 - (doc.AvgResponseMs / 8000)) : 0;
    const ratingBonus = (doc.RatingAvg || 0) / 5;

    // Weighted composite score out of 100
    return Math.round((successRate * 0.5 + speedBonus * 0.2 + ratingBonus * 0.3) * 100);
}

module.exports = async (client, interaction) => {
    const perms = await client.checkUserPerms({
        flags: [Discord.PermissionsBitField.Flags.ManageMessages],
        perms: [Discord.PermissionsBitField.Flags.ManageMessages]
    }, interaction);

    if (perms == false) return;

    const docs = await ModeratorPerformance.find({ Guild: interaction.guild.id });

    if (!docs.length) {
        return client.errNormal({
            error: 'No moderator performance data found yet.',
            type: 'editreply'
        }, interaction);
    }

    const rows = docs
        .map(doc => ({ doc, score: score(doc) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((entry, i) => {
            const doc = entry.doc;
            return `**#${i + 1}** <@${doc.Moderator}> — **${entry.score}** pts (actions: ${doc.TotalActions}, avg: ${doc.AvgResponseMs || 0}ms, rating: ${doc.RatingAvg || 0})`;
        });

    const embed = client.templateEmbed()
        .setTitle('🏆・Moderator Performance Leaderboard')
        .setDescription(rows.join('\n'))
        .setColor(client.config.colors.normal);

    interaction.editReply({ embeds: [embed] });
};

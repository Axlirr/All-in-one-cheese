const Discord = require('discord.js');
const Schema = require('../../database/models/economy');
const transactionSchema = require('../../database/models/economyTransactions');

module.exports = async (client, interaction, args) => {
    const guild = interaction.guild;
    const perms = await client.checkPerms({
        flags: [Discord.PermissionsBitField.Flags.Administrator],
        perms: [Discord.PermissionsBitField.Flags.Administrator]
    }, interaction);

    if (perms === false) return;

    // Get economy stats
    const players = await Schema.countDocuments({ Guild: guild.id });
    const walletTotal = await Schema.aggregate([
        { $match: { Guild: guild.id } },
        { $group: { _id: null, total: { $sum: '$Money' } } }
    ]);
    const bankTotal = await Schema.aggregate([
        { $match: { Guild: guild.id } },
        { $group: { _id: null, total: { $sum: '$Bank' } } }
    ]);

    const totalMoney = (walletTotal[0]?.total || 0) + (bankTotal[0]?.total || 0);

    // Get inflation metrics
    const oneDayAgo = new Date(Date.now() - 86400000);
    const last24hEarnings = await transactionSchema.aggregate([
        { $match: { Guild: guild.id, Timestamp: { $gte: oneDayAgo }, TransactionType: { $in: ['earn', 'work', 'beg', 'fish'] } } },
        { $group: { _id: null, total: { $sum: '$Amount' } } }
    ]);

    const last24hSpending = await transactionSchema.aggregate([
        { $match: { Guild: guild.id, Timestamp: { $gte: oneDayAgo }, TransactionType: { $in: ['spend', 'buy'] } } },
        { $group: { _id: null, total: { $sum: '$Amount' } } }
    ]);

    const earnedLast24h = last24hEarnings[0]?.total || 0;
    const spentLast24h = last24hSpending[0]?.total || 0;
    const netFlow = earnedLast24h - spentLast24h;

    // Inflation ratio (higher = more inflation)
    const inflationHealth = netFlow > 0 ? '🔴 INFLATIONARY' : netFlow < 0 ? '🟢 DEFLATIONARY' : '🟡 STABLE';

    const embed = new Discord.EmbedBuilder()
        .setTitle('📊 Economy Dashboard')
        .setColor('PURPLE')
        .addFields(
            { name: '👥 Active Players', value: String(players), inline: true },
            { name: '💰 Circulating Coins', value: `${client.emotes.economy.coins} ${totalMoney.toLocaleString()}`, inline: true },
            { name: '🏦 Total Banked', value: `${client.emotes.economy.coins} ${(bankTotal[0]?.total || 0).toLocaleString()}`, inline: true },
            { name: '📈 24h Earnings', value: `${client.emotes.economy.coins} ${earnedLast24h.toLocaleString()}`, inline: true },
            { name: '📉 24h Spending', value: `${client.emotes.economy.coins} ${spentLast24h.toLocaleString()}`, inline: true },
            { name: '⚖️ Net Flow', value: `${client.emotes.economy.coins} ${netFlow.toLocaleString()}`, inline: true },
            { name: '🩺 Health Status', value: inflationHealth, inline: false },
            { name: '💡 Recommendation', value: netFlow > 100000 ? '⚠️ Consider reducing earning rewards or increasing costs' : 'Economy is balanced', inline: false }
        );

    return client.embed(embed, { type: 'editreply' }, interaction);
};

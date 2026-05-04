const Discord = require('discord.js');
const Schema = require('../../database/models/economy');
const transactionSchema = require('../../database/models/economyTransactions');

module.exports = async (client, interaction, args) => {
    const user = interaction.user;
    const guild = interaction.guild;
    const profile = await Schema.findOne({ Guild: guild.id, User: user.id });

    if (!profile) {
        return client.errNormal({
            error: `You haven't earned any cheese coins yet! Start with \`/beg\` or \`/work\`.`,
            type: 'editreply'
        }, interaction);
    }

    // Get transaction stats
    const transactions = await transactionSchema.find({ Guild: guild.id, User: user.id });
    
    const stats = {
        totalEarned: 0,
        totalSpent: 0,
        totalSold: 0,
        transactions: transactions.length,
        types: {}
    };

    transactions.forEach(tx => {
        if (tx.TransactionType === 'earn' || tx.TransactionType === 'sell' || tx.TransactionType === 'work' || tx.TransactionType === 'fish' || tx.TransactionType === 'beg') {
            stats.totalEarned += tx.Amount;
        } else if (tx.TransactionType === 'spend') {
            stats.totalSpent += tx.Amount;
        }
        if (tx.TransactionType === 'sell') {
            stats.totalSold += tx.Amount;
        }
        stats.types[tx.TransactionType] = (stats.types[tx.TransactionType] || 0) + 1;
    });

    const netWorth = (profile.Money || 0) + (profile.Bank || 0);

    return client.embed({
        title: `💳・Economy Profile`,
        fields: [
            {
                name: `💰┆Wallet`,
                value: `${client.emotes.economy.coins} ${profile.Money || 0}`,
                inline: true
            },
            {
                name: `🏦┆Bank`,
                value: `${client.emotes.economy.coins} ${profile.Bank || 0}`,
                inline: true
            },
            {
                name: `💎┆Net Worth`,
                value: `${client.emotes.economy.coins} ${netWorth}`,
                inline: true
            },
            {
                name: `📈┆Lifetime Earned`,
                value: `${client.emotes.economy.coins} ${stats.totalEarned}`,
                inline: true
            },
            {
                name: `💸┆Lifetime Spent`,
                value: `${client.emotes.economy.coins} ${stats.totalSpent}`,
                inline: true
            },
            {
                name: `💱┆Items Sold`,
                value: `${client.emotes.economy.coins} ${stats.totalSold}`,
                inline: true
            },
            {
                name: `📊┆Activity`,
                value: `**${stats.transactions}** transactions recorded`,
                inline: false
            }
        ],
        type: 'editreply'
    }, interaction);
};

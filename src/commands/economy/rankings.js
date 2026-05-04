const Discord = require('discord.js');
const transactionSchema = require('../../database/models/economyTransactions');
const Schema = require('../../database/models/economy');

module.exports = async (client, interaction, args) => {
    const guild = interaction.guild;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'wealth') {
        // Top richest players
        const topPlayers = await Schema.find({ Guild: guild.id })
            .sort({ Money: -1 })
            .limit(10);

        const embed = new Discord.EmbedBuilder()
            .setTitle('🏆 Wealth Leaderboard')
            .setDescription('Top 10 richest players in the server')
            .setColor('YELLOW');

        let description = '';
        for (let i = 0; i < topPlayers.length; i++) {
            const member = await guild.members.fetch(topPlayers[i].User).catch(() => null);
            const name = member?.user.username || 'Unknown User';
            const medal = ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;
            description += `${medal} **${name}** - ${client.emotes.economy.coins} ${topPlayers[i].Money}\n`;
        }

        if (!description) description = 'No economy data yet!';
        embed.setDescription(description);

        return client.embed(embed, { type: 'editreply' }, interaction);
    }

    if (subcommand === 'traders') {
        // Most active traders (buy/sell activity)
        const traders = await transactionSchema.aggregate([
            { $match: { Guild: guild.id, TransactionType: { $in: ['sell', 'buy'] } } },
            { $group: { _id: '$User', count: { $sum: 1 }, volume: { $sum: '$Amount' } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const embed = new Discord.EmbedBuilder()
            .setTitle('📊 Top Traders')
            .setDescription('Most active buy/sell traders')
            .setColor('BLUE');

        let description = '';
        for (let i = 0; i < traders.length; i++) {
            const member = await guild.members.fetch(traders[i]._id).catch(() => null);
            const name = member?.user.username || 'Unknown User';
            const medal = ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;
            description += `${medal} **${name}** - **${traders[i].count}** trades (${client.emotes.economy.coins} ${traders[i].volume} volume)\n`;
        }

        if (!description) description = 'No trading activity yet!';
        embed.setDescription(description);

        return client.embed(embed, { type: 'editreply' }, interaction);
    }

    if (subcommand === 'earners') {
        // Highest earners (work, beg, fish)
        const earners = await transactionSchema.aggregate([
            { $match: { Guild: guild.id, TransactionType: { $in: ['work', 'beg', 'fish', 'earn'] } } },
            { $group: { _id: '$User', earned: { $sum: '$Amount' }, activities: { $sum: 1 } } },
            { $sort: { earned: -1 } },
            { $limit: 10 }
        ]);

        const embed = new Discord.EmbedBuilder()
            .setTitle('💪 Top Earners')
            .setDescription('Most earned through activities')
            .setColor('GREEN');

        let description = '';
        for (let i = 0; i < earners.length; i++) {
            const member = await guild.members.fetch(earners[i]._id).catch(() => null);
            const name = member?.user.username || 'Unknown User';
            const medal = ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;
            description += `${medal} **${name}** - ${client.emotes.economy.coins} ${earners[i].earned} (**${earners[i].activities}** activities)\n`;
        }

        if (!description) description = 'No earning activity yet!';
        embed.setDescription(description);

        return client.embed(embed, { type: 'editreply' }, interaction);
    }

    return client.errNormal({
        error: 'Unknown subcommand',
        type: 'editreply'
    }, interaction);
};

const store = require('../../database/models/economyStore');
const sellable = require('../../database/models/economySellable');

module.exports = async (client, interaction) => {
    const guildId = interaction.guild.id;
    const roleStore = await store.find({ Guild: guildId });
    const customEntries = await sellable.find({ Guild: guildId, Category: { $ne: 'role' } }).sort({ ItemName: 1 }).limit(60);

    const serverRoles = roleStore
        .map(e => `**<@&${e.Role}>** — ${client.emotes.economy.coins} ${e.Amount}`)
        .join('\n') || 'No role listings available.';

    const customItems = customEntries
        .filter(e => e.Category === 'item' || e.Category === 'cosmetic')
        .map(e => {
            const sellValue = e.Sellable ? `${client.emotes.economy.coins} ${e.SellPrice}` : 'Disabled';
            const stockText = Number.isFinite(e.Stock) ? ` | Stock: ${e.Stock}` : '';
            return `**${e.ItemName}** [${e.Key}] — Buy ${client.emotes.economy.coins} ${e.BuyPrice} | Sell ${sellValue}${stockText}`;
        })
        .join('\n') || 'No custom items configured.';

    const subscriptions = customEntries
        .filter(e => e.Category === 'subscription')
        .map(e => {
            const days = e.DurationDays || 30;
            const stockText = Number.isFinite(e.Stock) ? ` | Stock: ${e.Stock}` : '';
            return `**${e.ItemName}** [${e.Key}] — ${days}d, Buy ${client.emotes.economy.coins} ${e.BuyPrice}${stockText}`;
        })
        .join('\n') || 'No subscriptions configured.';

    const botItems = `**Fishing Rod** — ${client.emotes.economy.coins} 100 (sellable for 80)`;

    return client.embed({
        title: `🛒・${interaction.guild.name}'s Store`,
        fields: [
            { name: '🎭┆Role Listings', value: serverRoles, inline: false },
            { name: '📦┆Custom Items', value: customItems, inline: false },
            { name: '🧾┆Subscriptions', value: subscriptions, inline: false },
            { name: '🤖┆Bot Items', value: botItems, inline: false },
            { name: '💡┆How to Buy', value: 'Use `/buy` and choose an item from the menu.', inline: false },
            { name: '💰┆How to Sell', value: 'Use `/sell` to sell owned items that are marked sellable.', inline: false }
        ],
        type: 'editreply'
    }, interaction);
};


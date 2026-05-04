const store = require("../../database/models/economyStore");

module.exports = async (client, interaction, args) => {
    const storeData = await store.find({ Guild: interaction.guild.id });

    const serverRoles = storeData
        .map(e => `**<@&${e.Role}>** — ${client.emotes.economy.coins} ${e.Amount} coins`)
        .join('\n') || 'No custom roles available.';

    const botItems = `**Fishing Rod** — ${client.emotes.economy.coins} 100 coins`;

    return client.embed({
        title: `🛒・${interaction.guild.name}'s Store`,
        fields: [
            {
                name: `🎭┆Server Roles`,
                value: serverRoles,
                inline: false
            },
            {
                name: `🤖┆Bot Items`,
                value: botItems,
                inline: false
            },
            {
                name: `💡┆How to buy`,
                value: `Use the \`/buy\` command and select an item from the menu.`,
                inline: false
            },
            {
                name: `💰┆How to sell`,
                value: `Use the \`/sell\` command to sell items from your inventory and earn coins back.`,
                inline: false
            }
        ],
        type: 'editreply'
    }, interaction);
}


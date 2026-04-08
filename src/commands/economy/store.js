const Discord = require('discord.js');

const store = require("../../database/models/economyStore");

module.exports = async (client, interaction, args, message) => {
    store.find({ Guild: interaction.guild.id }, async (err, storeData) => {
        if (storeData && storeData.length > 0) {
            const lb = storeData.map(e => `**<@&${e.Role}>** - ${client.emotes.economy.coins} $${e.Amount} \n**To buy:** \`buy ${e.Role}\``);

            await client.createLeaderboard(`🛒・${interaction.guild.name}'s Store`, lb, interaction);
            client.embed({
                title: `🛒・Bot's Store`,
                desc: `**Fishing Rod** - ${client.emotes.economy.coins} 100 Cheese Coins \n**To buy:** \`buy fishingrod\`\n\n**Aged Gouda** - ${client.emotes.economy.coins} 250 Cheese Coins \n**To buy:** \`buy agedgouda\`\n\n**Fine Brie** - ${client.emotes.economy.coins} 500 Cheese Coins \n**To buy:** \`buy finebrie\``,
            }, interaction.channel);
        }
        else {
            client.errNormal({
                error: `No store found in this guild!`,
                type: 'editreply'
            }, interaction);
        }
    })

}


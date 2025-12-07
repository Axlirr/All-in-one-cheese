const Discord = require('discord.js');

const store = require("../../database/models/economyStore");

module.exports = async (client, interaction, args, message) => {
    store.find({ Guild: interaction.guild.id }, async (err, storeData) => {
        if (storeData && storeData.length > 0) {
            const lb = storeData.map(e => `**<@&${e.Role}>** - ${client.emotes.economy.coins} $${e.Amount} \n**To buy:** \`buy ${e.Role}\``);

            await client.createLeaderboard(`🛒・${interaction.guild.name}'s Store`, lb, interaction);
            client.embed({
                title: `🛒・Bot's Store`,
                desc: `**Catnip** - ${client.emotes.economy.coins} 100 Cheese Coins \n**To buy:** \`buy catnip\`\n\n**Yarn Ball** - ${client.emotes.economy.coins} 250 Cheese Coins \n**To buy:** \`buy yarnball\`\n\n**Scratching Post** - ${client.emotes.economy.coins} 500 Cheese Coins \n**To buy:** \`buy scratchingpost\``,
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


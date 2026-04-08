const Schema = require("../../database/models/economy");

module.exports = async (client, interaction, args) => {
    const type = interaction.options.getString("type");

    if (type == "money") {
        const rawLeaderboard = await Schema.find({ Guild: interaction.guild.id }).sort({ Money: -1 });

        if (!rawLeaderboard || rawLeaderboard.length === 0) return client.errNormal({
            error: "No data found!",
            type: 'editreply'
        }, interaction);

        const lb = rawLeaderboard.map((e, idx) => `**${idx + 1}** | <@!${e.User}> - ${client.emotes.economy.coins} \`${e.Money} coins\``);

        await client.createLeaderboard(`🪙・Money - ${interaction.guild.name}`, lb, interaction);
    }
    else if (type == "bank") {
        const rawLeaderboard = await Schema.find({ Guild: interaction.guild.id }).sort({ Bank: -1 });

        if (!rawLeaderboard || rawLeaderboard.length === 0) return client.errNormal({
            error: "No data found!",
            type: 'editreply'
        }, interaction);

        const lb = rawLeaderboard.map((e, idx) => `**${idx + 1}** | <@!${e.User}> - ${client.emotes.economy.bank} \`${e.Bank} coins\``);

        await client.createLeaderboard(`🏦・Bank - ${interaction.guild.name}`, lb, interaction);
    }
}

 
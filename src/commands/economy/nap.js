const Schema = require("../../database/models/economyTimeout");

module.exports = async (client, interaction, args) => {
    const user = interaction.user;
    const timeout = 1800000;

    const napTypes = [
        { location: 'at the market stall', emoji: '🏪', bonus: 1.5 },
        { location: 'in the cheese cellar', emoji: '🧀', bonus: 2.0 },
        { location: 'under a shady tree', emoji: '🌳', bonus: 1.3 },
        { location: 'by the fireplace', emoji: '🔥', bonus: 1.4 },
        { location: 'in the tavern', emoji: '🍺', bonus: 1.6 },
        { location: 'in your cozy bed', emoji: '🛏️', bonus: 1.2 },
        { location: 'by the river bank', emoji: '🌊', bonus: 1.7 },
        { location: 'on a hay bale in the barn', emoji: '🌾', bonus: 1.8 }
    ];

    const nap = napTypes[Math.floor(Math.random() * napTypes.length)];
    const baseAmount = Math.floor(Math.random() * 30) + 20;
    const finalAmount = Math.floor(baseAmount * nap.bonus);

    const dataTime = await Schema.findOne({ Guild: interaction.guild.id, User: user.id });
    const lastNap = Number(dataTime?.Nap || 0);

    if (lastNap && timeout - (Date.now() - lastNap) > 0) {
        const time = (lastNap / 1000 + timeout / 1000).toFixed(0);
        return client.errWait({ time: time, type: 'editreply' }, interaction);
    }

    client.succNormal({
        text: `😴 **Zzz...** You had a refreshing nap and dreamed of cheese!`,
        fields: [
            {
                name: `${nap.emoji}┆Nap Spot`,
                value: `${nap.location}`,
                inline: true
            },
            {
                name: `✨┆Dream Bonus`,
                value: `x${nap.bonus}`,
                inline: true
            },
            {
                name: `🧀┆Cheese Coins Dreamed`,
                value: `+${finalAmount} coins`,
                inline: true
            }
        ],
        type: 'editreply'
    }, interaction);

    await Schema.updateOne(
        { Guild: interaction.guild.id, User: user.id },
        {
            $setOnInsert: { Guild: interaction.guild.id, User: user.id },
            $set: { Nap: Date.now() }
        },
        { upsert: true }
    );

    await client.addMoney(interaction, user, finalAmount);
}

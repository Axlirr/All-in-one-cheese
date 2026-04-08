const Schema2 = require("../../database/models/economyTimeout");

module.exports = async (client, interaction, args) => {
    const user = interaction.user;
    const timeout = 600000;

    const replies = [
        { job: 'Cheese Maker', emoji: '🧀' },
        { job: 'Market Trader', emoji: '🏪' },
        { job: 'Mine Worker', emoji: '⛏️' },
        { job: 'Dairy Farmer', emoji: '🐄' },
        { job: 'Baker', emoji: '🥖' },
        { job: 'Blacksmith', emoji: '⚒️' },
        { job: 'Merchant', emoji: '💼' },
        { job: 'Cheese Inspector', emoji: '🔍' },
        { job: 'Treasure Hunter', emoji: '🗺️' },
        { job: 'Cheese Vault Guard', emoji: '🛡️' }
    ];

    const dataTime = await Schema2.findOne({ Guild: interaction.guild.id, User: user.id });
    const lastWork = Number(dataTime?.Work || 0);

    if (lastWork && timeout - (Date.now() - lastWork) > 0) {
        const time = (lastWork / 1000 + timeout / 1000).toFixed(0);
        return client.errWait({ time: time, type: 'editreply' }, interaction);
    }

    const result = Math.floor(Math.random() * replies.length);
    const amount = Math.floor(Math.random() * 150) + 25;

    client.succNormal({
        text: `🧀 **Hard work pays off!** You earned some cheese coins!`,
        fields: [
            {
                name: `${replies[result].emoji}┆Job`,
                value: `${replies[result].job}`,
                inline: true
            },
            {
                name: `🧀┆Cheese Coins Earned`,
                value: `${amount} cheese coins`,
                inline: true
            }
        ],
        type: 'editreply'
    }, interaction);

    await Schema2.updateOne(
        { Guild: interaction.guild.id, User: user.id },
        {
            $setOnInsert: { Guild: interaction.guild.id, User: user.id },
            $set: { Work: Date.now() }
        },
        { upsert: true }
    );

    await client.addMoney(interaction, user, amount);
}

 
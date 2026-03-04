const Schema2 = require('../../database/models/economyTimeout');

module.exports = async (client, interaction) => {
    const user = interaction.user;
    const timeout = 86400000;
    const amount = 200;

    const dataTime = await Schema2.findOne({ Guild: interaction.guild.id, User: user.id });
    const lastDaily = Number(dataTime?.Daily || 0);

    if (lastDaily && timeout - (Date.now() - lastDaily) > 0) {
        const time = (lastDaily / 1000 + timeout / 1000).toFixed(0);
        return client.errWait({
            time,
            type: 'editreply'
        }, interaction);
    }

    await Schema2.updateOne(
        { Guild: interaction.guild.id, User: user.id },
        {
            $setOnInsert: { Guild: interaction.guild.id, User: user.id },
            $set: { Daily: Date.now() }
        },
        { upsert: true }
    );

    await client.addMoney(interaction, user, amount);

    return client.succNormal({
        text: `You've collected your daily reward!`,
        fields: [
            {
                name: `${client.emotes.economy.coins}┆Amount`,
                value: `${amount} cheese coins`,
                inline: true
            }
        ],
        type: 'editreply'
    }, interaction);
}

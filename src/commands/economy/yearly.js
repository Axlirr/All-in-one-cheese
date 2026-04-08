const Schema = require("../../database/models/economy");
const Schema2 = require("../../database/models/economyTimeout");

module.exports = async (client, interaction, args) => {
    const user = interaction.user;
    const timeout = 31557600000;
    const amount = 5000;

    const dataTime = await Schema2.findOne({ Guild: interaction.guild.id, User: user.id });
    const lastYearly = Number(dataTime?.Yearly || 0);

    if (lastYearly && timeout - (Date.now() - lastYearly) > 0) {
        const time = (lastYearly / 1000 + timeout / 1000).toFixed(0);
        return client.errWait({ time: time, type: 'editreply' }, interaction);
    }

    client.succNormal({
        text: `You've collected your yearly reward!`,
        fields: [
            {
                name: `${client.emotes.economy.coins}┆Earned`,
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
            $set: { Yearly: Date.now() }
        },
        { upsert: true }
    );

    await client.addMoney(interaction, user, amount);
}


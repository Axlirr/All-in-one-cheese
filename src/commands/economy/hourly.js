const Schema = require("../../database/models/economy");
const Schema2 = require("../../database/models/economyTimeout");

module.exports = async (client, interaction, args) => {
    const user = interaction.user;
    const timeout = 3600000;
    const amount = 10;

    const dataTime = await Schema2.findOne({ Guild: interaction.guild.id, User: user.id });
    const lastHourly = Number(dataTime?.Hourly || 0);

    if (lastHourly && timeout - (Date.now() - lastHourly) > 0) {
        const time = (lastHourly / 1000 + timeout / 1000).toFixed(0);
        return client.errWait({ time: time, type: 'editreply' }, interaction);
    }

    client.succNormal({
        text: `You've collected your hourly reward!`,
        fields: [
            {
                name: `${client.emotes.economy.coins}┆Amount`,
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
            $set: { Hourly: Date.now() }
        },
        { upsert: true }
    );

    await client.addMoney(interaction, user, amount);
}


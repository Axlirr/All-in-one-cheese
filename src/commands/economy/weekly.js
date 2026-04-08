const Schema = require("../../database/models/economy");
const Schema2 = require("../../database/models/economyTimeout");

module.exports = async (client, interaction, args) => {
    const user = interaction.user;
    const timeout = 604800000;
    const amount = 500;

    const dataTime = await Schema2.findOne({ Guild: interaction.guild.id, User: user.id });
    const lastWeekly = Number(dataTime?.Weekly || 0);

    if (lastWeekly && timeout - (Date.now() - lastWeekly) > 0) {
        const time = (lastWeekly / 1000 + timeout / 1000).toFixed(0);
        return client.errWait({ time: time, type: 'editreply' }, interaction);
    }

    client.succNormal({
        text: `You've collected your weekly reward!`,
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
            $set: { Weekly: Date.now() }
        },
        { upsert: true }
    );

    await client.addMoney(interaction, user, amount);
}


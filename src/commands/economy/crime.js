const Schema = require("../../database/models/economy");
const Schema2 = require("../../database/models/economyTimeout");

module.exports = async (client, interaction, args) => {
    const user = interaction.user;
    const timeout = 600000;

    const dataTime = await Schema2.findOne({ Guild: interaction.guild.id, User: user.id });
    const lastCrime = Number(dataTime?.Crime || 0);

    if (lastCrime && timeout - (Date.now() - lastCrime) > 0) {
        const time = (lastCrime / 1000 + timeout / 1000).toFixed(0);
        return client.errWait({ time: time, type: 'editreply' }, interaction);
    }

    const replies = ['Pickpocketing at the market', 'Swiping cheese from a vendor stall', 'Sneaking into the treasury', 'Robbing a merchant', 'Counterfeiting coins', 'Smuggling goods past the gate', 'Breaking into a warehouse', 'Scamming a trader'];
    const result = Math.floor(Math.random() * replies.length);
    const amount = Math.floor(Math.random() * 80) + 1;
    // ~35% success chance
    const success = Math.random() < 0.35;

    await Schema2.updateOne(
        { Guild: interaction.guild.id, User: user.id },
        {
            $setOnInsert: { Guild: interaction.guild.id, User: user.id },
            $set: { Crime: Date.now() }
        },
        { upsert: true }
    );

    if (success) {
        client.succNormal({
            text: `Your crime went successfully!`,
            fields: [
                {
                    name: `🦹‍♂️┆Crime`,
                    value: `${replies[result]}`,
                    inline: true
                },
                {
                    name: `${client.emotes.economy.coins}┆Earned`,
                    value: `${amount} cheese coins`,
                    inline: true
                }
            ],
            type: 'editreply'
        }, interaction);

        await client.addMoney(interaction, user, amount);
    } else {
        client.errNormal({ error: `You were caught carrying out the crime: ${replies[result]}`, type: 'editreply' }, interaction);
    }
}


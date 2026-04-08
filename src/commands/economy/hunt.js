const Schema2 = require("../../database/models/economyTimeout");
const itemSchema = require("../../database/models/economyItems");

module.exports = async (client, interaction, args) => {

    const rand = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    const user = interaction.user;
    const timeout = 60000;
    const hunt = [
        { name: 'Wild Boar', emoji: '🐗', value: 15 },
        { name: 'Rabbit', emoji: '🐇', value: 10 },
        { name: 'Deer', emoji: '🦌', value: 25 },
        { name: 'Fox', emoji: '🦊', value: 12 },
        { name: 'Rare Mushroom', emoji: '🍄', value: 30 },
        { name: 'Cheese Wheel', emoji: '🧀', value: 50 },
        { name: 'Golden Stag', emoji: '✨🦌', value: 100 },
        { name: 'Pheasant', emoji: '🐦', value: 20 },
        { name: 'Truffle', emoji: '🌰', value: 8 },
        { name: 'Butterfly', emoji: '🦋', value: 18 },
        { name: 'Stray Arrow', emoji: '🏹', value: 5 },
        { name: 'Mysterious Chest', emoji: '📦', value: 35 }
    ];

    const caught = hunt[rand(0, hunt.length)];

    const dataTime = await Schema2.findOne({ Guild: interaction.guild.id, User: user.id });
    const lastHunt = Number(dataTime?.Hunt || 0);

    if (lastHunt && timeout - (Date.now() - lastHunt) > 0) {
        const time = (lastHunt / 1000 + timeout / 1000).toFixed(0);
        return client.errWait({ time: time, type: 'editreply' }, interaction);
    }

    client.succNormal({
        text: `🏹 **Got one!** Your hunt paid off!`,
        fields: [
            {
                name: `${caught.emoji}┆Caught`,
                value: `${caught.name}`,
                inline: true
            },
            {
                name: `🧀┆Cheese Coins`,
                value: `+${caught.value} coins`,
                inline: true
            }
        ],
        type: 'editreply'
    }, interaction);

    await client.addMoney(interaction, user, caught.value);

    await Schema2.updateOne(
        { Guild: interaction.guild.id, User: user.id },
        {
            $setOnInsert: { Guild: interaction.guild.id, User: user.id },
            $set: { Hunt: Date.now() }
        },
        { upsert: true }
    );
}

 
const Schema = require("../../database/models/economyTimeout");

module.exports = async (client, interaction, args) => {
    const user = interaction.user;
    const timeout = 180000;

    const reactions = [
        { response: 'A generous merchant tosses you some coins!', emoji: '🧀', amount: 15 },
        { response: 'You look pitiful enough to earn a handout!', emoji: '💰', amount: 20 },
        { response: 'A passerby feels sorry and drops a coin!', emoji: '🪙', amount: 25 },
        { response: 'A cheese seller gives you a free sample!', emoji: '🧀', amount: 18 },
        { response: 'Someone drops coins into your hat!', emoji: '🎩', amount: 12 },
        { response: 'A kind noble gives you a generous tip!', emoji: '⭐', amount: 35 },
        { response: 'You put on a little act and earn some coins!', emoji: '🎭', amount: 22 },
        { response: 'Luck shines on you today!', emoji: '✨', amount: 30 }
    ];

    const reaction = reactions[Math.floor(Math.random() * reactions.length)];

    const dataTime = await Schema.findOne({ Guild: interaction.guild.id, User: user.id });
    const lastBeg = Number(dataTime?.Beg || 0);

    if (lastBeg && timeout - (Date.now() - lastBeg) > 0) {
        const time = (lastBeg / 1000 + timeout / 1000).toFixed(0);
        return client.errWait({ time: time, type: 'editreply' }, interaction);
    }

    client.succNormal({
        text: `🙏 ${reaction.response}`,
        fields: [
            {
                name: `${reaction.emoji}┆Cheese Coins`,
                value: `+${reaction.amount} coins`,
                inline: true
            }
        ],
        type: 'editreply'
    }, interaction);

    await Schema.updateOne(
        { Guild: interaction.guild.id, User: user.id },
        {
            $setOnInsert: { Guild: interaction.guild.id, User: user.id },
            $set: { Beg: Date.now() }
        },
        { upsert: true }
    );

    await client.addMoney(interaction, user, reaction.amount);
}

 
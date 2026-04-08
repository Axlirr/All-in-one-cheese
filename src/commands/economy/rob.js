const Schema = require("../../database/models/economy");
const Schema2 = require("../../database/models/economyTimeout");

module.exports = async (client, interaction, args) => {
    const user = interaction.options.getUser('user');
    if (!user) return client.errUsage({ usage: "rob [mention user]", type: 'editreply' }, interaction);

    if (user.bot) return client.errNormal({
        error: "You can't rob a bot! They don't have any cheese!",
        type: 'editreply'
    }, interaction);

    try {
        const timeout = 600000;

        const dataTime = await Schema2.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
        const lastRob = Number(dataTime?.Rob || 0);

        if (lastRob && timeout - (Date.now() - lastRob) > 0) {
            const time = (lastRob / 1000 + timeout / 1000).toFixed(0);
            return client.errWait({ time: time, type: 'editreply' }, interaction);
        }

        const authorData = await Schema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
        if (!authorData || authorData.Money < 200) {
            return client.errNormal({ error: `You need at least 200 cheese coins in your wallet to rob someone!`, type: 'editreply' }, interaction);
        }

        const targetData = await Schema.findOne({ Guild: interaction.guild.id, User: user.id });
        if (!targetData || targetData.Money <= 0) {
            return client.errNormal({ error: `${user.username}'s stash is empty! Nothing to rob!`, type: 'editreply' }, interaction);
        }

        await Schema2.updateOne(
            { Guild: interaction.guild.id, User: interaction.user.id },
            {
                $setOnInsert: { Guild: interaction.guild.id, User: interaction.user.id },
                $set: { Rob: Date.now() }
            },
            { upsert: true }
        );

        const targetMoney = targetData.Money;
        let stolen = Math.floor(Math.random() * 100) + 1;
        if (stolen > targetMoney) stolen = targetMoney;

        authorData.Money += stolen;
        await authorData.save();
        await client.removeMoney(interaction, user, stolen);

        const robMessages = [
            `You sneakily robbed ${user.username}'s cheese stash!`,
            `Quick hands! You swiped some coins from ${user.username}!`,
            `You caught ${user.username} off guard and grabbed their cheese!`,
            `While ${user.username} was distracted, you grabbed their coins!`,
            `You successfully robbed ${user.username}!`
        ];
        const randomMessage = robMessages[Math.floor(Math.random() * robMessages.length)];

        return client.succNormal({
            text: randomMessage,
            fields: [
                {
                    name: `👤┆Target`,
                    value: `${user}`,
                    inline: true
                },
                {
                    name: `${client.emotes.economy.cheese || '🧀'}┆Cheese Swiped`,
                    value: `${stolen} cheese coins`,
                    inline: true
                }
            ],
            type: 'editreply'
        }, interaction);
    } catch (err) {
        console.error('[rob]', err);
    }
}

 
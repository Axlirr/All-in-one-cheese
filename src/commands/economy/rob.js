const Discord = require('discord.js');
const ms = require("ms");

const Schema = require("../../database/models/economy");
const Schema2 = require("../../database/models/economyTimeout");

module.exports = async (client, interaction, args) => {

    const user = interaction.options.getUser('user');
    if (!user) return client.errUsage({ usage: "rob [mention user]", type: 'editreply' }, interaction);

    if (user.bot) return client.errNormal({
        error: "You can't pounce on a bot! They don't have any cheese!",
        type: 'editreply'
    }, interaction);

    try {
        let timeout = 600000;

        Schema2.findOne({ Guild: interaction.guild.id, User: interaction.user.id }, async (err, dataTime) => {
            if (dataTime && dataTime.Rob !== null && timeout - (Date.now() - dataTime.Rob) > 0) {
                let time = (dataTime.Rob / 1000 + timeout / 1000).toFixed(0);
                return client.errWait({ time: time, type: 'editreply' }, interaction);
            }
            else {
                Schema.findOne({ Guild: interaction.guild.id, User: interaction.user.id }, async (err, authorData) => {
                    if (authorData) {
                        if (authorData.Money < 200) return client.errNormal({ error: `You need at least 200 cheese coins in your paw wallet to pounce on another cat!`, type: 'editreply' }, interaction);

                        Schema.findOne({ Guild: interaction.guild.id, User: user.id }, async (err, targetData) => {
                            if (targetData) {
                                var targetMoney = targetData.Money;
                                if (!targetData || targetMoney <= 0) {
                                    return client.errNormal({ error: `${user.username}'s cheese stash is empty! Nothing to pounce on!`, type: 'editreply' }, interaction);
                                }

                                if (dataTime) {
                                    dataTime.Rob = Date.now();
                                    dataTime.save();
                                }
                                else {
                                    new Schema2({
                                        Guild: interaction.guild.id,
                                        User: interaction.user.id,
                                        Rob: Date.now()
                                    }).save();
                                }

                                var random = Math.floor(Math.random() * 100) + 1;
                                if (targetMoney < random) {
                                    random = targetMoney;

                                    authorData.Money += targetMoney;
                                    authorData.save();

                                    client.removeMoney(interaction, user, targetMoney);
                                }
                                else {
                                    authorData.Money += random;
                                    authorData.save();

                                    client.removeMoney(interaction, user, random);
                                }

                                const pounceMessages = [
                                    `You stealthily pounced on ${user.username}'s cheese stash!`,
                                    `Like a sneaky cat, you nabbed some cheese from ${user.username}!`,
                                    `Your cat reflexes helped you swipe cheese from ${user.username}!`,
                                    `You caught ${user.username} napping and snatched their cheese!`,
                                    `Quick paws! You swiped cheese from ${user.username}'s stash!`
                                ];
                                const randomMessage = pounceMessages[Math.floor(Math.random() * pounceMessages.length)];

                                client.succNormal({
                                    text: randomMessage,
                                    fields: [
                                        {
                                            name: `${client.emotes.economy.cat || '🐱'}┆Target`,
                                            value: `${user}`,
                                            inline: true
                                        },
                                        {
                                            name: `${client.emotes.economy.cheese || '🧀'}┆Cheese Swiped`,
                                            value: `${random} cheese coins`,
                                            inline: true
                                        }
                                    ],
                                    type: 'editreply'
                                }, interaction);
                            }
                            else {
                                return client.errNormal({ error: `${user.username}'s cheese stash is empty! Nothing to pounce on!`, type: 'editreply' }, interaction);
                            }
                        })
                    }
                })
            }
        })
    }
    catch { }
}

 
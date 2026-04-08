const Discord = require('discord.js');
const ms = require("ms");

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
        let timeout = 600000;

        Schema2.findOne({ Guild: interaction.guild.id, User: interaction.user.id }, async (err, dataTime) => {
            if (dataTime && dataTime.Rob !== null && timeout - (Date.now() - dataTime.Rob) > 0) {
                let time = (dataTime.Rob / 1000 + timeout / 1000).toFixed(0);
                return client.errWait({ time: time, type: 'editreply' }, interaction);
            }
            else {
                Schema.findOne({ Guild: interaction.guild.id, User: interaction.user.id }, async (err, authorData) => {
                    if (authorData) {
                        if (authorData.Money < 200) return client.errNormal({ error: `You need at least 200 cheese coins in your wallet to rob someone!`, type: 'editreply' }, interaction);

                        Schema.findOne({ Guild: interaction.guild.id, User: user.id }, async (err, targetData) => {
                            if (targetData) {
                                var targetMoney = targetData.Money;
                                if (!targetData || targetMoney <= 0) {
                                    return client.errNormal({ error: `${user.username}'s stash is empty! Nothing to rob!`, type: 'editreply' }, interaction);
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

                                const robMessages = [
                                    `You sneakily robbed ${user.username}'s cheese stash!`,
                                    `Quick hands! You swiped some coins from ${user.username}!`,
                                    `You caught ${user.username} off guard and grabbed their cheese!`,
                                    `While ${user.username} was distracted, you grabbed their coins!`,
                                    `You successfully robbed ${user.username}!`
                                ];
                                const randomMessage = robMessages[Math.floor(Math.random() * robMessages.length)];

                                client.succNormal({
                                    text: randomMessage,
                                    fields: [
                                        {
                                            name: `👤┆Target`,
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
                                return client.errNormal({ error: `${user.username}'s stash is empty! Nothing to rob!`, type: 'editreply' }, interaction);
                            }
                        })
                    }
                })
            }
        })
    }
    catch { }
}

 
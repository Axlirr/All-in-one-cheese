const Discord = require('discord.js');

const Schema = require("../../database/models/economyTimeout");

module.exports = async (client, interaction, args) => {
    let user = interaction.user;

    let timeout = 180000;
    
    let reactions = [
        { response: 'A kind human gives you some cheese!', emoji: '🧀', amount: 15 },
        { response: 'You do a cute head tilt and earn treats!', emoji: '🐱', amount: 20 },
        { response: 'Your sad meow melts hearts!', emoji: '😿', amount: 25 },
        { response: 'You purr adorably and get rewarded!', emoji: '😺', amount: 18 },
        { response: 'Someone tosses you a cheese cube!', emoji: '🧀', amount: 12 },
        { response: 'A cat lover gives you premium treats!', emoji: '⭐', amount: 35 },
        { response: 'You roll over cutely for coins!', emoji: '🐾', amount: 22 },
        { response: 'Your whiskers twitch and coins appear!', emoji: '✨', amount: 30 }
    ];
    
    let reaction = reactions[Math.floor(Math.random() * reactions.length)];

    Schema.findOne({ Guild: interaction.guild.id, User: user.id }, async (err, dataTime) => {
        if (dataTime && dataTime.Beg !== null && timeout - (Date.now() - dataTime.Beg) > 0) {
            let time = (dataTime.Beg / 1000 + timeout / 1000).toFixed(0);
            return client.errWait({
                time: time,
                type: 'editreply'
            }, interaction);
        }
        else {

            client.succNormal({
                text: `🐱 **Meow~** ${reaction.response}`,
                fields: [
                    {
                        name: `${reaction.emoji}┆Cheese Coins`,
                        value: `+${reaction.amount} coins`,
                        inline: true
                    }
                ],
                type: 'editreply'
            }, interaction);

            if (dataTime) {
                dataTime.Beg = Date.now();
                dataTime.save();
            }
            else {
                new Schema({
                    Guild: interaction.guild.id,
                    User: user.id,
                    Beg: Date.now()
                }).save();
            }

            client.addMoney(interaction, user, reaction.amount);
        }
    })
}

 
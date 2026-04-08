const Discord = require('discord.js');

const Schema = require("../../database/models/economyTimeout");

module.exports = async (client, interaction, args) => {
    let user = interaction.user;

    let timeout = 180000;
    
    let reactions = [
        { response: 'A generous merchant tosses you some coins!', emoji: '🧀', amount: 15 },
        { response: 'You look pitiful enough to earn a handout!', emoji: '💰', amount: 20 },
        { response: 'A passerby feels sorry and drops a coin!', emoji: '🪙', amount: 25 },
        { response: 'A cheese seller gives you a free sample!', emoji: '🧀', amount: 18 },
        { response: 'Someone drops coins into your hat!', emoji: '🎩', amount: 12 },
        { response: 'A kind noble gives you a generous tip!', emoji: '⭐', amount: 35 },
        { response: 'You put on a little act and earn some coins!', emoji: '🎭', amount: 22 },
        { response: 'Luck shines on you today!', emoji: '✨', amount: 30 }
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

 
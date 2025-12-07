const Discord = require('discord.js');
const ms = require("ms");

const Schema = require("../../database/models/economy");
const Schema2 = require("../../database/models/economyTimeout");
const itemSchema = require("../../database/models/economyItems");

module.exports = async (client, interaction, args) => {

    const rand = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    let user = interaction.user;

    let timeout = 60000;
    let hunt = [
        { name: 'Sneaky Mouse', emoji: '🐭', value: 15 },
        { name: 'Yarn Ball', emoji: '🧶', value: 10 },
        { name: 'Red Laser Dot', emoji: '🔴', value: 25 },
        { name: 'Feather Toy', emoji: '🪶', value: 12 },
        { name: 'Catnip Stash', emoji: '🌿', value: 30 },
        { name: 'Cheese Wheel', emoji: '🧀', value: 50 },
        { name: 'Golden Mouse', emoji: '✨🐭', value: 100 },
        { name: 'Cardboard Box', emoji: '📦', value: 20 },
        { name: 'Fuzzy Bug', emoji: '🐛', value: 8 },
        { name: 'Butterfly', emoji: '🦋', value: 18 },
        { name: 'Shoelace', emoji: '👟', value: 5 },
        { name: 'Mysterious Shadow', emoji: '👤', value: 35 }
    ];

    let randn = rand(0, parseInt(hunt.length));
    let caught = hunt[randn];

    Schema2.findOne({ Guild: interaction.guild.id, User: user.id }, async (err, dataTime) => {
        if (dataTime && dataTime.Hunt !== null && timeout - (Date.now() - dataTime.Hunt) > 0) {
            let time = (dataTime.Hunt / 1000 + timeout / 1000).toFixed(0);

            return client.errWait({ time: time, type: 'editreply' }, interaction);
        }
        else {
            client.succNormal({ 
                text: `🐱 **Pounce!** Your inner hunter awakens!`,
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
            
            client.addMoney(interaction, user, caught.value);

            if (dataTime) {
                dataTime.Hunt = Date.now();
                dataTime.save();
            }
            else {
                new Schema2({
                    Guild: interaction.guild.id,
                    User: user.id,
                    Hunt: Date.now()
                }).save();
            }
        }
    })

}

 
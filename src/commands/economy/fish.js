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
    let fish = [
        { name: 'Tasty Tuna', emoji: '🐟', value: 20 },
        { name: 'Salmon Surprise', emoji: '🍣', value: 25 },
        { name: 'Sardine Snack', emoji: '🐠', value: 10 },
        { name: 'Golden Goldfish', emoji: '✨🐠', value: 75 },
        { name: 'Chunky Mackerel', emoji: '🐟', value: 18 },
        { name: 'Fancy Shrimp', emoji: '🦐', value: 30 },
        { name: 'Legendary Koi', emoji: '🎏', value: 150 },
        { name: 'Old Boot', emoji: '👢', value: 2 },
        { name: 'Cheese Float', emoji: '🧀', value: 40 },
        { name: 'Catfish (Ironic!)', emoji: '🐱🐟', value: 35 },
        { name: 'Clam with Pearl', emoji: '🦪', value: 60 },
        { name: 'Seaweed Snack', emoji: '🥬', value: 8 }
    ];

    let randn = rand(0, parseInt(fish.length));
    let randrod = rand(15, 30);

    let caught = fish[randn];

    const userItems = await itemSchema.findOne({ Guild: interaction.guild.id, User: user.id });

    if (!userItems || userItems.FishingRod == false) return client.errNormal({ error: "You have to buy a fishing rod!", type: 'editreply' }, interaction);

    if (userItems) {
        if (userItems.FishingRodUsage >= randrod) {
            userItems.FishingRod = false;
            userItems.save();

            return client.errNormal({ error: "Your fishing rod has broken! Go buy a new one!", type: 'editreply' }, interaction);
        }
    }

    Schema2.findOne({ Guild: interaction.guild.id, User: user.id }, async (err, dataTime) => {
        if (dataTime && dataTime.Fish !== null && timeout - (Date.now() - dataTime.Fish) > 0) {
            let time = (dataTime.Fish / 1000 + timeout / 1000).toFixed(0);

            return client.errWait({ time: time, type: 'editreply' }, interaction);
        }
        else {
            client.succNormal({ 
                text: `🐱 **Splash!** You dipped your paw in the water!`,
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

            if (userItems) {
                userItems.FishingRodUsage += 1;
                userItems.save();
            }

            if (dataTime) {
                dataTime.Fish = Date.now();
                dataTime.save();
            }
            else {
                new Schema2({
                    Guild: message.guild.id,
                    User: user.id,
                    Fish: Date.now()
                }).save();
            }
        }
    })

}

 
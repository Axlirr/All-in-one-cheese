const Discord = require('discord.js');

const Schema = require("../../database/models/economyTimeout");

module.exports = async (client, interaction, args) => {
    let user = interaction.user;

    let timeout = 1800000;
    
    let napTypes = [
        { location: 'at the market stall', emoji: '🏪', bonus: 1.5 },
        { location: 'in the cheese cellar', emoji: '🧀', bonus: 2.0 },
        { location: 'under a shady tree', emoji: '🌳', bonus: 1.3 },
        { location: 'by the fireplace', emoji: '🔥', bonus: 1.4 },
        { location: 'in the tavern', emoji: '🍺', bonus: 1.6 },
        { location: 'in your cozy bed', emoji: '🛏️', bonus: 1.2 },
        { location: 'by the river bank', emoji: '🌊', bonus: 1.7 },
        { location: 'on a hay bale in the barn', emoji: '🌾', bonus: 1.8 }
    ];
    
    let nap = napTypes[Math.floor(Math.random() * napTypes.length)];
    let baseAmount = Math.floor(Math.random() * 30) + 20;
    let finalAmount = Math.floor(baseAmount * nap.bonus);

    Schema.findOne({ Guild: interaction.guild.id, User: user.id }, async (err, dataTime) => {
        if (dataTime && dataTime.Nap !== null && timeout - (Date.now() - dataTime.Nap) > 0) {
            let time = (dataTime.Nap / 1000 + timeout / 1000).toFixed(0);
            return client.errWait({
                time: time,
                type: 'editreply'
            }, interaction);
        }
        else {

            client.succNormal({
                text: `😴 **Zzz...** You had a refreshing nap and dreamed of cheese!`,
                fields: [
                    {
                        name: `${nap.emoji}┆Nap Spot`,
                        value: `${nap.location}`,
                        inline: true
                    },
                    {
                        name: `✨┆Dream Bonus`,
                        value: `x${nap.bonus}`,
                        inline: true
                    },
                    {
                        name: `🧀┆Cheese Coins Dreamed`,
                        value: `+${finalAmount} coins`,
                        inline: true
                    }
                ],
                type: 'editreply'
            }, interaction);

            if (dataTime) {
                dataTime.Nap = Date.now();
                dataTime.save();
            }
            else {
                new Schema({
                    Guild: interaction.guild.id,
                    User: user.id,
                    Nap: Date.now()
                }).save();
            }

            client.addMoney(interaction, user, finalAmount);
        }
    })
}

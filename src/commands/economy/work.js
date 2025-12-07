const Discord = require('discord.js');

const Schema = require("../../database/models/economy");
const Schema2 = require("../../database/models/economyTimeout");

module.exports = async (client, interaction, args) => {
  let user = interaction.user;
  let timeout = 600000;

  Schema2.findOne({ Guild: interaction.guild.id, User: user.id }, async (err, dataTime) => {
    if (dataTime && dataTime.Work !== null && timeout - (Date.now() - dataTime.Work) > 0) {
      let time = (dataTime.Work / 1000 + timeout / 1000).toFixed(0);
      return client.errWait({
        time: time,
        type: 'editreply'
      }, interaction);
    }
    else {
      let replies = [
        { job: 'Cat Cafe Barista', emoji: '☕' },
        { job: 'Yarn Ball Factory Worker', emoji: '🧶' },
        { job: 'Mouse Patrol Officer', emoji: '🐭' },
        { job: 'Catnip Farmer', emoji: '🌿' },
        { job: 'Professional Napper', emoji: '😴' },
        { job: 'Laser Pointer Technician', emoji: '🔴' },
        { job: 'Cardboard Box Inspector', emoji: '📦' },
        { job: 'Treat Taste Tester', emoji: '🍪' },
        { job: 'Sunbeam Quality Analyst', emoji: '☀️' },
        { job: 'Cheese Wheel Guard', emoji: '🧀' }
      ];

      let result = Math.floor((Math.random() * replies.length));
      let amount = Math.floor(Math.random() * 150) + 25;

      client.succNormal({
        text: `🐱 **Meow!** You worked hard today!`,
        fields: [
          {
            name: `${replies[result].emoji}┆Job`,
            value: `${replies[result].job}`,
            inline: true
          },
          {
            name: `🧀┆Cheese Coins Earned`,
            value: `${amount} cheese coins`,
            inline: true
          }
        ],
        type: 'editreply'
      }, interaction);

      if (dataTime) {
        dataTime.Work = Date.now();
        dataTime.save();
      }
      else {
        new Schema2({
          Guild: interaction.guild.id,
          User: user.id,
          Work: Date.now()
        }).save();
      }

      client.addMoney(interaction, user, amount);
    }
  })
}

 
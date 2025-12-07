const Discord = require('discord.js');

const Schema = require("../../database/models/economy");

module.exports = async (client, interaction, args) => {

    const user = interaction.options.getUser('user') || interaction.user;

    if (user.bot) return client.errNormal({
        error: "You cannot see the balance of a bot!",
        type: 'editreply'
    }, interaction);

    Schema.findOne({ Guild: interaction.guild.id, User: user.id }, async (err, data) => {
        if (data) {

            let total = data.Money + data.Bank;

            client.embed({
                title: `🐱🧀 Cheese Cat Balance`,
                fields: [
                    {
                        name: `🐾┆Paw Wallet`,
                        value: `${data.Money} cheese coins`,
                        inline: true
                    },
                    {
                        name: `🧀┆Cheese Vault`,
                        value: `${data.Bank} cheese coins`,
                        inline: true
                    },
                    {
                        name: `✨┆Total Stash`,
                        value: `${total} cheese coins`,
                        inline: true
                    }
                ],
                desc: `🐱 **${user.username}**'s cheese collection`,
                type: 'editreply'
            }, interaction);
        }
        else {
            client.errNormal({
                error: `This cat hasn't collected any cheese coins yet!`, type: 'editreply'
            }, interaction);
        }
    })
}

 
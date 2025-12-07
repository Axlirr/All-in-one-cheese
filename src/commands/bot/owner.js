const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
    client.embed({
        title: `📘・Owner information`,
        desc: `____________________________`,
        thumbnail: client.user.avatarURL({ dynamic: true, size: 1024 }),
        fields: [{
            name: "👑┆Owner name",
            value: `Axlir`,
            inline: true,
        },
        {
            name: "🏷┆Discord tag",
            value: `Axlirr`,
            inline: true,
        },
        {
            name: "🏢┆Organization",
            value: `Cheese Bot`,
            inline: true,
        },
        {
            name: "🌐┆Website",
            value: `[https://github.com/Axlirr/All-in-one-cheese](https://github.com/Axlirr/All-in-one-cheese)`,
            inline: true,
        }],
        type: 'editreply'
    }, interaction)
}


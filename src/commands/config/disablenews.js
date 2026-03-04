const Discord = require('discord.js');
const WorldNewsConfig = require('../../database/models/worldNewsConfig');

module.exports = async (client, interaction) => {
    const perms = await client.checkUserPerms({
        flags: [Discord.PermissionsBitField.Flags.ManageGuild],
        perms: [Discord.PermissionsBitField.Flags.ManageGuild]
    }, interaction);

    if (perms == false) return;

    const cfg = await WorldNewsConfig.findOne({ Guild: interaction.guild.id });
    if (!cfg) {
        return client.errNormal({
            error: 'News automation is not configured in this server.',
            type: 'editreply'
        }, interaction);
    }

    cfg.Enabled = false;
    await cfg.save();

    return client.succNormal({
        text: 'Automated news posting has been disabled for this server.',
        type: 'editreply'
    }, interaction);
};

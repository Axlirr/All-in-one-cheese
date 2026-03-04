const Discord = require('discord.js');
const WorldNewsConfig = require('../../database/models/worldNewsConfig');

module.exports = async (client, interaction) => {
    const perms = await client.checkUserPerms({
        flags: [Discord.PermissionsBitField.Flags.ManageGuild],
        perms: [Discord.PermissionsBitField.Flags.ManageGuild]
    }, interaction);

    if (perms == false) return;

    const cfg = await WorldNewsConfig.findOne({ Guild: interaction.guild.id });
    if (!cfg || !cfg.Channel) {
        return client.errNormal({
            error: 'News automation is not configured. Use /config setnewschannel first.',
            type: 'editreply'
        }, interaction);
    }

    cfg.LastRunAt = 0; // force immediate cycle
    cfg.Enabled = true;
    await cfg.save();

    await client.runWorldNewsCycle();

    return client.succNormal({
        text: 'Triggered a manual news fetch/post cycle.',
        type: 'editreply'
    }, interaction);
};

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
            error: 'News automation is not configured yet. Use /config setnewschannel',
            type: 'editreply'
        }, interaction);
    }

    return client.embed({
        title: '📰・Automated News Status',
        fields: [
            { name: 'Enabled', value: cfg.Enabled ? 'Yes' : 'No', inline: true },
            { name: 'Channel', value: cfg.Channel ? `<#${cfg.Channel}>` : 'Not set', inline: true },
            { name: 'Variant', value: cfg.Variant || 'world', inline: true },
            { name: 'Interval', value: `${cfg.IntervalMins || 15} min`, inline: true },
            { name: 'Last Run', value: cfg.LastRunAt ? `<t:${Math.floor(cfg.LastRunAt / 1000)}:R>` : 'Never', inline: true },
            { name: 'Last Posted', value: cfg.LastPostedAt ? `<t:${Math.floor(cfg.LastPostedAt / 1000)}:R>` : 'Never', inline: true },
        ],
        type: 'editreply'
    }, interaction);
};

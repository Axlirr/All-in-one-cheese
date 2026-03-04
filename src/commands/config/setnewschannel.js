const Discord = require('discord.js');
const WorldNewsConfig = require('../../database/models/worldNewsConfig');

module.exports = async (client, interaction) => {
    const perms = await client.checkUserPerms({
        flags: [Discord.PermissionsBitField.Flags.ManageGuild],
        perms: [Discord.PermissionsBitField.Flags.ManageGuild]
    }, interaction);

    if (perms == false) return;

    const channel = interaction.options.getChannel('channel');
    const variant = interaction.options.getString('variant');
    const requestedInterval = interaction.options.getNumber('interval');
    const interval = Math.max(5, Math.min(120, Math.floor(requestedInterval || 15)));

    let config = await WorldNewsConfig.findOne({ Guild: interaction.guild.id });
    if (!config) {
        config = await WorldNewsConfig.create({
            Guild: interaction.guild.id,
            Channel: channel.id,
            Variant: variant,
            Enabled: true,
            IntervalMins: interval,
            SeenLinks: [],
        });
    } else {
        config.Channel = channel.id;
        config.Variant = variant;
        config.Enabled = true;
        config.IntervalMins = interval;
        await config.save();
    }

    return client.succNormal({
        text: `Automated news posting configured successfully.`,
        fields: [
            { name: '📢 Channel', value: `${channel}`, inline: true },
            { name: '🧭 Variant', value: variant, inline: true },
            { name: '⏱️ Interval', value: `${interval} min`, inline: true },
        ],
        type: 'editreply'
    }, interaction);
};

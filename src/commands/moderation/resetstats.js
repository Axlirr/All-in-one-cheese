const Discord = require('discord.js');
const ModeratorPerformance = require('../../database/models/moderatorPerformance');

module.exports = async (client, interaction) => {
    const perms = await client.checkUserPerms({
        flags: [Discord.PermissionsBitField.Flags.Administrator],
        perms: [Discord.PermissionsBitField.Flags.Administrator]
    }, interaction);

    if (perms == false) return;

    const moderator = interaction.options.getUser('moderator');

    if (moderator) {
        await ModeratorPerformance.deleteOne({ Guild: interaction.guild.id, Moderator: moderator.id });
        return client.succNormal({
            text: `Reset moderation performance data for ${moderator}.`,
            type: 'editreply'
        }, interaction);
    }

    await ModeratorPerformance.deleteMany({ Guild: interaction.guild.id });
    client.succNormal({
        text: 'Reset moderation performance data for all moderators in this server.',
        type: 'editreply'
    }, interaction);
};

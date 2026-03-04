const Discord = require('discord.js');

module.exports = async (client, interaction) => {
    const perms = await client.checkUserPerms({
        flags: [Discord.PermissionsBitField.Flags.ManageGuild],
        perms: [Discord.PermissionsBitField.Flags.ManageGuild]
    }, interaction);

    if (perms == false) return;

    const moderator = interaction.options.getUser('moderator');
    const score = interaction.options.getNumber('score');
    const note = interaction.options.getString('note') || '';

    if (score < 1 || score > 5) {
        return client.errNormal({
            error: 'Score must be between 1 and 5.',
            type: 'editreply'
        }, interaction);
    }

    const updated = await client.rateModerator({
        guildId: interaction.guild.id,
        moderatorId: moderator.id,
        byUserId: interaction.user.id,
        score,
        note,
    });

    client.succNormal({
        text: `Saved rating for ${moderator}.`,
        fields: [
            { name: '⭐ New Rating', value: `${score}/5`, inline: true },
            { name: '📊 Avg Rating', value: `${updated.RatingAvg} (${updated.RatingCount} ratings)`, inline: true },
            { name: '📝 Note', value: note ? note.slice(0, 1000) : 'No note provided', inline: false }
        ],
        type: 'editreply'
    }, interaction);
};

module.exports = async (client, interaction) => {
    const socials = [
        `• Support Server: ${client.config.discord.serverInvite || 'Not configured'}`,
        `• Bot Invite: ${client.config.discord.botInvite || 'Not configured'}`,
        `• Vote Link: ${client.config.discord.botVotes || 'Not configured'}`,
    ].join('\n');

    return client.embed({
        title: '🌐・Bot Socials',
        desc: socials,
        type: 'editreply'
    }, interaction);
};

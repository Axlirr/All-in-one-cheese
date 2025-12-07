const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
    const player = client.player;
    const queue = player.nodes.get(interaction.guild.id);

    if (!queue || !queue.isPlaying()) return client.errNormal({
        error: "There is no music playing in this server",
        type: 'editreply'
    }, interaction);

    if (!interaction.member.voice.channel) return client.errNormal({
        error: `You're not in a voice channel!`,
        type: 'editreply'
    }, interaction);

    const track = queue.currentTrack;

    client.embed({
        title: `${client.emotes.normal.music}・Now playing`,
        desc: `**[${track.title}](${track.url})**`,
        thumbnail: track.thumbnail,
        fields: [
            {
                name: `👤┆Requested By`,
                value: `${track.requestedBy}`,
                inline: true
            },
            {
                name: `⏱┆Duration`,
                value: `${track.duration}`,
                inline: true
            },
            {
                name: `🎼┆Progress`,
                value: queue.node.createProgressBar(),
                inline: false
            }
        ],
        type: 'editreply'
    }, interaction);
}
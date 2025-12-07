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

    if (interaction.guild.members.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) return client.errNormal({
        error: `You are not in the same voice channel!`,
        type: 'editreply'
    }, interaction);

    let number = interaction.options.getNumber('number');

    if (number > queue.tracks.size || number <= 0) return client.errNormal({
        error: `The queue doesn't have that many songs (1-${queue.tracks.size})`,
        type: 'editreply'
    }, interaction);

    const track = queue.tracks.at(number - 1);
    queue.node.remove(track);

    client.succNormal({
        text: `Removed **${track.title}** from the queue!`,
        type: 'editreply'
    }, interaction);
}

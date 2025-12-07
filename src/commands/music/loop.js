const Discord = require('discord.js');
const { QueueRepeatMode } = require('discord-player');

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

    // erela used boolean for loop, discord-player uses modes
    // 0 = OFF, 1 = TRACK, 2 = QUEUE, 3 = AUTOPLAY

    // Simulating "loop song" toggle
    if (queue.repeatMode === 1) {
        queue.setRepeatMode(0); // Off
        client.succNormal({
            text: `Loop mode disabled!`,
            type: 'editreply'
        }, interaction);
    } else {
        queue.setRepeatMode(1); // Track
        client.succNormal({
            text: `Loop mode enabled!`,
            type: 'editreply'
        }, interaction);
    }
}
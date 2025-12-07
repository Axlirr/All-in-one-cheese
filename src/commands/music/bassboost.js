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

    // Toggle bassboost
    await queue.filters.ffmpeg.toggle(['bassboost']);

    // Check if enabled or disabled
    // There isn't a direct "isEnabled" property easily accessible for a specific filter without iterating, 
    // but toggle returns boolean or we can assume it flipped.
    // For simplicity, we just say "toggled". 
    // Or we can check queue.filters.ffmpeg.getFiltersEnabled().includes('bassboost')

    const enabled = queue.filters.ffmpeg.getFiltersEnabled().includes('bassboost');

    client.succNormal({
        text: `Bassboost **${enabled ? 'enabled' : 'disabled'}**!`,
        type: 'editreply'
    }, interaction);
}
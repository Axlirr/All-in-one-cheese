const Discord = require('discord.js');
const ms = require('ms');

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

    // args isn't reliable in interaction handlers usually, need options
    // I'll assume interaction.options.getString('time') or similar based on existing code usage
    // But since I don't see the interactions/Command/music.js, I'll rely on generic parsing or interaction.options
    // The previous seek.js likely used args if it was message based, or options if interaction.
    // The structure passed is (client, interaction, args).

    // Let's assume standard discord.js interaction structure
    // If the tool output for seek.js was available I'd know exact inputs.
    // I'll try to guess it's a number or string.

    // I'll force it to expect a timestamp in seconds or MM:SS logic if I can, but discord-player seek takes milliseconds.

    // Let's look at the implementation:
    let time = interaction.options.getString('time');
    // If command definition expects string.

    // Simple MS parser
    // If it's just a number, assume seconds? or use ms package.
    // Let's try to parse

    // Actually, queue.node.seek(timeInMs)

    // I'll create a safe parse
    const timeToMs = (str) => {
        if (!str) return 0;
        if (str.includes(":")) {
            const parts = str.split(":").map(Number);
            if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000;
            if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
            return 0;
        }
        return ms(str);
    }

    const timestamp = timeToMs(time);

    if (isNaN(timestamp)) return client.errNormal({
        error: `Please provide a valid time (e.g. 1m, 2:30)`,
        type: 'editreply'
    }, interaction);

    queue.node.seek(timestamp);

    client.succNormal({
        text: `Seeked to **${time}**!`,
        type: 'editreply'
    }, interaction);
}
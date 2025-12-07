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

    let amount = interaction.options.getNumber('amount');

    if (!amount || amount < 0 || amount > 100) return client.errNormal({
        error: `Please enter a valid number (1-100)`,
        type: 'editreply'
    }, interaction);

    queue.node.setVolume(amount);

    client.succNormal({
        text: `Volume set to **${amount}%**`,
        type: 'editreply'
    }, interaction);
}
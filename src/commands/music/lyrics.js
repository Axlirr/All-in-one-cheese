const Discord = require('discord.js');
const lyricsFinder = require("lyrics-finder");

module.exports = async (client, interaction, args) => {
    let search = "";

    const player = client.player;
    const queue = player.nodes.get(interaction.guild.id);

    const channel = interaction.member.voice.channel;
    if (!channel) return client.errNormal({
        error: `You're not in a voice channel!`,
        type: 'editreply'
    }, interaction);

    if (queue && queue.isPlaying() && (channel.id !== queue.channel.id)) return client.errNormal({
        error: `You're not in the same voice channel!`,
        type: 'editreply'
    }, interaction);

    if (!interaction.options.getString('song')) {
        if (!queue || !queue.isPlaying()) return client.errNormal({
            error: "There are no songs playing in this server",
            type: 'editreply'
        }, interaction);
        search = queue.currentTrack.title;
    }
    else {
        search = interaction.options.getString('song');
    }

    let lyrics = "";

    try {
        lyrics = await lyricsFinder(search, "");
        if (!lyrics) lyrics = `No lyrics found for ${search} :x:`;
    } catch (error) {
        lyrics = `No lyrics found for ${search} :x:`;
    }

    client.embed({
        title: `${client.emotes.normal.music}・Lyrics For ${search}`,
        desc: lyrics.length >= 4096 ? `${lyrics.substr(0, 4093)}...` : lyrics,
        type: 'editreply'
    }, interaction)
}
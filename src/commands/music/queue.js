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

    let count = 0;
    let status;

    if (queue.tracks.size === 0) {
        status = "No more music in the queue";
    }
    else {
        status = queue.tracks.map((track) => {
            count += 1;
            return (`**[#${count}]**┆${track.title.length >= 45 ? `${track.title.slice(0, 45)}...` : track.title} (Requested by <@!${track.requestedBy?.id || 'Unknown'}>)`);
        }).join("\n");
    }

    let thumbnail = queue.currentTrack.thumbnail || interaction.guild.iconURL({ size: 1024 });

    client.embed({
        title: `${client.emotes.normal.music}・Songs queue - ${interaction.guild.name}`,
        desc: status,
        thumbnail: thumbnail,
        fields: [
            {
                name: `${client.emotes.normal.music} Current song:`,
                value: `${queue.currentTrack.title} (Requested by <@!${queue.currentTrack.requestedBy?.id || 'Unknown'}>)`
            }
        ],
        type: 'editreply'
    }, interaction)
}
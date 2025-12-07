const Discord = require('discord.js');

module.exports = (client, queue, track) => {
    let embed = new Discord.EmbedBuilder()
        .setTitle(`🎶・Now playing`)
        .setDescription(`**[${track.title}](${track.url})**`)
        .setThumbnail(track.thumbnail)
        .addFields([
            {
                name: `👤┆Requested By`,
                value: `${track.requestedBy}`,
                inline: true
            },
            {
                name: `⏱┆Duration`,
                value: `${track.duration}`,
                inline: true
            }
        ])
        .setColor(client.config.colors.normal);

    queue.metadata.channel.send({ embeds: [embed] });
};

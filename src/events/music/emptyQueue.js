const Discord = require('discord.js');

module.exports = (client, queue) => {
    let embed = new Discord.EmbedBuilder()
        .setTitle(`👋・Queue Empty`)
        .setDescription(`The queue is empty, I'm leaving the voice channel!`)
        .setColor(client.config.colors.normal);

    queue.metadata.channel.send({ embeds: [embed] });
};

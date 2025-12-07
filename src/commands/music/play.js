const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
    if (!interaction.member.voice.channel) return client.errNormal({
        error: `You're not in a voice channel!`,
        type: 'editreply'
    }, interaction);

    const channel = interaction.member.voice.channel;
    const query = interaction.options.getString('song');

    client.simpleEmbed({
        desc: `🔎┆Searching...`,
        type: 'editreply'
    }, interaction);

    try {
        const { track } = await client.player.play(channel, query, {
            nodeOptions: {
                metadata: {
                    channel: interaction.channel,
                    client: client
                }
            }
        });

        // discord-player handles the queue addition and playing automatically.
        // We can just send a confirmation if needed, but since we have a playerStart event, 
        // we might not need to send a "Started playing" message depending on preference.
        // However, discord-player's play returns an object with `track`.
        // If it's a playlist or search result, we might want to inform the user.

        // For queue addition (if already playing), discord-player usually doesn't emit 'trackStart' immediately.
        // Let's rely on events for "Now Playing" and just confirm queue add here if needed, 
        // but typically 'play' is fire-and-forget regarding the UI if events are set up.
        // But let's follow the previous logic: if queued, say so.
        // Actually, client.player.play() resolves when the track is *added* to the queue (approx).

        // Note: The previous code had complex search handling. discord-player's play() does searching internally if query is string.

        // To keep it simple and rely on the new event handlers:
        // We effectively delegate UI updates to the event handlers (playerStart).
        // But for "Added to queue" vs "Playing now", we can check the queue.

        const queue = client.player.nodes.get(interaction.guild.id);
        if (queue && queue.isPlaying() && queue.currentTrack !== track) {
            client.embed({
                title: `${client.emotes.normal.music}・${track.title}`,
                url: track.url,
                desc: `The song has been added to the queue!`,
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
                    }
                ],
                type: 'editreply'
            }, interaction);
        } else {
            // If it's the first track, playerStart event will handle the "Now Playing" message.
            // We can delete the "Searching..." message.
            interaction.deleteReply().catch(() => { });
        }

    } catch (e) {
        console.error(e);
        return client.errNormal({
            error: `No results found or error connecting!`,
            type: 'editreply'
        }, interaction);
    }
}
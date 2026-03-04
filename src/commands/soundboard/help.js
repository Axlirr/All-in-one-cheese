module.exports = async (client, interaction) => {
    const command = interaction.commandName;
    const cmd = interaction.client.commands.get(command);
    const options = cmd?.data?.options || [];
    const lines = options
        .filter(o => o.type === 1)
        .map(o => `• **${o.name}** — ${o.description}`)
        .join('\n') || 'No subcommands documented.';

    return client.embed({
        title: `❓・/${command} help`,
        desc: lines,
        type: 'editreply'
    }, interaction);
};

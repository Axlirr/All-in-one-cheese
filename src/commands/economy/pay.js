module.exports = async (client, interaction) => {
    const receiverMember = await interaction.guild.members.fetch(interaction.options.getUser('user'));
    const amount = Math.floor(interaction.options.getNumber('amount'));

    if (!Number.isFinite(amount) || amount <= 0) {
        return client.errNormal({ error: `Amount must be greater than 0`, type: 'editreply' }, interaction);
    }

    if (receiverMember.user.bot) {
        return client.errNormal({ error: `You can't pay a bot`, type: 'editreply' }, interaction);
    }

    if (receiverMember.id === interaction.user.id) {
        return client.errNormal({ error: 'You cannot pay money to yourself!', type: 'editreply' }, interaction);
    }

    const transfer = await client.transferMoney(interaction, interaction.user, receiverMember.user, amount);
    if (!transfer.ok) {
        return client.errNormal({ error: `You don't have enough money!`, type: 'editreply' }, interaction);
    }

    return client.succNormal({
        text: `Transfer completed successfully`,
        fields: [
            {
                name: `👤┆Receiver`,
                value: `${receiverMember.user.tag}`,
                inline: true
            },
            {
                name: `${client.emotes.economy.coins}┆Amount`,
                value: `${amount} cheese coins`,
                inline: true
            }
        ],
        type: 'editreply'
    }, interaction);
}

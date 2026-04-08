const Schema = require('../../database/models/economy');

module.exports = async (client, interaction) => {
    const user = interaction.options.getUser('user') || interaction.user;

    if (user.bot) {
        return client.errNormal({
            error: "You cannot see the balance of a bot!",
            type: 'editreply'
        }, interaction);
    }

    const data = await Schema.findOne({ Guild: interaction.guild.id, User: user.id });

    if (!data) {
        return client.errNormal({
            error: `This user hasn't collected any cheese coins yet!`,
            type: 'editreply'
        }, interaction);
    }

    const money = Math.max(0, Number(data.Money) || 0);
    const bank = Math.max(0, Number(data.Bank) || 0);
    const total = money + bank;

    return client.embed({
        title: `🧀 Cheese Balance`,
        fields: [
            {
                name: `💰┆Wallet`,
                value: `${money} cheese coins`,
                inline: true
            },
            {
                name: `🏦┆Cheese Vault`,
                value: `${bank} cheese coins`,
                inline: true
            },
            {
                name: `✨┆Total`,
                value: `${total} cheese coins`,
                inline: true
            }
        ],
        desc: `🧀 **${user.username}**'s cheese collection`,
        type: 'editreply'
    }, interaction);
}

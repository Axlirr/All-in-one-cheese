const Schema = require("../../database/models/economy");

module.exports = async (client, interaction, args) => {
    const amount = interaction.options.getNumber('amount');
    const user = interaction.user;

    if (!amount) return client.errUsage({ usage: "deposit [amount]", type: 'editreply' }, interaction);
    if (isNaN(amount) || amount <= 0) return client.errNormal({ error: "Enter a valid positive number!", type: 'editreply' }, interaction);

    const data = await Schema.findOne({ Guild: interaction.guild.id, User: user.id });

    if (!data) return client.errNormal({ error: `You don't have any cheese coins to deposit!`, type: 'editreply' }, interaction);

    const money = Math.floor(amount);
    if (data.Money < money) return client.errNormal({ error: `You only have **${data.Money}** cheese coins in your wallet!`, type: 'editreply' }, interaction);

    data.Money -= money;
    data.Bank += money;
    await data.save();

    return client.succNormal({
        text: `You've deposited some money into your bank!`,
        fields: [
            {
                name: `${client.emotes.economy.coins}┆Amount`,
                value: `${money} cheese coins`,
                inline: true
            }
        ],
        type: 'editreply'
    }, interaction);
}

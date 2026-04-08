const Schema = require("../../database/models/economy");

module.exports = async (client, interaction, args) => {
    const amount = interaction.options.getNumber('amount');
    const user = interaction.user;

    if (!amount) return client.errUsage({ usage: "withdraw [amount]", type: 'editreply' }, interaction);
    if (isNaN(amount) || amount <= 0) return client.errNormal({ error: "Enter a valid positive number!", type: 'editreply' }, interaction);

    const data = await Schema.findOne({ Guild: interaction.guild.id, User: user.id });

    if (!data || data.Bank <= 0) return client.errNormal({ error: `You have nothing left in the bank!`, type: 'editreply' }, interaction);

    const money = Math.floor(amount);
    if (money > data.Bank) return client.errNormal({ error: `You only have **${data.Bank}** cheese coins in your vault!`, type: 'editreply' }, interaction);

    data.Money += money;
    data.Bank -= money;
    await data.save();

    return client.succNormal({
        text: `You've withdrawn some money from your bank!`,
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

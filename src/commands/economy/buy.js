const Discord = require('discord.js');
const Schema = require('../../database/models/economy');
const store = require('../../database/models/economyStore');

module.exports = async (client, interaction) => {
    const storeData = await store.find({ Guild: interaction.guild.id });
    if (!storeData.length) {
        return client.errNormal({
            error: `No shop found in this server`,
            type: 'editreply'
        }, interaction);
    }

    let labels = storeData
        .map(d => {
            const role = interaction.guild.roles.cache.get(d.Role);
            if (!role) return null;
            return {
                label: `${role.name.slice(0, 24)}`,
                value: role.id,
            };
        })
        .filter(Boolean);

    labels.push({ label: `Fishingrod`, value: `fishingrod` });

    const select = await client.generateSelect(`economyBuy`, labels);

    await client.embed({
        title: `🛒・${interaction.guild.name}'s Store`,
        desc: `Choose an item from the menu to buy`,
        components: [select],
        type: 'editreply'
    }, interaction);

    const filter = i => i.user.id === interaction.user.id;

    try {
        const i = await interaction.channel.awaitMessageComponent({
            filter,
            componentType: Discord.ComponentType.StringSelect,
            time: 60000
        });

        const buyer = i.guild.members.cache.get(i.user.id);
        const wallet = await Schema.findOne({ Guild: i.guild.id, User: i.user.id });
        const money = Number(wallet?.Money || 0);

        if (i.values[0] === 'fishingrod') {
            const cost = 100;
            if (money < cost) {
                return client.errNormal({
                    error: `You don't have enough money to buy this!`,
                    type: 'update',
                    components: []
                }, i);
            }

            const removed = await client.removeMoney(i, i.user, cost);
            if (!removed) {
                return client.errNormal({
                    error: `Your wallet could not be updated. Try again.`,
                    type: 'update',
                    components: []
                }, i);
            }

            await client.buyItem(i, i.user, 'FishingRod');
            return client.succNormal({
                text: `Purchase completed successfully`,
                fields: [{ name: `📘┆Item`, value: `Fishingrod` }],
                type: 'update',
                components: []
            }, i);
        }

        const checkStore = await store.findOne({ Guild: i.guild.id, Role: i.values[0] });
        if (!checkStore) {
            return client.errNormal({
                error: `That store item no longer exists.`,
                type: 'update',
                components: []
            }, i);
        }

        const itemCost = Number(checkStore.Amount || 0);
        if (money < itemCost) {
            return client.errNormal({
                error: `You don't have enough money to buy this!`,
                type: 'update',
                components: []
            }, i);
        }

        const removed = await client.removeMoney(i, i.user, itemCost);
        if (!removed) {
            return client.errNormal({
                error: `Your wallet could not be updated. Try again.`,
                type: 'update',
                components: []
            }, i);
        }

        try {
            await buyer.roles.add(i.values[0]);
        } catch (_) {
            await client.addMoney(i, i.user, itemCost); // rollback funds when role grant fails
            return client.errNormal({
                error: `I can't add <@&${i.values[0]}> to you!`,
                type: 'update',
                components: []
            }, i);
        }

        return client.succNormal({
            text: `Purchase completed successfully`,
            fields: [{ name: `📘┆Item`, value: `<@&${i.values[0]}>` }],
            type: 'update',
            components: []
        }, i);
    } catch (_) {
        return;
    }
};

const Discord = require('discord.js');
const Schema = require('../../database/models/economy');
const itemSchema = require('../../database/models/economyItems');
const store = require('../../database/models/economyStore');
const sellable = require('../../database/models/economySellable');

module.exports = async (client, interaction) => {
    const guildId = interaction.guild.id;
    const roleStore = await store.find({ Guild: guildId });
    const customItems = await sellable.find({ Guild: guildId, Category: { $ne: 'role' } }).sort({ ItemName: 1 }).limit(40);

    if (!roleStore.length && !customItems.length) {
        return client.errNormal({ error: 'No shop found in this server.', type: 'editreply' }, interaction);
    }

    const labels = [];

    for (const d of roleStore) {
        const role = interaction.guild.roles.cache.get(d.Role);
        if (!role) continue;
        labels.push({ label: role.name.slice(0, 24), value: `role:${role.id}` });
    }

    for (const item of customItems) {
        labels.push({
            label: item.ItemName.slice(0, 24),
            value: `custom:${item.Key}`,
            description: `${item.Category} • ${client.emotes.economy.coins} ${item.BuyPrice}`.slice(0, 90)
        });
    }

    labels.push({ label: 'Fishing Rod', value: 'fishingrod', description: `${client.emotes.economy.coins} 100` });

    const select = await client.generateSelect('economyBuy', labels.slice(0, 25));

    await client.embed({
        title: `🛒・${interaction.guild.name}'s Store`,
        desc: 'Choose an item from the menu to buy',
        components: [select],
        type: 'editreply'
    }, interaction);

    const filter = (i) => i.user.id === interaction.user.id;

    try {
        const i = await interaction.channel.awaitMessageComponent({
            filter,
            componentType: Discord.ComponentType.StringSelect,
            time: 60000
        });

        const buyer = await i.guild.members.fetch(i.user.id).catch(() => null);
        if (!buyer) {
            return client.errNormal({ error: 'Unable to load your member profile.', type: 'update', components: [] }, i);
        }

        const wallet = await Schema.findOne({ Guild: i.guild.id, User: i.user.id });
        const money = Number(wallet?.Money || 0);
        const selected = i.values[0];

        if (selected === 'fishingrod') {
            const cost = 100;
            if (money < cost) {
                return client.errNormal({ error: `You don't have enough money to buy this.`, type: 'update', components: [] }, i);
            }

            const removed = await client.removeMoney(i, i.user, cost);
            if (!removed) {
                return client.errNormal({ error: 'Your wallet could not be updated. Try again.', type: 'update', components: [] }, i);
            }

            await client.buyItem(i, i.user, 'FishingRod');
            return client.succNormal({
                text: 'Purchase completed successfully',
                fields: [{ name: '📘┆Item', value: 'Fishing Rod' }],
                type: 'update',
                components: []
            }, i);
        }

        if (selected.startsWith('role:')) {
            const roleId = selected.slice(5);
            const checkStore = await store.findOne({ Guild: i.guild.id, Role: roleId });
            if (!checkStore) {
                return client.errNormal({ error: 'That store item no longer exists.', type: 'update', components: [] }, i);
            }

            const itemCost = Number(checkStore.Amount || 0);
            if (money < itemCost) {
                return client.errNormal({ error: `You don't have enough money to buy this.`, type: 'update', components: [] }, i);
            }

            const removed = await client.removeMoney(i, i.user, itemCost);
            if (!removed) {
                return client.errNormal({ error: 'Your wallet could not be updated. Try again.', type: 'update', components: [] }, i);
            }

            try {
                await buyer.roles.add(roleId);
            } catch (_) {
                await client.addMoney(i, i.user, itemCost);
                return client.errNormal({ error: `I can't add <@&${roleId}> to you.`, type: 'update', components: [] }, i);
            }

            return client.succNormal({
                text: 'Purchase completed successfully',
                fields: [{ name: '📘┆Item', value: `<@&${roleId}>` }],
                type: 'update',
                components: []
            }, i);
        }

        if (!selected.startsWith('custom:')) {
            return client.errNormal({ error: 'Unknown store item selected.', type: 'update', components: [] }, i);
        }

        const key = selected.slice(7);
        const custom = await sellable.findOne({ Guild: i.guild.id, Key: key, Category: { $ne: 'role' } });
        if (!custom) {
            return client.errNormal({ error: 'That custom item no longer exists.', type: 'update', components: [] }, i);
        }

        if (money < custom.BuyPrice) {
            return client.errNormal({ error: `You don't have enough money to buy this.`, type: 'update', components: [] }, i);
        }

        if (Number.isFinite(custom.Stock) && custom.Stock <= 0) {
            return client.errNormal({ error: 'That item is out of stock.', type: 'update', components: [] }, i);
        }

        const inventoryDoc = await itemSchema.findOne({ Guild: i.guild.id, User: i.user.id });
        const inventory = inventoryDoc?.Inventory || {};
        const subscriptions = inventoryDoc?.Subscriptions || [];

        if (custom.Category === 'subscription') {
            const activeCount = subscriptions.filter((s) => s.Key === key && new Date(s.ExpiresAt).getTime() > Date.now()).length;
            if (Number.isFinite(custom.MaxOwned) && activeCount >= custom.MaxOwned) {
                return client.errNormal({ error: 'You already hold the maximum active subscriptions for this item.', type: 'update', components: [] }, i);
            }
        } else {
            const owned = Number(inventory[key] || 0);
            if (Number.isFinite(custom.MaxOwned) && owned >= custom.MaxOwned) {
                return client.errNormal({ error: 'You already hold the maximum quantity for this item.', type: 'update', components: [] }, i);
            }
        }

        let stockReserved = false;
        if (Number.isFinite(custom.Stock)) {
            const reserved = await sellable.findOneAndUpdate(
                { Guild: i.guild.id, Key: key, Stock: { $gt: 0 } },
                { $inc: { Stock: -1 } },
                { new: true }
            );
            if (!reserved) {
                return client.errNormal({ error: 'That item just sold out.', type: 'update', components: [] }, i);
            }
            stockReserved = true;
        }

        const removed = await client.removeMoney(i, i.user, custom.BuyPrice);
        if (!removed) {
            if (stockReserved) {
                await sellable.updateOne({ Guild: i.guild.id, Key: key }, { $inc: { Stock: 1 } });
            }
            return client.errNormal({ error: 'Your wallet could not be updated. Try again.', type: 'update', components: [] }, i);
        }

        try {
            const upsertFilter = { Guild: i.guild.id, User: i.user.id };
            if (custom.Category === 'subscription') {
                const durationDays = Number.isFinite(custom.DurationDays) ? custom.DurationDays : 30;
                const expiresAt = new Date(Date.now() + (durationDays * 86400000));
                await itemSchema.updateOne(
                    upsertFilter,
                    {
                        $setOnInsert: { Guild: i.guild.id, User: i.user.id },
                        $push: { Subscriptions: { Key: key, ItemName: custom.ItemName, ExpiresAt: expiresAt } }
                    },
                    { upsert: true }
                );
            } else {
                await itemSchema.updateOne(
                    upsertFilter,
                    {
                        $setOnInsert: { Guild: i.guild.id, User: i.user.id },
                        $inc: { [`Inventory.${key}`]: 1 }
                    },
                    { upsert: true }
                );
            }
        } catch (_) {
            await client.addMoney(i, i.user, custom.BuyPrice);
            if (stockReserved) {
                await sellable.updateOne({ Guild: i.guild.id, Key: key }, { $inc: { Stock: 1 } });
            }
            return client.errNormal({ error: 'Could not grant the item. Purchase was reverted.', type: 'update', components: [] }, i);
        }

        return client.succNormal({
            text: 'Purchase completed successfully',
            fields: [
                { name: '📘┆Item', value: custom.ItemName, inline: true },
                { name: '🏷️┆Type', value: custom.Category, inline: true }
            ],
            type: 'update',
            components: []
        }, i);
    } catch (_) {
        return;
    }
};

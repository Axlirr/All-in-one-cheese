const Discord = require('discord.js');
const itemSchema = require('../../database/models/economyItems');
const store = require('../../database/models/economyStore');
const sellableSchema = require('../../database/models/economySellable');
const cooldownSchema = require('../../database/models/economySellCooldowns');

module.exports = async (client, interaction) => {
    const user = interaction.user;
    const guild = interaction.guild;
    const member = await guild.members.fetch(user.id).catch(() => null);

    if (!member) {
        return client.errNormal({ error: `I can't access your member profile!`, type: 'editreply' }, interaction);
    }

    const storeData = await store.find({ Guild: guild.id });
    const sellables = await sellableSchema.find({ Guild: guild.id });
    const sellableMap = new Map(sellables.map((s) => [s.Key, s]));
    const sellableItems = [];

    for (const storeItem of storeData) {
        const role = guild.roles.cache.get(storeItem.Role);
        if (!role || role.managed || !member.roles.cache.has(storeItem.Role)) continue;

        const key = `role_${storeItem.Role}`;
        const cfg = sellableMap.get(key);
        const allowSell = cfg ? cfg.Sellable !== false : true;
        if (!allowSell) continue;

        const buyPrice = Number(cfg?.BuyPrice ?? storeItem.Amount ?? 0);
        const sellPrice = Number(cfg?.SellPrice ?? Math.floor(buyPrice * 0.7));

        sellableItems.push({
            key,
            label: role.name.slice(0, 24),
            value: `role:${storeItem.Role}`,
            sellPrice,
            buyPrice,
            type: 'role'
        });
    }

    const inventoryDoc = await itemSchema.findOne({ Guild: guild.id, User: user.id });
    const inventory = inventoryDoc?.Inventory || {};
    const subscriptions = inventoryDoc?.Subscriptions || [];

    if (inventoryDoc?.FishingRod) {
        sellableItems.push({
            key: 'fishingrod',
            label: 'Fishing Rod',
            value: 'fishingrod',
            sellPrice: 80,
            buyPrice: 100,
            type: 'item'
        });
    }

    for (const custom of sellables.filter((s) => s.Category !== 'role' && s.Sellable !== false)) {
        if (custom.Category === 'subscription') {
            const activeCount = subscriptions.filter((s) => s.Key === custom.Key && new Date(s.ExpiresAt).getTime() > Date.now()).length;
            if (activeCount <= 0) continue;

            sellableItems.push({
                key: custom.Key,
                label: `${custom.ItemName.slice(0, 20)} x${activeCount}`,
                value: `custom:${custom.Key}`,
                sellPrice: Number(custom.SellPrice || Math.floor(custom.BuyPrice * 0.7)),
                buyPrice: Number(custom.BuyPrice || 0),
                type: 'subscription'
            });
            continue;
        }

        const qty = Number(inventory[custom.Key] || 0);
        if (qty <= 0) continue;

        sellableItems.push({
            key: custom.Key,
            label: `${custom.ItemName.slice(0, 20)} x${qty}`,
            value: `custom:${custom.Key}`,
            sellPrice: Number(custom.SellPrice || Math.floor(custom.BuyPrice * 0.7)),
            buyPrice: Number(custom.BuyPrice || 0),
            type: custom.Category
        });
    }

    if (!sellableItems.length) {
        return client.errNormal({
            error: `You don't own any sellable items! Purchase items from the store first using /buy.`,
            type: 'editreply'
        }, interaction);
    }

    const labels = sellableItems.slice(0, 25).map((item) => ({
        label: item.label,
        value: item.value,
        description: `Sell for ${client.emotes.economy.coins} ${item.sellPrice} (from ${item.buyPrice})`
    }));

    const select = await client.generateSelect('economySell', labels);

    await client.embed({
        title: '💰・Sell Items',
        desc: 'Choose an owned item to sell.',
        components: [select],
        type: 'editreply'
    }, interaction);

    const filter = (i) => i.user.id === user.id;

    try {
        const i = await interaction.channel.awaitMessageComponent({
            filter,
            componentType: Discord.ComponentType.StringSelect,
            time: 60000
        });

        const selectedValue = i.values[0];
        const selectedItem = sellableItems.find((item) => item.value === selectedValue);

        if (!selectedItem) {
            return client.errNormal({ error: 'That item is no longer in your inventory!', type: 'update', components: [] }, i);
        }

        const cooldown = await cooldownSchema.findOne({ Guild: guild.id, User: user.id, ItemName: selectedValue });
        if (cooldown && cooldown.LastSoldAt) {
            const cooldownMs = 3600000;
            const multiplier = Math.min(cooldown.SellCount, 5);
            const requiredWait = cooldownMs * multiplier;
            const timeSinceLastSell = Date.now() - cooldown.LastSoldAt.getTime();

            if (timeSinceLastSell < requiredWait) {
                const timeLeft = Math.ceil((requiredWait - timeSinceLastSell) / 1000 / 60);
                return client.errNormal({
                    error: `You must wait **${timeLeft} more minutes** before selling this item again.`,
                    type: 'update',
                    components: []
                }, i);
            }
        }

        if (selectedValue === 'fishingrod') {
            const checkInventory = await itemSchema.findOne({ Guild: guild.id, User: user.id });
            if (!checkInventory?.FishingRod) {
                return client.errNormal({ error: `You no longer have a fishing rod!`, type: 'update', components: [] }, i);
            }

            await itemSchema.updateOne(
                { Guild: guild.id, User: user.id },
                { $set: { FishingRod: false, FishingRodUsage: 0 } }
            );

            const result = await client.sellItem(i, user, 'fishingrod', selectedItem.sellPrice);
            if (!result.ok) {
                await itemSchema.updateOne({ Guild: guild.id, User: user.id }, { $set: { FishingRod: true } });
                return client.errNormal({ error: `Sale failed: ${result.reason || 'Unknown error'}`, type: 'update', components: [] }, i);
            }

            return client.succNormal({
                text: '✅ You sold your Fishing Rod!',
                fields: [
                    { name: '📦┆Item', value: 'Fishing Rod', inline: true },
                    { name: '💰┆Earned', value: `${client.emotes.economy.coins} ${result.amount}`, inline: true }
                ],
                type: 'update',
                components: []
            }, i);
        }

        if (selectedValue.startsWith('role:')) {
            const roleId = selectedValue.slice(5);
            const freshMember = await guild.members.fetch(user.id).catch(() => null);
            if (!freshMember || !freshMember.roles.cache.has(roleId)) {
                return client.errNormal({ error: `You no longer have that role!`, type: 'update', components: [] }, i);
            }

            const targetRole = guild.roles.cache.get(roleId);
            if (!targetRole || targetRole.managed) {
                return client.errNormal({ error: 'That role can no longer be sold!', type: 'update', components: [] }, i);
            }

            try {
                await freshMember.roles.remove(roleId);
            } catch (_) {
                return client.errNormal({ error: `I can't remove the role from you!`, type: 'update', components: [] }, i);
            }

            const result = await client.sellItem(i, user, selectedItem.key, selectedItem.sellPrice);
            if (!result.ok) {
                try { await freshMember.roles.add(roleId); } catch (_) {}
                return client.errNormal({ error: `Sale failed: ${result.reason || 'Unknown error'}`, type: 'update', components: [] }, i);
            }

            return client.succNormal({
                text: `✅ You sold ${targetRole.name}!`,
                fields: [
                    { name: '🎭┆Role', value: `${targetRole}`, inline: true },
                    { name: '💰┆Earned', value: `${client.emotes.economy.coins} ${result.amount}`, inline: true }
                ],
                type: 'update',
                components: []
            }, i);
        }

        if (!selectedValue.startsWith('custom:')) {
            return client.errNormal({ error: 'Unknown sell target.', type: 'update', components: [] }, i);
        }

        const key = selectedValue.slice(7);
        const custom = await sellableSchema.findOne({ Guild: guild.id, Key: key, Sellable: true });
        if (!custom) {
            return client.errNormal({ error: 'This item is no longer sellable.', type: 'update', components: [] }, i);
        }

        const ownerDoc = await itemSchema.findOne({ Guild: guild.id, User: user.id });
        if (!ownerDoc) {
            return client.errNormal({ error: 'You no longer own this item.', type: 'update', components: [] }, i);
        }

        let rollbackAction = null;

        if (custom.Category === 'subscription') {
            const idx = (ownerDoc.Subscriptions || []).findIndex((s) => s.Key === key && new Date(s.ExpiresAt).getTime() > Date.now());
            if (idx === -1) {
                return client.errNormal({ error: 'No active subscription found for this item.', type: 'update', components: [] }, i);
            }

            const removed = ownerDoc.Subscriptions[idx];
            ownerDoc.Subscriptions.splice(idx, 1);
            await ownerDoc.save();
            rollbackAction = async () => {
                ownerDoc.Subscriptions.push(removed);
                await ownerDoc.save();
            };
        } else {
            const qty = Number(ownerDoc.Inventory?.[key] || 0);
            if (qty <= 0) {
                return client.errNormal({ error: 'You do not own this item anymore.', type: 'update', components: [] }, i);
            }

            ownerDoc.Inventory = ownerDoc.Inventory || {};
            if (qty === 1) {
                delete ownerDoc.Inventory[key];
            } else {
                ownerDoc.Inventory[key] = qty - 1;
            }
            await ownerDoc.save();

            rollbackAction = async () => {
                ownerDoc.Inventory = ownerDoc.Inventory || {};
                ownerDoc.Inventory[key] = Number(ownerDoc.Inventory[key] || 0) + 1;
                await ownerDoc.save();
            };
        }

        const result = await client.sellItem(i, user, key, Number(custom.SellPrice || Math.floor(custom.BuyPrice * 0.7)));
        if (!result.ok) {
            if (rollbackAction) await rollbackAction();
            return client.errNormal({ error: `Sale failed: ${result.reason || 'Unknown error'}`, type: 'update', components: [] }, i);
        }

        return client.succNormal({
            text: `✅ You sold ${custom.ItemName}!`,
            fields: [
                { name: '📦┆Item', value: custom.ItemName, inline: true },
                { name: '💰┆Earned', value: `${client.emotes.economy.coins} ${result.amount}`, inline: true }
            ],
            type: 'update',
            components: []
        }, i);
    } catch (error) {
        if (error.code !== 'ERR_INTERACTION_ENDED') {
            console.error('Sell command error:', error);
        }
        return;
    }
};

const Discord = require('discord.js');
const Schema = require('../../database/models/economy');
const itemSchema = require('../../database/models/economyItems');
const store = require('../../database/models/economyStore');
const sellableSchema = require('../../database/models/economySellable');
const cooldownSchema = require('../../database/models/economySellCooldowns');

// SECURITY: Only allow selling from approved list
const APPROVED_SELLABLES = {
    'fishingrod': { price: 80, category: 'item' }
};

module.exports = async (client, interaction) => {
    const user = interaction.user;
    const guild = interaction.guild;
    const member = await guild.members.fetch(user.id).catch(() => null);

    if (!member) {
        return client.errNormal({
            error: `I can't access your member profile!`,
            type: 'editreply'
        }, interaction);
    }

    // Get store items that are sellable
    const storeData = await store.find({ Guild: guild.id });
    const sellableItems = [];

    // Check store roles (sell at 70% of buy price to prevent inflation)
    for (const storeItem of storeData) {
        if (member.roles.cache.has(storeItem.Role)) {
            const sellPrice = Math.floor(storeItem.Amount * 0.70); // 70% resale value
            
            // Verify the role still exists
            const role = guild.roles.cache.get(storeItem.Role);
            if (role && !role.managed) { // Don't allow selling managed roles
                sellableItems.push({
                    id: storeItem.Role,
                    label: `${role.name.slice(0, 24)}`,
                    value: storeItem.Role,
                    sellPrice: sellPrice,
                    buyPrice: storeItem.Amount,
                    type: 'role'
                });
            }
        }
    }

    // Check inventory items
    const inventory = await itemSchema.findOne({ Guild: guild.id, User: user.id });

    // Fishing rod (sell at 80% - valuable item)
    if (inventory?.FishingRod) {
        const sellPrice = APPROVED_SELLABLES.fishingrod.price;
        sellableItems.push({
            id: 'fishingrod',
            label: 'Fishing Rod',
            value: 'fishingrod',
            sellPrice: sellPrice,
            buyPrice: 100,
            type: 'item'
        });
    }

    if (!sellableItems.length) {
        return client.errNormal({
            error: `You don't own any sellable items! Purchase items from the store first using \`/buy\`.`,
            type: 'editreply'
        }, interaction);
    }

    // Create select menu
    const labels = sellableItems.map(item => ({
        label: item.label,
        value: item.value,
        description: `Sell for ${client.emotes.economy.coins} ${item.sellPrice} coins (from ${item.buyPrice})`
    }));

    const select = await client.generateSelect(`economySell`, labels);

    await client.embed({
        title: `💰・Sell Items`,
        desc: `Choose an item to sell. Items sell at 70-80% of purchase price to maintain economy balance.`,
        components: [select],
        type: 'editreply'
    }, interaction);

    const filter = i => i.user.id === user.id;

    try {
        const i = await interaction.channel.awaitMessageComponent({
            filter,
            componentType: Discord.ComponentType.StringSelect,
            time: 60000
        });

        const selectedValue = i.values[0];
        const selectedItem = sellableItems.find(item => item.value === selectedValue);

        if (!selectedItem) {
            return client.errNormal({
                error: `That item is no longer in your inventory!`,
                type: 'update',
                components: []
            }, i);
        }

        // SECURITY: Check cooldown to prevent spam flipping
        const cooldown = await cooldownSchema.findOne({
            Guild: guild.id,
            User: user.id,
            ItemName: selectedValue
        });

        if (cooldown && cooldown.LastSoldAt) {
            const cooldownMs = 3600000; // 1 hour base
            const multiplier = Math.min(cooldown.SellCount, 5); // Escalating cooldown (max 5x)
            const requiredWait = cooldownMs * multiplier;
            const timeSinceLastSell = Date.now() - cooldown.LastSoldAt.getTime();

            if (timeSinceLastSell < requiredWait) {
                const nextAvailable = new Date(cooldown.LastSoldAt.getTime() + requiredWait);
                const timeLeft = Math.ceil((requiredWait - timeSinceLastSell) / 1000 / 60); // minutes
                return client.errNormal({
                    error: `You must wait **${timeLeft} more minutes** before selling this item again.\nCooldown increases with each resale to prevent inflation.`,
                    type: 'update',
                    components: []
                }, i);
            }
        }

        // SECURITY: Handle fishing rod sale
        if (selectedValue === 'fishingrod') {
            const checkInventory = await itemSchema.findOne({ Guild: guild.id, User: user.id });
            if (!checkInventory?.FishingRod) {
                return client.errNormal({
                    error: `You no longer have a fishing rod!`,
                    type: 'update',
                    components: []
                }, i);
            }

            // Remove from inventory
            await itemSchema.updateOne(
                { Guild: guild.id, User: user.id },
                { $set: { FishingRod: false, FishingRodUsage: 0 } }
            );

            // Add money using secure helper
            const result = await client.sellItem(i, user, 'fishingrod', selectedItem.sellPrice);
            
            if (!result.ok) {
                // Restore item if sale failed
                await itemSchema.updateOne(
                    { Guild: guild.id, User: user.id },
                    { $set: { FishingRod: true } }
                );

                return client.errNormal({
                    error: `Sale failed: ${result.reason || 'Unknown error'}`,
                    type: 'update',
                    components: []
                }, i);
            }

            return client.succNormal({
                text: `✅ You sold your **Fishing Rod**!`,
                fields: [
                    { name: `📦┆Item`, value: `Fishing Rod`, inline: true },
                    { name: `💰┆Earned`, value: `${client.emotes.economy.coins} ${result.amount}`, inline: true },
                    { name: `📊┆Resale Rate`, value: `80% of purchase price`, inline: true }
                ],
                type: 'update',
                components: []
            }, i);
        }

        // SECURITY: Handle role sale
        // Re-fetch member to ensure current state
        const freshMember = await guild.members.fetch(user.id).catch(() => null);
        if (!freshMember || !freshMember.roles.cache.has(selectedValue)) {
            return client.errNormal({
                error: `You no longer have that role!`,
                type: 'update',
                components: []
            }, i);
        }

        const targetRole = guild.roles.cache.get(selectedValue);
        if (!targetRole || targetRole.managed) {
            return client.errNormal({
                error: `That role can no longer be sold!`,
                type: 'update',
                components: []
            }, i);
        }

        // Remove role from user
        try {
            await freshMember.roles.remove(selectedValue);
        } catch (error) {
            return client.errNormal({
                error: `I can't remove the role from you! (Check bot permissions)`,
                type: 'update',
                components: []
            }, i);
        }

        // Add money using secure helper
        const result = await client.sellItem(i, user, selectedValue, selectedItem.sellPrice);

        if (!result.ok) {
            // Restore role if sale failed to prevent loss
            try {
                await freshMember.roles.add(selectedValue);
            } catch (_) {}

            return client.errNormal({
                error: `Sale failed: ${result.reason || 'Unknown error'}`,
                type: 'update',
                components: []
            }, i);
        }

        return client.succNormal({
            text: `✅ You sold **${targetRole.name}**!`,
            fields: [
                { name: `🎭┆Role`, value: `${targetRole}`, inline: true },
                { name: `💰┆Earned`, value: `${client.emotes.economy.coins} ${result.amount}`, inline: true },
                { name: `📊┆Resale Rate`, value: `70% of purchase price`, inline: true }
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

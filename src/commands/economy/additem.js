const Discord = require('discord.js');

const store = require('../../database/models/economyStore');
const sellable = require('../../database/models/economySellable');

const normalizeName = (value) => {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40);
};

module.exports = async (client, interaction) => {
    const perms = await client.checkUserPerms({
        flags: [Discord.PermissionsBitField.Flags.ManageMessages],
        perms: [Discord.PermissionsBitField.Flags.ManageMessages]
    }, interaction);

    if (perms === false) return;

    const type = interaction.options.getString('type');
    const role = interaction.options.getRole('role');
    const name = interaction.options.getString('name');
    const buyPriceRaw = interaction.options.getNumber('buyprice');
    const sellPriceRaw = interaction.options.getNumber('sellprice');
    const sellableBack = interaction.options.getBoolean('sellable');
    const maxOwnedRaw = interaction.options.getNumber('maxowned');
    const durationDaysRaw = interaction.options.getNumber('durationdays');
    const stockRaw = interaction.options.getNumber('stock');
    const description = interaction.options.getString('description');

    const buyPrice = Math.floor(Number(buyPriceRaw));
    if (!Number.isInteger(buyPrice) || buyPrice <= 0) {
        return client.errNormal({ error: 'Buy price must be a positive whole number.', type: 'editreply' }, interaction);
    }

    const allowSell = sellableBack ?? true;
    const fallbackSell = Math.max(0, Math.floor(buyPrice * 0.7));
    const sellPrice = allowSell
        ? Math.floor(Number.isFinite(sellPriceRaw) ? sellPriceRaw : fallbackSell)
        : 0;

    if (allowSell && (!Number.isInteger(sellPrice) || sellPrice < 0 || sellPrice >= buyPrice)) {
        return client.errNormal({ error: 'Sell price must be a whole number lower than buy price.', type: 'editreply' }, interaction);
    }

    const maxOwned = Number.isFinite(maxOwnedRaw) ? Math.floor(maxOwnedRaw) : null;
    if (maxOwned !== null && (!Number.isInteger(maxOwned) || maxOwned < 1 || maxOwned > 5000)) {
        return client.errNormal({ error: 'Max owned must be between 1 and 5000.', type: 'editreply' }, interaction);
    }

    const durationDays = Number.isFinite(durationDaysRaw) ? Math.floor(durationDaysRaw) : null;
    if (type === 'subscription' && (durationDays === null || durationDays < 1 || durationDays > 3650)) {
        return client.errNormal({ error: 'Subscription duration must be between 1 and 3650 days.', type: 'editreply' }, interaction);
    }

    const stock = Number.isFinite(stockRaw) ? Math.floor(stockRaw) : null;
    if (stock !== null && (!Number.isInteger(stock) || stock < 1 || stock > 1000000)) {
        return client.errNormal({ error: 'Stock must be between 1 and 1000000.', type: 'editreply' }, interaction);
    }

    let itemName;
    let itemKey;
    let roleId = null;

    if (type === 'role') {
        if (!role) {
            return client.errNormal({ error: 'Role type requires the role option.', type: 'editreply' }, interaction);
        }
        if (role.id === interaction.guild.roles.everyone.id) {
            return client.errNormal({ error: 'You cannot add the @everyone role to the store.', type: 'editreply' }, interaction);
        }

        itemName = role.name;
        roleId = role.id;
        itemKey = `role_${role.id}`;

        await store.updateOne(
            { Guild: interaction.guild.id, Role: role.id },
            { $set: { Guild: interaction.guild.id, Role: role.id, Amount: buyPrice } },
            { upsert: true }
        );
    } else {
        if (!name || name.trim().length < 2) {
            return client.errNormal({ error: 'Non-role items require a name with at least 2 characters.', type: 'editreply' }, interaction);
        }

        itemName = name.trim().slice(0, 64);
        const slug = normalizeName(itemName);
        if (!slug) {
            return client.errNormal({ error: 'Unable to build a valid item key from that name.', type: 'editreply' }, interaction);
        }

        itemKey = `${type}_${slug}`;
    }

    await sellable.updateOne(
        { Guild: interaction.guild.id, Key: itemKey },
        {
            $set: {
                Guild: interaction.guild.id,
                Key: itemKey,
                ItemName: itemName,
                Role: roleId,
                BuyPrice: buyPrice,
                SellPrice: sellPrice,
                Sellable: allowSell,
                MaxOwned: maxOwned,
                DurationDays: type === 'subscription' ? durationDays : null,
                Stock: stock,
                Description: description ? description.slice(0, 250) : null,
                Category: type
            }
        },
        { upsert: true }
    );

    return client.succNormal({
        text: 'Store item saved successfully.',
        fields: [
            { name: '🏷️┆Type', value: type, inline: true },
            { name: '📘┆Name', value: type === 'role' ? `<@&${roleId}>` : itemName, inline: true },
            { name: '🆔┆Key', value: itemKey, inline: false },
            { name: `${client.emotes.economy.coins}┆Buy`, value: `${buyPrice}`, inline: true },
            { name: `${client.emotes.economy.coins}┆Sell`, value: allowSell ? `${sellPrice}` : 'Disabled', inline: true },
            { name: '📦┆Max Owned', value: maxOwned === null ? 'Unlimited' : `${maxOwned}`, inline: true },
            { name: '📉┆Stock', value: stock === null ? 'Unlimited' : `${stock}`, inline: true },
            { name: '⏳┆Duration', value: type === 'subscription' ? `${durationDays} day(s)` : 'N/A', inline: true }
        ],
        type: 'editreply'
    }, interaction);
};

 
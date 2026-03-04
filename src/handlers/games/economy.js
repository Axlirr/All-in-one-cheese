const Schema = require('../../database/models/economy');
const itemSchema = require('../../database/models/economyItems');

module.exports = async (client) => {
    client.getEconomyProfile = async function (interaction, userId) {
        let profile = await Schema.findOne({ Guild: interaction.guild.id, User: userId });
        if (!profile) {
            profile = await Schema.create({
                Guild: interaction.guild.id,
                User: userId,
                Money: 0,
                Bank: 0,
            });
        }
        return profile;
    }

    client.addMoney = async function (interaction, user, amount) {
        const safeAmount = Math.max(0, Number(amount) || 0);
        if (!safeAmount) return false;

        await Schema.updateOne(
            { Guild: interaction.guild.id, User: user.id },
            {
                $setOnInsert: { Guild: interaction.guild.id, User: user.id, Bank: 0 },
                $inc: { Money: safeAmount }
            },
            { upsert: true }
        );

        return true;
    }

    client.removeMoney = async function (interaction, user, amount) {
        const safeAmount = Math.max(0, Number(amount) || 0);
        if (!safeAmount) return false;

        const updated = await Schema.findOneAndUpdate(
            { Guild: interaction.guild.id, User: user.id, Money: { $gte: safeAmount } },
            { $inc: { Money: -safeAmount } },
            { new: true }
        );

        return Boolean(updated);
    }

    client.transferMoney = async function (interaction, fromUser, toUser, amount) {
        const safeAmount = Math.max(0, Number(amount) || 0);
        if (!safeAmount) return { ok: false, reason: 'invalid_amount' };

        const removed = await client.removeMoney(interaction, fromUser, safeAmount);
        if (!removed) return { ok: false, reason: 'insufficient_funds' };

        await client.addMoney(interaction, toUser, safeAmount);
        return { ok: true };
    }

    client.buyItem = async function (interaction, user, item) {
        if (item === 'FishingRod') {
            await itemSchema.updateOne(
                { Guild: interaction.guild.id, User: user.id },
                {
                    $setOnInsert: { Guild: interaction.guild.id, User: user.id },
                    $set: { FishingRod: true }
                },
                { upsert: true }
            );
        }
    }
}

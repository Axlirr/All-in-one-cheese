const Schema = require('../../database/models/economy');
const itemSchema = require('../../database/models/economyItems');
const transactionSchema = require('../../database/models/economyTransactions');
const cooldownSchema = require('../../database/models/economySellCooldowns');
const sellableSchema = require('../../database/models/economySellable');

// SECURITY: Anti-bypass and inflation control
const MAX_TRANSACTION = 1000000; // Max per transaction
const INFLATION_CHECK_PERIOD = 86400000; // 24 hours
const MAX_DAILY_EARNINGS = 5000000; // Per user per day

module.exports = async (client) => {
    // Infrastructure: Track all transactions for monitoring
    const logTransaction = async (guild, user, type, amount, itemName, balanceBefore) => {
        const balanceAfter = balanceBefore + (type === 'sell' || type === 'earn' ? amount : -amount);
        await transactionSchema.create({
            Guild: guild,
            User: user,
            TransactionType: type,
            Amount: amount,
            ItemName: itemName,
            BalanceBefore: balanceBefore,
            BalanceAfter: balanceAfter
        });
    };

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
    };

    // SECURITY: Validate amount before transaction
    client.validateAmount = async function (amount) {
        const safeAmount = Math.max(0, Number(amount) || 0);
        if (safeAmount > MAX_TRANSACTION) return false;
        if (!Number.isInteger(safeAmount)) return false;
        return safeAmount;
    };

    // SECURITY: Check inflation in last 24 hours
    client.checkInflation = async function (guildId) {
        const oneDayAgo = new Date(Date.now() - INFLATION_CHECK_PERIOD);
        const earnings = await transactionSchema.aggregate([
            { $match: { Guild: guildId, Timestamp: { $gte: oneDayAgo }, TransactionType: { $in: ['earn', 'beg', 'work', 'fish'] } } },
            { $group: { _id: null, total: { $sum: '$Amount' } } }
        ]);
        
        const totalEarned = earnings[0]?.total || 0;
        return { ratio: totalEarned / (MAX_DAILY_EARNINGS * 10), healthy: totalEarned < (MAX_DAILY_EARNINGS * 10) };
    };

    client.addMoney = async function (interaction, user, amount) {
        const safeAmount = await client.validateAmount(amount);
        if (!safeAmount) return false;

        const profile = await Schema.findOne({ Guild: interaction.guild.id, User: user.id });
        const balanceBefore = profile?.Money || 0;

        const updated = await Schema.findOneAndUpdate(
            { Guild: interaction.guild.id, User: user.id },
            {
                $setOnInsert: { Guild: interaction.guild.id, User: user.id, Bank: 0 },
                $inc: { Money: safeAmount }
            },
            { upsert: true, new: true }
        );

        // Log transaction for monitoring
        await logTransaction(interaction.guild.id, user.id, 'earn', safeAmount, 'general', balanceBefore);

        return true;
    };

    client.removeMoney = async function (interaction, user, amount) {
        const safeAmount = await client.validateAmount(amount);
        if (!safeAmount) return false;

        const profile = await Schema.findOne({ Guild: interaction.guild.id, User: user.id });
        const balanceBefore = profile?.Money || 0;

        const updated = await Schema.findOneAndUpdate(
            { Guild: interaction.guild.id, User: user.id, Money: { $gte: safeAmount } },
            { $inc: { Money: -safeAmount } },
            { new: true }
        );

        if (updated) {
            await logTransaction(interaction.guild.id, user.id, 'spend', safeAmount, 'general', balanceBefore);
        }

        return Boolean(updated);
    };

    client.transferMoney = async function (interaction, fromUser, toUser, amount) {
        const safeAmount = await client.validateAmount(amount);
        if (!safeAmount) return { ok: false, reason: 'invalid_amount' };

        const removed = await client.removeMoney(interaction, fromUser, safeAmount);
        if (!removed) return { ok: false, reason: 'insufficient_funds' };

        await client.addMoney(interaction, toUser, safeAmount);
        return { ok: true };
    };

    // NEW: Secure sell mechanism with inflation prevention
    client.sellItem = async function (interaction, user, itemId, sellPrice) {
        const safePrice = await client.validateAmount(sellPrice);
        if (!safePrice) return { ok: false, reason: 'invalid_price' };

        // Check cooldown (prevent spam selling)
        const cooldown = await cooldownSchema.findOne({ 
            Guild: interaction.guild.id, 
            User: user.id, 
            ItemName: itemId 
        });

        if (cooldown && cooldown.LastSoldAt) {
            const cooldownMs = 3600000; // 1 hour per sell
            const timeSinceLastSell = Date.now() - cooldown.LastSoldAt.getTime();
            if (timeSinceLastSell < cooldownMs * cooldown.SellCount) {
                return { ok: false, reason: 'cooldown', nextAvailable: new Date(cooldown.LastSoldAt.getTime() + (cooldownMs * cooldown.SellCount)) };
            }
        }

        // Add money
        const profile = await Schema.findOne({ Guild: interaction.guild.id, User: user.id });
        const balanceBefore = profile?.Money || 0;

        await Schema.findOneAndUpdate(
            { Guild: interaction.guild.id, User: user.id },
            {
                $setOnInsert: { Guild: interaction.guild.id, User: user.id, Bank: 0 },
                $inc: { Money: safePrice }
            },
            { upsert: true }
        );

        // Log transaction
        await logTransaction(interaction.guild.id, user.id, 'sell', safePrice, itemId, balanceBefore);

        // Update cooldown
        await cooldownSchema.updateOne(
            { Guild: interaction.guild.id, User: user.id, ItemName: itemId },
            {
                $set: { LastSoldAt: new Date() },
                $inc: { SellCount: 1 }
            },
            { upsert: true }
        );

        return { ok: true, amount: safePrice };
    };

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
    };
};

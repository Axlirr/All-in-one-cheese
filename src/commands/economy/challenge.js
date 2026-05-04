const Discord = require('discord.js');
const Schema = require('../../database/models/economy');
const timeoutSchema = require('../../database/models/economyTimeout');

// Daily challenges that rotate
const DAILY_CHALLENGES = [
    { name: 'Lucky Day', description: 'Get a critical hit in casino games', reward: 500 },
    { name: 'Fisherman\'s Luck', description: 'Catch 3 times in a row without rest', reward: 300 },
    { name: 'Hard Worker', description: 'Complete 5 work activities', reward: 750 },
    { name: 'Street Smart', description: 'Earn 1000 coins through begging', reward: 200 },
    { name: 'Trader', description: 'Sell 2 items', reward: 400 },
    { name: 'Bank Saver', description: 'Deposit 5000 coins in bank', reward: 600 },
];

function getDailyChallenge() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
}

module.exports = async (client, interaction, args) => {
    const user = interaction.user;
    const guild = interaction.guild;
    const challenge = getDailyChallenge();

    const embed = new Discord.EmbedBuilder()
        .setTitle('🎯 Daily Challenge')
        .setColor('GOLD')
        .setDescription(`Complete today's challenge to earn bonus coins!`)
        .addFields(
            { name: '📋 Challenge', value: challenge.name, inline: false },
            { name: '📝 Description', value: challenge.description, inline: false },
            { name: '🎁 Reward', value: `${client.emotes.economy.coins} ${challenge.reward} cheese coins`, inline: false },
            { name: '⏰ Resets', value: 'Daily at midnight UTC', inline: false }
        )
        .setFooter({ text: 'Complete challenges to stay active and engaged!' });

    return client.embed(embed, { type: 'editreply' }, interaction);
};

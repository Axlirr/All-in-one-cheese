const Schema = require("../../database/models/economy");
const Schema2 = require("../../database/models/economyTimeout");
const itemSchema = require("../../database/models/economyItems");

module.exports = async (client, interaction, args) => {

    const rand = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    const user = interaction.user;

    const timeout = 60000;
    const fish = [
        { name: 'Tasty Tuna', emoji: '🐟', value: 20 },
        { name: 'Salmon Surprise', emoji: '🍣', value: 25 },
        { name: 'Sardine Snack', emoji: '🐠', value: 10 },
        { name: 'Golden Goldfish', emoji: '✨🐠', value: 75 },
        { name: 'Chunky Mackerel', emoji: '🐟', value: 18 },
        { name: 'Fancy Shrimp', emoji: '🦐', value: 30 },
        { name: 'Legendary Koi', emoji: '🎏', value: 150 },
        { name: 'Old Boot', emoji: '👢', value: 2 },
        { name: 'Cheese Float', emoji: '🧀', value: 40 },
        { name: 'Big Trout', emoji: '🐡', value: 35 },
        { name: 'Clam with Pearl', emoji: '🦪', value: 60 },
        { name: 'Seaweed Snack', emoji: '🥬', value: 8 }
    ];

    const randn = rand(0, fish.length);
    const randrod = rand(15, 30);
    const caught = fish[randn];

    const userItems = await itemSchema.findOne({ Guild: interaction.guild.id, User: user.id });

    if (!userItems || userItems.FishingRod == false) return client.errNormal({ error: "You have to buy a fishing rod!", type: 'editreply' }, interaction);

    if (userItems.FishingRodUsage >= randrod) {
        userItems.FishingRod = false;
        await userItems.save();
        return client.errNormal({ error: "Your fishing rod has broken! Go buy a new one!", type: 'editreply' }, interaction);
    }

    const dataTime = await Schema2.findOne({ Guild: interaction.guild.id, User: user.id });
    const lastFish = Number(dataTime?.Fish || 0);

    if (lastFish && timeout - (Date.now() - lastFish) > 0) {
        const time = (lastFish / 1000 + timeout / 1000).toFixed(0);
        return client.errWait({ time: time, type: 'editreply' }, interaction);
    }

    client.succNormal({
        text: `🎣 **Splash!** You cast your line and reeled something in!`,
        fields: [
            {
                name: `${caught.emoji}┆Caught`,
                value: `${caught.name}`,
                inline: true
            },
            {
                name: `🧀┆Cheese Coins`,
                value: `+${caught.value} cheese coins`,
                inline: true
            }
        ],
        type: 'editreply'
    }, interaction);

    await client.addMoney(interaction, user, caught.value);

    userItems.FishingRodUsage += 1;
    await userItems.save();

    await Schema2.updateOne(
        { Guild: interaction.guild.id, User: user.id },
        {
            $setOnInsert: { Guild: interaction.guild.id, User: user.id },
            $set: { Fish: Date.now() }
        },
        { upsert: true }
    );
}


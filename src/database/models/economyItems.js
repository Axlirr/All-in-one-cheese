const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    User: String,
    FishingRod: { type: Boolean, default: false },
    FishingRodUsage: { type: Number, default: 0 },
    Inventory: { type: mongoose.Schema.Types.Mixed, default: {} },
    Subscriptions: {
        type: [{ Key: String, ItemName: String, ExpiresAt: Date }],
        default: []
    },
});

Schema.index({ Guild: 1, User: 1 });

module.exports = mongoose.model("economyItems", Schema);
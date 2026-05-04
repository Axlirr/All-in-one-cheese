const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    Key: String,
    ItemName: String,
    Role: String,
    BuyPrice: Number,
    SellPrice: Number, // Usually below BuyPrice to prevent inflation
    Sellable: { type: Boolean, default: true },
    MaxOwned: { type: Number, default: null }, // null = unlimited
    DurationDays: { type: Number, default: null }, // for subscriptions
    Stock: { type: Number, default: null }, // null = unlimited
    Description: String,
    Category: String, // 'role', 'item', 'subscription', 'cosmetic'
    CreatedAt: { type: Date, default: Date.now }
});

Schema.index({ Guild: 1, Key: 1 });
Schema.index({ Guild: 1, Category: 1 });

module.exports = mongoose.model("economySellable", Schema);

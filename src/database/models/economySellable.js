const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    ItemName: String,
    BuyPrice: Number,
    SellPrice: Number, // Usually 60-80% of buy price to prevent inflation
    Sellable: { type: Boolean, default: true },
    MaxOwned: { type: Number, default: null }, // null = unlimited
    Description: String,
    Category: String, // 'role', 'item', 'subscription', 'cosmetic'
    CreatedAt: { type: Date, default: Date.now }
});

Schema.index({ Guild: 1, ItemName: 1 });

module.exports = mongoose.model("economyItems", Schema);

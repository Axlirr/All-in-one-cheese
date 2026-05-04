const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    User: String,
    ItemName: String,
    LastSoldAt: Date,
    SellCount: { type: Number, default: 0 }
});

Schema.index({ Guild: 1, User: 1, ItemName: 1 });

module.exports = mongoose.model("economySellCooldowns", Schema);

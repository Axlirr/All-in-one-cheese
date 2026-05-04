const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    Name: String,
    Description: String,
    Roles: [String], // Role IDs that grant this tier
    Perks: [String], // Description of perks
    Duration: Number, // in milliseconds, null = permanent
    Price: Number,
    Resellable: { type: Boolean, default: false },
    ResellPrice: Number,
    CreatedAt: { type: Date, default: Date.now }
});

Schema.index({ Guild: 1, Name: 1 });

module.exports = mongoose.model("economySubscriptions", Schema);

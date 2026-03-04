const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: { type: String, index: true },
    Channel: String,
    Variant: { type: String, default: 'world' }, // world | tech | finance | happy
    Enabled: { type: Boolean, default: true },
    IntervalMins: { type: Number, default: 15 },
    LastRunAt: Number,
    LastPostedAt: Number,
    SeenLinks: { type: [String], default: [] },
});

module.exports = mongoose.model('worldNewsConfig', Schema);

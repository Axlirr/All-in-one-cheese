const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    User: String,
    Beg: { type: Number, default: 0 },
    Crime: { type: Number, default: 0 },
    Daily: { type: Number, default: 0 },
    Weekly: { type: Number, default: 0 },
    Monthly: { type: Number, default: 0 },
    Hourly: { type: Number, default: 0 },
    Work: { type: Number, default: 0 },
    Rob: { type: Number, default: 0 },
    Fish: { type: Number, default: 0 },
    Hunt: { type: Number, default: 0 },
    Yearly: { type: Number, default: 0 },
    Present: { type: Number, default: 0 },
    Nap: { type: Number, default: 0 },
    Pounce: { type: Number, default: 0 }
});

module.exports = mongoose.model('economytimeout', Schema);

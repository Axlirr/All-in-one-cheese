const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    Role: String,
    Amount: Number
});

Schema.index({ Guild: 1 });

module.exports = mongoose.model("economyStore", Schema);
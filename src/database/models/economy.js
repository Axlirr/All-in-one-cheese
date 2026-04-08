const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    User: String,
    Money: Number,
    Bank: Number
});

Schema.index({ Guild: 1, User: 1 });

module.exports = mongoose.model("economy", Schema);
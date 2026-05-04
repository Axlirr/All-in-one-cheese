const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    User: String,
    TransactionType: String, // 'buy', 'sell', 'earn', 'spend', 'transfer'
    Amount: Number,
    ItemName: String,
    Timestamp: { type: Date, default: Date.now },
    BalanceBefore: Number,
    BalanceAfter: Number
});

Schema.index({ Guild: 1, User: 1, Timestamp: -1 });
Schema.index({ Guild: 1, Timestamp: -1 }); // For checking inflation

module.exports = mongoose.model("economyTransactions", Schema);

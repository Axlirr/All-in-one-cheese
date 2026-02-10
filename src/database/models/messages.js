const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    User: String,
    Messages: Number,
    DailyMessages: Number,
    WeeklyMessages: Number,
    MonthlyMessages: Number,
    YearlyMessages: Number,
    LastDaily: String,
    LastWeekly: String,
    LastMonthly: String,
    LastYearly: String,
});

module.exports = mongoose.model("messages", Schema);
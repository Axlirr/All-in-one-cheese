const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    By: String,
    Score: Number,
    Note: String,
    Date: Number,
}, { _id: false });

const ModeratorPerformanceSchema = new mongoose.Schema({
    Guild: String,
    Moderator: String,
    TotalActions: { type: Number, default: 0 },
    SuccessfulActions: { type: Number, default: 0 },
    FailedActions: { type: Number, default: 0 },
    TotalResponseMs: { type: Number, default: 0 },
    AvgResponseMs: { type: Number, default: 0 },
    ActionsByType: { type: Object, default: {} },
    LastActionAt: Number,

    RatingCount: { type: Number, default: 0 },
    RatingTotal: { type: Number, default: 0 },
    RatingAvg: { type: Number, default: 0 },
    Ratings: [RatingSchema],
});

module.exports = mongoose.model('moderatorPerformance', ModeratorPerformanceSchema);

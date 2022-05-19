const mongoose = require('mongoose');

const bnpl_blacklistSchema = new mongoose.Schema({

    phone: {
        type: String,
    },
    attempts: {
        type: Number,
        required: true,
        default: 0,
        max: 5,
        min: 0
    },
    lockUntil: {
        type: Number
    },

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('bnpl_blacklist', bnpl_blacklistSchema);
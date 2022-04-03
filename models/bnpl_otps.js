const mongoose = require('mongoose');

const bnpl_otpSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: [true, 'Phone is required'],
    },
    otp: {
        type: String,
        required: [true, 'Otp is required'],
    },
    nid: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 60 }
    }
    // After 1 minutes it deleted automatically from the database
}, { timestamps: true });

module.exports = mongoose.model('bnpl_otp', bnpl_otpSchema);
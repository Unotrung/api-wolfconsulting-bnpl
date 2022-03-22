const mongoose = require('mongoose');

const bnpl_otpsSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        minlength: [10, 'Phone only includes 10 numbers'],
        maxlength: [10, 'Phone only includes 10 numbers']
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
        index: { expires: 300 }
    }
    // After 5 minutes it deleted automatically from the database
}, { timestamps: true });

module.exports = mongoose.model('bnpl_otps', bnpl_otpsSchema);
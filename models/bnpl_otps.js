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
    expiredAt: {
        type: Date
    }

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('bnpl_otp', bnpl_otpSchema);
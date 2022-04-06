const mongoose = require('mongoose');

const encrypt = require('mongoose-encryption')
const dotenv = require('dotenv')
dotenv.config()

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
bnpl_otpSchema.plugin(encrypt, { encryptionKey: process.env.encKey, signingKey: process.env.sigKey })
module.exports = mongoose.model('bnpl_otp', bnpl_otpSchema);

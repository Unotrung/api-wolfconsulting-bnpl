const mongoose = require('mongoose');

const bnpl_customerSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: [true, 'Phone is required'],
        unique: [true, 'Phone is already exists'],
    },
    pin: {
        type: String,
        required: [true, 'Pin is required'],
    },
    step: {
        type: Number,
    }

}, { timestamps: true });

module.exports = mongoose.model('bnpl_customer', bnpl_customerSchema);
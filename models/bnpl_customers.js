const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const dotenv = require('dotenv');
const mongooseDelete = require('mongoose-delete');

dotenv.config();

const bnpl_customerSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: [true, 'Phone is required'],
    },
    pin: {
        type: String,
        required: [true, 'Pin is required'],
    },
    step: {
        type: Number,
    }

}, { timestamps: true });

const secret = process.env.SECRET_MONGOOSE;
bnpl_customerSchema.plugin(encrypt, { secret: secret, encryptedFields: ['phone', 'pin'] });

// Add plugin
bnpl_customerSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' }); // Soft Delete

module.exports = mongoose.model('bnpl_customer', bnpl_customerSchema);
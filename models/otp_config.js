const mongoose = require('mongoose');

const otpConfigSchema = new mongoose.Schema({

    config: {
        type: String,
        required: [true, 'config is required'],
        enum: {
            values: ['SMS', 'EMAIL'],
            message: 'Config is only allowed SMS or EMAIL'
        }
    },

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('otpConfig', otpConfigSchema);

const mongoose = require('mongoose');

const bnpl_providerSchema = new mongoose.Schema({

    provider: {
        type: String,
        required: [true, 'Provider is required']
    },

}, { timestamps: true });

module.exports = mongoose.model('bnpl_provider', bnpl_providerSchema);
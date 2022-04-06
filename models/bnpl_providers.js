const mongoose = require('mongoose');

const encrypt = require('mongoose-encryption')
const dotenv = require('dotenv')
dotenv.config()


const bnpl_providerSchema = new mongoose.Schema({

    provider: {
        type: String
    },
    url: {
        type: String
    }

}, { timestamps: true });
bnpl_providerSchema.plugin(encrypt, { encryptionKey: process.env.encKey, signingKey: process.env.sigKey })
module.exports = mongoose.model('bnpl_provider', bnpl_providerSchema);

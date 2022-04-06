const mongoose = require('mongoose');
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;
const encrypt = require('mongoose-encryption')
const dotenv = require('dotenv')
dotenv.config()
const bnpl_customerSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: [true, 'Phone is required'],
        // unique: [true, 'Phone is already exists'],
        validate: {
            validator: function (value) {
                return /^(09|03|07|08|05)+([0-9]{8}$)/g.test(value);
            },
            message: props => `${props.value} is not a valid phone number !`
        }
    },
    pin: {
        type: String,
        required: [true, 'Pin is required'],
    },
    step: {
        type: String,
    }

}, { timestamps: true });

// bnpl_customerSchema.plugin(mongooseFieldEncryption, {
//     fields: ["phone"],
//     secret: process.env.encKey,
//     saltGenerator: function (secret) {
//         return "1234567890123456";
//         // should ideally use the secret to return a string of length 16,
//         // default = `const defaultSaltGenerator = secret => crypto.randomBytes(16);`,
//         // see options for more details
//     },
// })
bnpl_customerSchema.plugin(encrypt, { encryptionKey: process.env.encKey, signingKey: process.env.sigKey })

module.exports = mongoose.model('bnpl_customer', bnpl_customerSchema);

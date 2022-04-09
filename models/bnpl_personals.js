const mongoose = require('mongoose');
const item = require('./items');
const tenor = require('./tenors');
const bnpl_provider = require('./bnpl_providers');
const encrypt = require('mongoose-encryption');
const dotenv = require('dotenv')

dotenv.config();

const bnpl_personalSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    sex: {
        type: String,
        required: [true, 'Sex is required'],
        enum: {
            values: ['Nam', 'Nữ'],
            message: 'Sex is only allowed Nam or Nữ'
        }
    },
    birthday: {
        type: Date,
        required: [true, 'Birthday is required'],
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
    },
    citizenId: {
        type: String,
        required: [true, 'CitizenId is required'],
    },
    issueDate: {
        type: Date,
        required: [true, 'Issue Date is required'],
    },
    city: {
        type: String,
        required: [true, 'City is required'],
    },
    district: {
        type: String,
        required: [true, 'District is required'],
    },
    ward: {
        type: String,
        required: [true, 'Ward is required'],
    },
    street: {
        type: String
    },
    personal_title_ref: {
        type: String,
        enum: {
            values: ['Ông', 'Bà'],
            message: 'Personal title ref is only allowed Ông or Bà'
        }
    },
    name_ref: {
        type: String,
    },
    phone_ref: {
        type: String,
        required: [true, 'Phone Ref is required'],
    },
    providers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'bnpl_provider' }],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'item' }],
    tenor: { type: mongoose.Schema.Types.ObjectId, ref: 'tenor' },
    credit_limit: {
        type: Number,
    },

}, { timestamps: true });

const secret = process.env.SECRET_MONGOOSE;
bnpl_personalSchema.plugin(encrypt, { secret: secret, encryptedFields: ['name', 'phone', 'citizenId', 'name_ref', 'phone_ref'] });

module.exports = mongoose.model('bnpl_personal', bnpl_personalSchema);
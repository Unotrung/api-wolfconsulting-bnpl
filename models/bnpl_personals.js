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
        required: [true, 'Personal Title Ref is required'],
    },
    name_ref: {
        type: String,
        required: [true, 'Name Ref is required'],
    },
    phone_ref: {
        type: String,
        required: [true, 'Phone Ref is required'],
    },
    status: {
        type: Boolean,
        default: false
    },
    providers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'bnpl_provider' }],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'item' }],
    tenor: { type: mongoose.Schema.Types.ObjectId, ref: 'tenor' },
    credit_limit: {
        type: Number,
    },
    consumed_limit: {
        type: Number,
    },
    approve_limit: {
        type: Number,
    },
    memo_debit: {
        type: Number,
    },
    memo_credit: {
        type: Number,
    },

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

const secret = process.env.SECRET_MONGOOSE;
bnpl_personalSchema.plugin(encrypt, { secret: secret, encryptedFields: ['name', 'phone', 'citizenId', 'name_ref', 'phone_ref'] });

module.exports = mongoose.model('bnpl_personal', bnpl_personalSchema);
const mongoose = require('mongoose');
const item = require('./items');
const tenor = require('./tenors');
const bnpl_provider = require('./bnpl_providers');

const bnpl_personalSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    sex: {
        type: String,
        required: [true, 'Sex is required'],
    },
    birthday: {
        type: Date,
        required: [true, 'Birthday is required'],
    },
    phone: {
        type: String,
        unique: [true, 'Phone is already exists'],
        required: [true, 'Phone is required'],
    },
    citizenId: {
        type: String,
        unique: [true, 'CitizenId is already exists'],
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
        type: String,
        required: [true, 'Street is required'],
    },
    personal_title_ref: {
        type: String,
    },
    name_ref: {
        type: String,
    },
    phone_ref: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.String,
        ref: "bnpl_customer"
    },
    providers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'bnpl_provider' }],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'item' }],
    tenor: { type: mongoose.Schema.Types.ObjectId, ref: 'tenor' },
    credit_limit: {
        type: Number,
        default: 10000000
    },

}, { timestamps: true });

module.exports = mongoose.model('bnpl_personal', bnpl_personalSchema);
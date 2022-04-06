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
        unique: [true, 'Phone is already exists'],
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
        unique: [true, 'Phone Ref is already exists'],
    },
    providers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'bnpl_provider' }],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'item' }],
    tenor: { type: mongoose.Schema.Types.ObjectId, ref: 'tenor' },
    credit_limit: {
        type: Number,
    },

}, { timestamps: true });

module.exports = mongoose.model('bnpl_personal', bnpl_personalSchema);
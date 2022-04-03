const mongoose = require('mongoose');
const item = require('./items');
const tenor = require('./tenors');
const bnpl_provider = require('./bnpl_providers');

const bnpl_personalSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Name is required'],
        minlength: [1, 'Name have a minimum length is 1 and a maximum length is 255'],
        maxlength: [255, 'Name have a minimum length is 1 and a maximum length is 255']
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
        validate: {
            validator: function (value) {
                return /^(09|03|07|08|05)+([0-9]{8}$)/g.test(value);
            },
            message: props => `${props.value} is not a valid phone number !`
        }
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
        minlength: [1, 'City have a minimum length is 1 and a maximum length is 64'],
        maxlength: [64, 'City have a minimum length is 1 and a maximum length is 64']
    },
    district: {
        type: String,
        required: [true, 'District is required'],
        minlength: [1, 'District have a minimum length is 1 and a maximum length is 64'],
        maxlength: [64, 'District have a minimum length is 1 and a maximum length is 64']
    },
    ward: {
        type: String,
        required: [true, 'Ward is required'],
        minlength: [1, 'Ward have a minimum length is 1 and a maximum length is 64'],
        maxlength: [64, 'Ward have a minimum length is 1 and a maximum length is 64']
    },
    street: {
        type: String,
        required: [true, 'Street is required'],
        minlength: [1, 'Street have a minimum length is 1 and a maximum length is 64'],
        maxlength: [64, 'Street have a minimum length is 1 and a maximum length is 64']
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
        minlength: [1, 'Name Ref have a minimum length is 1 and a maximum length is 255'],
        maxlength: [255, 'Name Ref have a minimum length is 1 and a maximum length is 255']
    },
    phone_ref: {
        type: String,
        required: [true, 'Phone Ref is required'],
        unique: [true, 'Phone Ref is already exists'],
        validate: {
            validator: function (value) {
                return /^(09|03|07|08|05)+([0-9]{8}$)/g.test(value);
            },
            message: props => `${props.value} is not a valid phone number !`
        }
    },
    providers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'bnpl_provider' }],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'item' }],
    tenor: { type: mongoose.Schema.Types.ObjectId, ref: 'tenor' },
    credit_limit: {
        type: Number,
    },

}, { timestamps: true });

module.exports = mongoose.model('bnpl_personal', bnpl_personalSchema);
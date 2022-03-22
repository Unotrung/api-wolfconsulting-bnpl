const mongoose = require('mongoose');

const bnpl_personalsSchema = new mongoose.Schema({
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
    }
}, { timestamps: true });

module.exports = mongoose.model('bnpl_personals', bnpl_personalsSchema);
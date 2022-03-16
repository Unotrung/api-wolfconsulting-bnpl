const mongoose = require('mongoose');

const personalSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Fullname is required'],
    },
    gender: {
        type: Boolean,
        required: [true, 'Gender is required'],
    },
    dob: {
        type: Date,
        required: [true, 'Date of birth is required'],
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
    },
    nid: {
        type: String,
        required: [true, 'Nid is required'],
    },
    dateCreated: {
        type: Date,
        required: [true, 'Date Created is required'],
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
    },
    nickname: {
        type: String,
    },
    relatedName: {
        type: String,
    },
    relatedPhone: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Personal', personalSchema);
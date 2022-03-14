const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        unique: [true, 'Phone is already exists'],
        minlength: [10, 'Phone only includes 10 numbers'],
        maxlength: [10, 'Phone only includes 10 numbers']
    },
    pin: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
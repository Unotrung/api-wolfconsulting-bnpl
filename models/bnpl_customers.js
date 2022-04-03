const mongoose = require('mongoose');

const bnpl_customerSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: [true, 'Phone is required'],
        unique: [true, 'Phone is already exists'],
        minlength: [10, 'Phone only includes 10 numbers'],
        maxlength: [10, 'Phone only includes 10 numbers'],
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
        minlength: [4, 'Pin only includes 4 numbers'],
        maxlength: [4, 'Pin only includes 4 numbers'],
        min: [0, 'Pin only between 0000 and 9999'],
        max: [9999, 'Pin only between 0000 and 9999'],
        validate: {
            validator: function (value) {
                return /^\d{4}$/g.test(value);
            },
            message: props => `${props.value} is not a valid pin !`
        }
    },
    step: {
        type: String,
    }

}, { timestamps: true });

module.exports = mongoose.model('bnpl_customer', bnpl_customerSchema);
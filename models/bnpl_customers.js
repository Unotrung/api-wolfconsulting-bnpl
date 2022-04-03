const mongoose = require('mongoose');

const bnpl_customerSchema = new mongoose.Schema({

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
    pin: {
        type: String,
        required: [true, 'Pin is required'],
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
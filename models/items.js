const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({

    name: {
        type: String,
    },
    price: {
        type: Number,
    },
    shipFee: {
        type: Number,
    },
    image: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('item', itemSchema);
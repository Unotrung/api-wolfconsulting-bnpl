const mongoose = require('mongoose');

const tenorSchema = new mongoose.Schema({

    convertFee: {
        type: Number,
        min: 1,
        max: 100
    },
    paymentSchedule: {
        type: Number
    }

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('tenor', tenorSchema);
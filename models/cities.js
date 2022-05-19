const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({

    Value: {
        type: String
    },
    UI_Show: {
        type: String
    }

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('city', citySchema);
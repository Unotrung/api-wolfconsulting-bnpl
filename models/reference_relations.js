const mongoose = require('mongoose');

const reference_relationSchema = new mongoose.Schema({

    Value: {
        type: String
    },
    Text: {
        type: String
    }

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('reference_relation', reference_relationSchema);
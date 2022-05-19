const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({

    Value: {
        type: String
    },
    UI_Show: {
        type: String
    },
    Parent_Value: {
        type: String
    }

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('district', districtSchema);
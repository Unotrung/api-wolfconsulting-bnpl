const Personal = require('../models/Personal');
const jwt = require('jsonwebtoken');

const PersonalController = {

    register: async (req, res, next) => {
        try {
            let fullname = req.body.fullname;
            let gender = req.body.gender;
            let dob = req.body.dob;
            let phone = req.body.phone;
            let nid = req.body.nid;
            let dateCreated = req.body.dateCreated;
            let address = req.body.address;
            let nickname = req.body.nickname;
            let relatedName = req.body.relatedName;
            let relatedPhone = req.body.relatedPhone;
            let user = req.body.id;
            if (fullname !== null && gender !== null && dob !== null && phone !== null
                && nid !== null && dateCreated !== null && address !== null && nickname !== null
                && relatedName !== null && relatedPhone !== null && user !== null) {
                const personal = await new Personal({ fullname: fullname, gender: gender, dob: dob, phone: phone, nid: nid, dateCreated: dateCreated, address: address, nickname: nickname, relatedName: relatedName, relatedPhone: relatedPhone, user: user });
                const result = await personal.save();
                return res.status(200).json({
                    data: result,
                    status: true
                });
            }
        }
        catch (err) {
            return res.status(500).json({
                err: err,
                status: false
            });
        }
    },

};

module.exports = PersonalController;
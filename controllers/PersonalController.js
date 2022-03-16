const Personal = require('../models/Personal');

const PersonalController = {

    register: async (req, res, next) => {
        try {
            let name = req.body.name;
            let sex = req.body.sex;
            let birthday = req.body.birthday;
            let phone = req.body.phone;
            let citizenId = req.body.citizenId;
            let issueDate = req.body.issueDate;

            let city = req.body.city;
            let district = req.body.district;
            let ward = req.body.ward;
            let street = req.body.street;

            let personal_title_ref = req.body.personal_title_ref;
            let name_ref = req.body.name_ref;
            let phone_ref = req.body.phone_ref;

            let user = req.body.user;
            const personal = await new Personal({ name: name, sex: sex, phone: phone, birthday: birthday, citizenId: citizenId, issueDate: issueDate, city: city, district: district, ward: ward, street: street, personal_title_ref: personal_title_ref, name_ref: name_ref, phone_ref: phone_ref, user: user });
            const result = await personal.save();
            return res.status(200).json({
                data: result,
                status: true
            });
        }
        catch (err) {
            next(err);
        }
    },

    getInfomation: async (req, res, next) => {
        try {
            let personal = await Personal.findOne({ user: req.body.user });
            if (personal) {
                return res.status(200).json({
                    data: personal,
                    status: true
                });
            }
            else {
                return res.status(400).json({
                    message: "Can Not Find User",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    }

};

module.exports = PersonalController;
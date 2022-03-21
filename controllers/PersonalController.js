const Personal = require('../models/Personal');
const User = require('../models/User');
const { v4: uuid } = require('uuid');
const logEvents = require('../helpers/logEvents');
const bcrypt = require('bcrypt');

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

            if (req.body.pin) {
                let pin = req.body.pin;
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(pin, salt);
                const user = await new User({ phone: phone, pin: hashed });
                await user.save();
            }

            const personal = await new Personal({ name: name, sex: sex, phone: phone, birthday: birthday, citizenId: citizenId, issueDate: issueDate, city: city, district: district, ward: ward, street: street, personal_title_ref: personal_title_ref, name_ref: name_ref, phone_ref: phone_ref, user: user });
            // logEvents(`Id_Log: ${uuid()} --- Router: ${req.url} --- Method: ${req.method} --- Message: ${req.body.phone} had uploaded information customer successfully`, 'information_customer.log');
            const result = await personal.save();
            return res.status(201).json({
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
            let personal = await Personal.findOne({ user: req.params.id });
            if (personal) {
                return res.status(200).json({
                    data: personal,
                    status: true
                });
            }
            else {
                return res.status(401).json({
                    message: "This Personal Infomation is not exists",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    getAllBNPLInformation: async (req, res, next) => {
        try {
            let personal = await Personal.find();
            if (personal) {
                return res.status(200).json({
                    data: personal,
                    status: true
                });
            }
            else {
                return res.status(401).json({
                    message: "Data Personal is not exists",
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
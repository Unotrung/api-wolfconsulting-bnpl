const Personal = require('../models/bnpl_personals');
const Customer = require('../models/bnpl_customers');
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
                const customer = await new Customer({ phone: phone, pin: hashed });
                await customer.save();
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
            let personals = await Personal.find();
            if (personals.length > 0) {
                const totalItem = await Personal.countDocuments({});
                console.log("Total Item: ", totalItem);

                const PAGE_SIZE = req.query.pageSize;
                console.log("Page Size: ", PAGE_SIZE);

                const totalPage = Math.ceil(totalItem / PAGE_SIZE);
                console.log("Total Page: ", totalPage);

                let page = req.query.page || 1;
                if (page < 1) {
                    page = 1
                };
                if (page > totalPage) {
                    page = totalPage
                }

                page = parseInt(page);
                console.log("Current Page: ", page);

                let sortByField = req.query.sortByField;
                console.log("Sort By Field: ", sortByField);

                let sortValue = req.query.sortValue;
                sortValue = parseInt(sortValue);
                console.log("Sort Value: ", sortValue);

                var skipItem = (page - 1) * PAGE_SIZE;

                const sort = sortValue === 1 ? `${sortByField}` : `-${(sortByField)}`;

                const result = await Personal.find({}).skip(skipItem).limit(PAGE_SIZE).sort(sort);

                return res.status(200).json({
                    data: result,
                    totalItem: totalItem,
                    totalPage: totalPage,
                    currentPage: page,
                    sortByField: sortByField,
                    sortValue: sortValue,
                    status: true
                });
            }
            else {
                return res.status(401).json({
                    message: "List Personal Is Empty",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

};

module.exports = PersonalController;
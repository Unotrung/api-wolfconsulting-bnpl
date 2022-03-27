const Personal = require('../models/bnpl_personals');
const Customer = require('../models/bnpl_customers');
const Provider = require('../models/bnpl_providers');
const bcrypt = require('bcrypt');

const PersonalController = {

    addInfoPersonal: async (req, res, next) => {
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
            let userRef = "";

            if (req.body.pin) {
                let pin = req.body.pin;
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(pin, salt);
                const customer = await new Customer({ phone: phone, pin: hashed });
                await customer.save((err, data) => {
                    if (!err) {
                        const { pin, _id, ...others } = data._doc;
                        userRef = _id;
                        return res.status(201).json({
                            message: "Add Customer BNPL Successfully",
                            data: { ...others },
                            status: true
                        });
                    }
                    else {
                        return res.status(200).json({
                            message: "Add Customer BNPL Failure",
                            status: false
                        });
                    }
                });
            }

            const personal = await new Personal({ name: name, sex: sex, phone: phone, birthday: birthday, citizenId: citizenId, issueDate: issueDate, city: city, district: district, ward: ward, street: street, personal_title_ref: personal_title_ref, name_ref: name_ref, phone_ref: phone_ref, user: user || userRef, providers: [] });
            const result = await personal.save((err, data) => {
                if (!err) {
                    const { user, ...others } = data._doc;
                    return res.status(201).json({
                        message: "Add Personal BNPL Successfully",
                        data: { ...others },
                        status: true
                    });
                }
                else {
                    return res.status(200).json({
                        message: "Add Personal BNPL Failure",
                        status: false
                    });
                }
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
                    message: "This Personal Infomation is not exists !",
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

    addProvider: async (req, res, next) => {
        let provider = await Provider.findOne({ provider: req.body.provider });
        let validNid = await Personal.findOne({ citizenId: req.body.nid });
        if (req.body.provider !== null && req.body.nid !== null) {
            if (validNid) {
                await validNid.updateOne({ $push: { providers: provider.id } });
                return res.status(200).json({
                    message: "Add Provider Success",
                    status: true
                })
            }
            else {
                return res.status(400).json({
                    message: "Nid is not exists",
                    status: false
                })
            }
        }
    }

};

module.exports = PersonalController;
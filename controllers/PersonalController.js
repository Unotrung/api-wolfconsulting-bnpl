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

            let pin = req.body.pin;

            const personal = await new Personal({ name: name, sex: sex, phone: phone, birthday: birthday, citizenId: citizenId, issueDate: issueDate, city: city, district: district, ward: ward, street: street, personal_title_ref: personal_title_ref, name_ref: name_ref, phone_ref: phone_ref, user: user, providers: [], items: [], tenor: null });
            await personal.save((err, data) => {
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

            if (pin) {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(pin, salt);
                const customer = await new Customer({ phone: phone, pin: hashed });
                await customer.save((err, data) => {
                    if (!err) {
                        const { pin, ...others } = data._doc;
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

    getInfomation: async (req, res, next) => {
        try {
            let personal = await Personal.findOne({ phone: req.params.phone }).populate('providers').populate('items').populate('tenor');
            if (personal) {
                return res.status(200).json({
                    message: "Get information of personal successfully",
                    data: personal,
                    status: true
                });
            }
            else {
                return res.status(200).json({
                    message: "This Personal Infomation is not exists !",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    registerProvider: async (req, res, next) => {
        let provider = req.body.provider;
        let nid = req.body.nid;
        if (provider !== null && provider !== '' && nid !== null && nid !== '') {
            let validProvider = await Provider.findOne({ provider: provider });
            let validNid = await Personal.findOne({ citizenId: nid });
            if (validNid) {
                await validNid.updateOne({ $push: { providers: validProvider.id } }, (err, data) => {
                    if (!err) {
                        return res.status(200).json({
                            message: "Register Provider Successfully",
                            data: {
                                nid: nid,
                                provider: provider
                            },
                            status: true
                        })
                    }
                    else {
                        return res.status(200).json({
                            message: "Register Provider Failure",
                            status: false
                        })
                    }
                }).clone().catch((err) => {
                    return res.status(200).json({
                        err: err,
                        messsage: "Something wrong in register provider!",
                        status: false,
                    })
                });;

            }
            else {
                return res.status(200).json({
                    message: "This Nid is not exists !",
                    status: false
                })
            }
        }
        else {
            return res.status(200).json({
                message: "Please enter your nid and choose provider BNPL. Do not leave any fields blank !",
                status: false
            });
        }
    },

    deletePersonalandAccount: async (req, res, next) => {
        const phone = "0359349582";
        const nid = "030094009394";
        await Customer.findOneAndDelete({ phone: phone });
        await Personal.findOneAndDelete({ phone: phone, nid: nid });
        return res.status(200).json({
            message: "Delete Successfully",
            status: true
        })
    },

};

module.exports = PersonalController;
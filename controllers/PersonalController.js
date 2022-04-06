const Personal = require('../models/bnpl_personals');
const Customer = require('../models/bnpl_customers');
const Provider = require('../models/bnpl_providers');
const Tenor = require('../models/tenors');
const Item = require('../models/items');
const bcrypt = require('bcrypt');
const { buildProdLogger } = require('../helpers/logger');
const { v4: uuid } = require('uuid');

const PersonalController = {

    randomIndex: (arr) => {
        return Math.floor(Math.random() * arr.length);
    },

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

            let pin = req.body.pin;
            const customers = await Customer.find()
            const customerValid = customers.find(customer => customer.phone === phone)
            // const customerValid = await Customer.findOne({ phone: phone });
            console.log('save')
            if (pin) {
                if (!customerValid) {
                    const salt = await bcrypt.genSalt(10);
                    const hashed = await bcrypt.hash(pin.toString(), salt);
                    const customer = await new Customer({ phone: phone, pin: hashed });
                    await customer.save();
                    buildProdLogger('info', 'register_customer_success.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${phone}`);
                }
            }

            const items = await Item.find();

            const arrayItem = [];
            items.map((item) => { arrayItem.push(item._id) });

            const arrayCreditlimit = [10000000, 20000000, 30000000, 40000000];

            const personals = await Personal.find()
            const personalValid = personals.find(personal => personal.phone === phone && personal.citizenId === citizenId)
            // const personalValid = await Personal.findOne({ phone: phone, citizenId: citizenId });
            if (!personalValid) {
                const personal = await new Personal({
                    name: name, sex: sex, phone: phone, birthday: birthday, citizenId: citizenId, issueDate: issueDate, city: city, district: district, ward: ward, street: street, personal_title_ref: personal_title_ref, name_ref: name_ref, phone_ref: phone_ref, providers: [], items: [arrayItem[PersonalController.randomIndex(arrayItem)], arrayItem[PersonalController.randomIndex(arrayItem)]],
                    credit_limit: arrayCreditlimit[PersonalController.randomIndex(arrayCreditlimit)], tenor: null
                });
                console.log(personal)
                await personal.save((err, data) => {
                    if (!err) {
                        const { user, ...others } = data._doc;
                        buildProdLogger('info', 'add_personal_success.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${phone} --- Citizen Id: ${citizenId}`);
                        return res.status(201).json({
                            message: "Add personal BNPL successfully",
                            data: { ...others },
                            status: true
                        });
                    }
                    else {
                        buildProdLogger('error', 'add_personal_failure.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${phone} --- Citizen Id: ${citizenId}`);
                        return res.status(200).json({
                            message: "Add personal BNPL failure",
                            status: false,
                            ErrorStatus: err.status || 500,
                            ErrorMessage: err.message
                        });
                    }
                });
            }
            else {
                return res.status(200).json({
                    message: 'This personal is already exists !',
                    status: false
                })
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
                    message: "Get list BNPL user success",
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
                return res.status(200).json({
                    message: "List personal is empty",
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
                    message: "This personal infomation is not exists !",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    registerProvider: async (req, res, next) => {
        try {
            let provider = req.body.provider;
            let nid = req.body.nid;
            if (provider !== null && provider !== '' && nid !== null && nid !== '') {
                let validProvider = await Provider.findOne({ provider: provider });
                let validNid = await Personal.findOne({ citizenId: nid });
                if (validNid) {
                    await validNid.updateOne({ $push: { providers: validProvider.id } }).then((data, err) => {
                        if (!err) {
                            buildProdLogger('info', 'register_provider_successfully.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Nid: ${nid} --- Provider: ${provider}`);
                            return res.status(200).json({
                                message: "Register provider successfully",
                                data: {
                                    nid: nid,
                                    provider: provider
                                },
                                status: true
                            })
                        }
                        else {
                            buildProdLogger('error', 'register_provider_failure.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Nid: ${nid} --- Provider: ${provider}`);
                            return res.status(200).json({
                                message: "Register provider failure",
                                status: false,
                                ErrorStatus: err.status || 500,
                                ErrorMessage: err.message
                            })
                        }
                    })
                }
                else {
                    return res.status(200).json({
                        message: "This nid is not exists !",
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
        }
        catch (err) {
            next(err);
        }
    },

    updateTenor: async (req, res, next) => {
        try {
            let tenorId = req.body.id;
            let phone = req.body.phone;
            if (tenorId !== null && tenorId !== '' && phone !== null && phone !== '') {
                let tenor = await Tenor.findById(tenorId);
                let validPhone = await Personal.findOne({ phone: phone });
                if (validPhone) {
                    if (tenor) {
                        await validPhone.updateOne({ $set: { tenor: tenor._id } }).then((data, err) => {
                            if (!err) {
                                buildProdLogger('info', 'update_tenor_successfully.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${phone} --- Tenor Id: ${tenorId}`);
                                return res.status(201).json({
                                    message: "Update tenor successfully",
                                    data: {
                                        tenor: tenorId,
                                        phone: phone
                                    },
                                    status: true
                                })
                            }
                            else {
                                buildProdLogger('error', 'update_tenor_failure.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${phone} --- Tenor Id: ${tenorId}`);
                                return res.status(200).json({
                                    message: "Update tenor failure",
                                    status: false,
                                    ErrorStatus: err.status || 500,
                                    ErrorMessage: err.message
                                })
                            }
                        })
                    }
                    else {
                        return res.status(200).json({
                            message: "This tenor is not exists !",
                            status: false
                        });
                    }
                }
                else {
                    return res.status(200).json({
                        message: "This phone number is not exists !",
                        status: false
                    });
                }
            }
            else {
                return res.status(200).json({
                    message: "Please enter your phone and choose tenor. Do not leave any fields blank !",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    deletePersonalandAccount: async (req, res, next) => {
        const phone = "0359349582";
        const nid = "030094009394";
        await Customer.findOneAndDelete({ phone: phone });
        await Personal.findOneAndDelete({ citizenId: nid });
        return res.status(200).json({
            message: "Delete Successfully",
            status: true
        })
    },

    deletePersonalandAccountPhu: async (req, res, next) => {
        const phone = req.body.phone;
        const nid = req.body.nid;
        await Customer.findOneAndDelete({ phone: phone });
        await Personal.findOneAndDelete({ citizenId: nid });
        return res.status(200).json({
            message: "Delete Successfully",
            status: true
        })
    },

};

module.exports = PersonalController;

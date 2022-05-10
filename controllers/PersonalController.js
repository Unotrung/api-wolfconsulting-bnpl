const Personal = require('../models/bnpl_personals');
const Customer = require('../models/bnpl_customers');
const Provider = require('../models/bnpl_providers');
const Blacklists = require('../models/bnpl_blacklists');
const Tenor = require('../models/tenors');
const Item = require('../models/items');
const bcrypt = require('bcrypt');
const { buildProdLogger } = require('../helpers/logger');
const { v4: uuid } = require('uuid');

const PersonalController = {

    randomIndex: (arr) => {
        return Math.floor(Math.random() * arr.length);
    },

    addInfo: (name, sex, birthday, phone, citizenId, issueDate, city, district, ward, street, personal_title_ref, name_ref, phone_ref, pin) => {
        return async (req, res) => {
            const customers = await Customer.find();
            const personals = await Personal.find();

            let customerExists = customers.find(x => x.phone === phone);
            if (!customerExists) {
                let salt = await bcrypt.genSalt(10);
                let hashed = await bcrypt.hash(pin, salt);
                let customer = await new Customer({ phone: phone, pin: hashed });
                await customer.save();
                buildProdLogger('info', 'register_customer_success.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${phone}`);
            }

            let items = await Item.find({});
            let arrayItem = [];
            items.map((item) => { arrayItem.push(item) });

            let arrayCreditlimit = [500000, 1000000, 2000000, 3000000];

            let personalExists = personals.find(x => x.phone === phone || x.citizenId === citizenId);
            if (!personalExists) {
                let personal = await new Personal({
                    name: name, sex: sex, phone: phone, birthday: birthday, citizenId: citizenId, issueDate: issueDate, city: city, district: district, ward: ward, street: street, personal_title_ref: personal_title_ref, name_ref: name_ref, phone_ref: phone_ref, providers: [], items: [arrayItem[PersonalController.randomIndex(items)], arrayItem[PersonalController.randomIndex(items)]],
                    credit_limit: arrayCreditlimit[PersonalController.randomIndex(arrayCreditlimit)], tenor: null
                });
                await personal.save()
                    .then(async (data, err) => {
                        if (!err) {
                            let { ...others } = data._doc;
                            buildProdLogger('info', 'add_personal_success.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${phone} --- Citizen Id: ${citizenId}`);
                            let customerList = await Customer.find();
                            let customerAccount = customerList.find(x => x.phone === phone);
                            customerAccount.step = 2;
                            await customerAccount.save()
                                .then((data, err) => {
                                    if (!err) {
                                        return res.status(201).json({
                                            message: "Add personal BNPL successfully",
                                            data: { ...others },
                                            status: true
                                        });
                                    }
                                    else {
                                        buildProdLogger('error', 'add_personal_failure.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Phone: ${phone} --- Citizen Id: ${citizenId}`);
                                        return res.status(409).json({
                                            message: "Add personal BNPL failure",
                                            status: false,
                                            errorStatus: err.status || 500,
                                            errorMessage: err.message
                                        });
                                    }
                                });
                        }
                    });
            }
            else {
                return res.status(409).json({
                    message: 'This personal is already exists !',
                    status: false,
                    statusCode: 1000
                })
            }
        }
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

            const blacklists = await Blacklists.find();
            const isExists = blacklists.find(x => x.phone === phone);

            if (isExists) {
                if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                    return res.status(403).json({ message: "Your phone is blocked. Please wait 24 hours to try again !", status: false, statusCode: 1004 });
                }
                else if (isExists.lockUntil && isExists.lockUntil < Date.now()) {
                    await Blacklists.deleteMany({ phone: phone });
                    await PersonalController.addInfo(name, sex, birthday, phone, citizenId, issueDate, city, district, ward, street, personal_title_ref, name_ref, phone_ref, pin)(req, res);
                }
            }
            else {
                if (phone === phone_ref) {
                    return res.status(400).json({
                        message: "The phone number and the reference phone number are not allowed to overlap",
                        status: false,
                        statusCode: 4000
                    });
                }
                else {
                    await PersonalController.addInfo(name, sex, birthday, phone, citizenId, issueDate, city, district, ward, street, personal_title_ref, name_ref, phone_ref, pin)(req, res);
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    getAllBNPLInformation: async (req, res, next) => {
        try {
            const personals = await Personal.find();
            if (personals.length > 0) {
                const totalItem = personals.length;
                const PAGE_SIZE = req.query.pageSize;
                const totalPage = Math.ceil(totalItem / PAGE_SIZE);
                let page = req.query.page || 1;
                if (page < 1) {
                    page = 1
                };
                if (page > totalPage) {
                    page = totalPage
                }
                page = parseInt(page);
                let sortByField = req.query.sortByField;
                let sortValue = req.query.sortValue;
                sortValue = parseInt(sortValue);
                var skipItem = (page - 1) * PAGE_SIZE;
                const sort = sortValue === 1 ? `${sortByField}` : `-${(sortByField)}`;
                const result = await Personal.find({}).skip(skipItem).limit(PAGE_SIZE).sort(sort);
                let arrPersonals = [];
                result.map((user, index) => {
                    let { pin, __v, ...others } = user._doc;
                    arrPersonals.push({ ...others });
                })
                return res.status(200).json({
                    message: "Get list BNPL user success",
                    data: arrPersonals,
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
                    status: true
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    getInfomation: async (req, res, next) => {
        try {
            let phone = req.params.phone;
            let personals = await Personal.find().populate('providers').populate('items').populate('tenor');
            let personal = personals.find(x => x.phone === phone);
            if (personal) {
                const { __v, ...others } = personal._doc;
                return res.status(200).json({
                    message: "Get information of personal successfully",
                    data: { ...others },
                    status: true
                });
            }
            else {
                return res.status(404).json({
                    message: "This personal infomation is not exists !",
                    status: false,
                    statusCode: 900
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
                let nids = await Personal.find();
                let validNid = nids.find(x => x.citizenId === nid);
                if (validNid) {
                    await validNid.updateOne({ $push: { providers: validProvider.id } })
                        .then((data, err) => {
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
                                return res.status(409).json({
                                    message: "Register provider failure",
                                    status: false,
                                    errorStatus: err.status || 500,
                                    errorMessage: err.message
                                })
                            }
                        })
                }
                else {
                    return res.status(404).json({
                        message: "This nid is not exists !",
                        status: false,
                        statusCode: 900
                    })
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your nid and choose provider BNPL. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
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
                let phones = await Personal.find();
                let validPhone = phones.find(x => x.phone === phone);
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
                                return res.status(409).json({
                                    message: "Update tenor failure",
                                    status: false,
                                    errorStatus: err.status || 500,
                                    errorMessage: err.message
                                })
                            }
                        })
                    }
                    else {
                        return res.status(404).json({
                            message: "This tenor is not exists !",
                            status: false,
                            statusCode: 900
                        });
                    }
                }
                else {
                    return res.status(404).json({
                        message: "This phone number is not exists !",
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your phone and choose tenor. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    // getDataFromVoolo: async (req, res, next) => {
    //     try {
    //         let phone = req.body.phone;
    //         if (phone !== null && phone !== '') {
    //             let personals = await Personal.find();
    //             let personal = personals.find(x => x.phone === phone);
    //             if (personal) {
    //                 const { __v, providers, items, ...others } = personal._doc;
    //                 return res.status(200).json({
    //                     message: "Get information of personal successfully",
    //                     data: { ...others },
    //                     status: true
    //                 });
    //             }
    //             else {
    //                 return res.status(404).json({
    //                     message: "This personal infomation is not exists !",
    //                     status: false,
    //                     statusCode: 900
    //                 });
    //             }
    //         }
    //         else {
    //             return res.status(400).json({
    //                 message: "Please enter your phone. Do not leave any fields blank !",
    //                 status: false,
    //                 statusCode: 1005
    //             });
    //         }
    //     }
    //     catch (err) {
    //         next(err);
    //     }
    // },

    // signContract: async (req, res, next) => {
    //     try {
    //         let phone = req.body.phone;
    //         let status = Boolean(req.body.status);
    //         if (phone !== null && phone !== '' && status !== null && status !== '') {
    //             let personals = await Personal.find();
    //             let personal = personals.find(x => x.phone === phone);
    //             if (personal) {
    //                 await personal.updateOne({ $set: { status: status } })
    //                     .then((data) => {
    //                         if (status === true) {
    //                             return res.status(201).json({
    //                                 message: "Your contract has been accepted",
    //                                 status: true
    //                             })
    //                         }
    //                         else if (status === false) {
    //                             return res.status(201).json({
    //                                 message: "Your contract is not accepted",
    //                                 status: true
    //                             })
    //                         }
    //                     })
    //                     .catch((err) => {
    //                         return res.status(409).json({
    //                             message: "There was an error in the contract approval process",
    //                             status: false,
    //                             errorStatus: err.status || 500,
    //                             errorMessage: err.message,
    //                         })
    //                     })
    //             }
    //             else {
    //                 return res.status(404).json({
    //                     message: "This personal infomation is not exists !",
    //                     status: false,
    //                     statusCode: 900
    //                 });
    //             }
    //         }
    //         else {
    //             return res.status(400).json({
    //                 message: "Please enter your phone and status. Do not leave any fields blank !",
    //                 status: false,
    //                 statusCode: 1005
    //             });
    //         }
    //     }
    //     catch (err) {
    //         next(err);
    //     }
    // },

};

module.exports = PersonalController;
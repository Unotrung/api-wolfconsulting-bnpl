const Personal = require('../models/bnpl_personals');
const Customer = require('../models/bnpl_customers');
const Provider = require('../models/bnpl_providers');
const Blacklists = require('../models/bnpl_blacklists');
const Tenor = require('../models/tenors');
const Item = require('../models/items');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { buildProdLogger } = require('../helpers/logger');
const { v4: uuid } = require('uuid');
const { MSG_GET_LIST_SUCCESS, MSG_LIST_IS_EMPTY, MSG_ADD_SUCCESSFULLY, MSG_ADD_FAILURE, MSG_PERSONAL_IS_EXISTS,
    MSG_PHONE_IS_BLOCKED, MSG_PHONE_REF_PHONE_IS_SAME, MSG_GET_DETAIL_SUCCESS, MSG_PERSONAL_IS_NOT_EXISTS, MSG_ENTER_ALL_FIELDS,
    MSG_UPDATE_SUCCESSFULLY, MSG_UPDATE_FAILURE, MSG_TENOR_IS_NOT_EXISTS, MSG_PHONE_IS_NOT_EXISTS_IN_EAP, MSG_PHONE_IS_NOT_EXISTS_IN_BNPL,
    MSG_PHONE_IS_EXISTS, MSG_PHONE_IS_NOT_EXISTS, MSG_VERIFY_OTP_FAILURE_5_TIMES, MSG_LOGIN_FAILURE_5_TIMES, MSG_NID_IS_EXISTS, MSG_NID_IS_NOT_EXISTS,
    MSG_NID_AND_PHONE_IS_EXISTS, MSG_NID_AND_PHONE_IS_NOT_EXISTS, MSG_OLD_NEW_PASSWORD_IS_SAME, MSG_OLD_PIN_IS_NOT_CORRECT,
    MSG_PHONE_IS_BLOCKED_BY_ADMIN, MSG_LOGIN_SUCCESSFULLY, MSG_LOGIN_FAILURE, MSG_WRONG_PHONE, MSG_WRONG_PIN, MSG_SEND_OTP_SUCCESSFULLY,
    MSG_SEND_OTP_FAILURE, MSG_OTP_EXPIRED, MSG_OTP_VALID, MSG_OTP_INVALID, MSG_WRONG_NID, MSG_PHONE_PHONE_REF_IS_SAME } = require('../config/response/response');

const PersonalController = {

    randomIndex: (arr) => {
        return Math.floor(Math.random() * arr.length);
    },

    addInfo: (name, sex, birthday, phone, citizenId, issueDate, expirationDate, city, district, ward, street, temporaryCity, temporaryDistrict, temporaryWard, temporaryStreet, personal_title_ref, name_ref, phone_ref, pin, nid_front_image, nid_back_image, selfie_image) => {
        return async (req, res, next) => {
            const customers = await Customer.find();
            const personals = await Personal.find();

            let items = await Item.find({});
            let arrayItem = [];
            items.map((item) => { arrayItem.push(item) });
            let arrayCreditlimit = [500000, 1000000, 2000000, 3000000];

            let personalExists = personals.find(x => x.phone === phone || x.citizenId === citizenId);
            if (!personalExists) {
                let personal = await new Personal({
                    name: name, sex: sex, phone: phone, birthday: birthday, citizenId: citizenId, issueDate: issueDate, expirationDate: expirationDate, city: city, district: district, ward: ward, street: street,
                    temporaryCity: temporaryCity, temporaryDistrict: temporaryDistrict, temporaryWard: temporaryWard, temporaryStreet: temporaryStreet,
                    personal_title_ref: personal_title_ref, name_ref: name_ref, phone_ref: phone_ref, providers: [], items: [arrayItem[PersonalController.randomIndex(items)], arrayItem[PersonalController.randomIndex(items)]],
                    credit_limit: arrayCreditlimit[PersonalController.randomIndex(arrayCreditlimit)], consumed_limit: arrayCreditlimit[PersonalController.randomIndex(arrayCreditlimit)], approve_limit: arrayCreditlimit[PersonalController.randomIndex(arrayCreditlimit)], memo_debit: arrayCreditlimit[PersonalController.randomIndex(arrayCreditlimit)],
                    tenor: null, memo_credit: arrayCreditlimit[PersonalController.randomIndex(arrayCreditlimit)], nid_front_image: nid_front_image, nid_back_image: nid_back_image, selfie_image: selfie_image
                });
                await personal.save()
            }

            let customerExists = customers.find(x => x.phone === phone);
            if (!customerExists) {
                let salt = await bcrypt.genSalt(10);
                let hashed = await bcrypt.hash(pin, salt);
                let customer = await new Customer({ phone: phone, pin: hashed, step: 2 });
                await customer.save()
                    .then(async (data, err) => {
                        if (!err) {
                            let { pin, ...others } = data._doc;
                            if (!err) {
                                return res.status(201).json({
                                    message: MSG_ADD_SUCCESSFULLY,
                                    data: { ...others },
                                    status: true,
                                    linkRegisterEap: `https://www.eap.voolo.vn/register-from-bnpl/${name}/${phone}`
                                });
                            }
                            else {
                                return res.status(409).json({
                                    message: MSG_ADD_FAILURE,
                                    status: false,
                                    errorStatus: err.status || 500,
                                    errorMessage: err.message
                                });
                            }
                        }
                    });
            }
            else {
                return res.status(409).json({
                    message: MSG_PERSONAL_IS_EXISTS,
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
            let expirationDate = req.body.expirationDate;

            let city = req.body.city;
            let district = req.body.district;
            let ward = req.body.ward;
            let street = req.body.street;

            let temporaryCity = req.body.temporaryCity;
            let temporaryDistrict = req.body.temporaryDistrict;
            let temporaryWard = req.body.temporaryWard;
            let temporaryStreet = req.body.temporaryStreet;

            let personal_title_ref = req.body.personal_title_ref;
            let name_ref = req.body.name_ref;
            let phone_ref = req.body.phone_ref;

            let pin = req.body.pin;

            let nid_front_image = req.body.nid_front_image;
            let nid_back_image = req.body.nid_back_image;
            let selfie_image = req.body.selfie_image;

            // let files = req.files;

            // let imageArr = [];

            // if (req.fileValidationError) {
            //     return res.json({ message: req.fileValidationError, status: false });
            // }
            // else if (!files) {
            //     return res.json({ message: 'Please select an image to upload', status: false });
            // }
            // else {
            //     let imgArray = files.map((file) => {
            //         let img = fs.readFileSync(file.path);
            //         return encode_image = img.toString('base64');
            //     })
            //     imgArray.map((src, index) => {
            //         // Create object to store data in the collection
            //         let finalImg = {
            //             filename: files[index].originalname,
            //             contentType: files[index].mimetype,
            //             imageBase64: src,
            //         }
            //         imageArr.push(finalImg);
            //     });
            // }

            const blacklists = await Blacklists.find();
            const isExists = blacklists.find(x => x.phone === phone);
            if (isExists) {
                if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                    return res.status(403).json({ message: MSG_PHONE_IS_BLOCKED, status: false, statusCode: 1004 });
                }
                else if ((isExists.lockUntil && isExists.lockUntil < Date.now()) || (isExists.attempts > 0 && isExists.attempts < 5)) {
                    await Blacklists.deleteMany({ phone: phone });
                    await PersonalController.addInfo(name, sex, birthday, phone, citizenId, issueDate, expirationDate, city, district, ward, street, temporaryCity, temporaryDistrict, temporaryWard, temporaryStreet, personal_title_ref, name_ref, phone_ref, pin, nid_front_image, nid_back_image, selfie_image)(req, res);
                }
            }
            else {
                if (phone === phone_ref) {
                    return res.status(400).json({
                        message: MSG_PHONE_PHONE_REF_IS_SAME,
                        status: false,
                        statusCode: 4000
                    });
                }
                else {
                    await PersonalController.addInfo(name, sex, birthday, phone, citizenId, issueDate, expirationDate, city, district, ward, street, temporaryCity, temporaryDistrict, temporaryWard, temporaryStreet, personal_title_ref, name_ref, phone_ref, pin, nid_front_image, nid_back_image, selfie_image)(req, res);
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
                    message: MSG_GET_LIST_SUCCESS,
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
                    message: MSG_LIST_IS_EMPTY,
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
                    message: MSG_GET_DETAIL_SUCCESS,
                    data: { ...others },
                    status: true
                });
            }
            else {
                return res.status(404).json({
                    message: MSG_PERSONAL_IS_NOT_EXISTS,
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
                                    message: MSG_ADD_SUCCESSFULLY,
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
                                    message: MSG_ADD_FAILURE,
                                    status: false,
                                    errorStatus: err.status || 500,
                                    errorMessage: err.message
                                })
                            }
                        })
                }
                else {
                    return res.status(404).json({
                        message: MSG_PERSONAL_IS_NOT_EXISTS,
                        status: false,
                        statusCode: 900
                    })
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
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
                                    message: MSG_UPDATE_SUCCESSFULLY,
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
                                    message: MSG_UPDATE_FAILURE,
                                    status: false,
                                    errorStatus: err.status || 500,
                                    errorMessage: err.message
                                })
                            }
                        })
                    }
                    else {
                        return res.status(404).json({
                            message: MSG_TENOR_IS_NOT_EXISTS,
                            status: false,
                            statusCode: 900
                        });
                    }
                }
                else {
                    return res.status(404).json({
                        message: MSG_PERSONAL_IS_NOT_EXISTS,
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
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
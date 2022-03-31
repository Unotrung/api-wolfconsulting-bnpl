const fetch = require('node-fetch');
const dotenv = require('dotenv');
const Tenor = require('../models/tenors');
const Personal = require('../models/bnpl_personals');
const Customer = require('../models/bnpl_customers');

dotenv.config();

const CommonController = {

    getHVToken: async (req, res, next) => {
        try {
            const url = "https://auth.hyperverge.co/login";
            const options = {
                method: "POST",
                body: JSON.stringify({
                    appId: process.env.appId,
                    appKey: process.env.appKey,
                    expiry: 900
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            };
            const response = await fetch(url, options);
            const data = await response.json();
            if (data !== null) {
                return res.json({
                    token: data.result.token,
                    status: true
                })
            }
            else {
                return res.json({
                    message: "Fail To Get API",
                    status: false,
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    getAllTenor: async (req, res, next) => {
        try {
            const tenors = await Tenor.find();
            if (tenors.length > 0) {
                return res.status(200).json({
                    count: tenors.length,
                    data: tenors,
                    message: "Get List Tenor Success",
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: "List Tenor Is Empty",
                    status: false
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    // eSignContract: async (req, res, next) => {
    //     try {
    //         let phone = req.body.phone;
    //         if (phone !== null && phone !== '') {
    //             await Personal.updateOne({ phone: phone }, { $set: { step: 2 } }).then((data, err) => {
    //                 if (!err) {
    //                     return res.status(201).json({
    //                         message: `Update Step Successfully For Phone ${phone}`,
    //                         status: true
    //                     })
    //                 }
    //                 else {
    //                     return res.status(201).json({
    //                         message: `Update Step Failure For Phone ${phone}`,
    //                         status: false
    //                     })
    //                 }
    //             });
    //         }
    //         else {
    //             return res.status(200).json({
    //                 message: 'Please Enter Your Phone. Do not leave any field blank !',
    //                 status: false
    //             })
    //         }
    //     }
    //     catch (err) {
    //         next(err);
    //     }
    // },

    // completeSuccess: async (req, res, next) => {
    //     try {
    //         let phone = req.body.phone;
    //         if (phone !== null && phone !== '') {
    //             await Personal.updateOne({ phone: phone }, { $set: { step: 3 } }).then((data, err) => {
    //                 if (!err) {
    //                     return res.status(201).json({
    //                         message: 'Successfully. Done 100%',
    //                         status: true
    //                     })
    //                 }
    //                 else {
    //                     return res.status(201).json({
    //                         message: 'Failure. Try Again',
    //                         status: false
    //                     })
    //                 }
    //             });
    //         }
    //         else {
    //             return res.status(200).json({
    //                 message: 'Please Enter Your Phone. Do not leave any field blank !',
    //                 status: false
    //             })
    //         }
    //     }
    //     catch (err) {
    //         next(err);
    //     }
    // },

    updateStep: async (req, res, next) => {
        try {
            let phone = req.body.phone;
            let step = req.body.step;
            if (phone !== null && phone !== '') {
                if (step === 'not_exist') {
                    await Customer.updateOne({ phone: phone }, { $set: { step: 'not_exist' } }).then((data, err) => {
                        if (!err) {
                            return res.status(201).json({
                                message: `Update Step Successfully For Phone ${phone}`,
                                step: data.step,
                                status: true
                            })
                        }
                        else {
                            return res.status(201).json({
                                message: `Update Step Failure For Phone ${phone}`,
                                status: false
                            })
                        }
                    });
                }
                else if (step === 'register_success') {
                    await Customer.updateOne({ phone: phone }, { $set: { step: 'register_success' } }).then((data, err) => {
                        if (!err) {
                            return res.status(201).json({
                                message: `Update Step Successfully For Phone ${phone}`,
                                step: data.step,
                                status: true
                            })
                        }
                        else {
                            return res.status(201).json({
                                message: `Update Step Failure For Phone ${phone}`,
                                status: false
                            })
                        }
                    });
                }
                else if (step === 'kyc_process') {
                    await Customer.updateOne({ phone: phone }, { $set: { step: 'kyc_process' } }).then((data, err) => {
                        if (!err) {
                            return res.status(201).json({
                                message: `Update Step Successfully For Phone ${phone}`,
                                step: data.step,
                                status: true
                            })
                        }
                        else {
                            return res.status(201).json({
                                message: `Update Step Failure For Phone ${phone}`,
                                status: false
                            })
                        }
                    });
                }
                else if (step === 'kyc_completed') {
                    await Customer.updateOne({ phone: phone }, { $set: { step: 'kyc_completed' } }).then((data, err) => {
                        if (!err) {
                            return res.status(201).json({
                                message: `Update Step Successfully For Phone ${phone}`,
                                step: data.step,
                                status: true
                            })
                        }
                        else {
                            return res.status(201).json({
                                message: `Update Step Failure For Phone ${phone}`,
                                status: false
                            })
                        }
                    });
                }
                else if (step === 'kyc_failure') {
                    await Customer.updateOne({ phone: phone }, { $set: { step: 'kyc_failure' } }).then((data, err) => {
                        if (!err) {
                            return res.status(201).json({
                                message: `Update Step Successfully For Phone ${phone}`,
                                step: data.step,
                                status: true
                            })
                        }
                        else {
                            return res.status(201).json({
                                message: `Update Step Failure For Phone ${phone}`,
                                status: false
                            })
                        }
                    });
                }
                else {
                    return res.status(200).json({
                        message: 'Step is not valid',
                        status: false
                    })
                }
            }
            else {
                return res.status(200).json({
                    message: 'Please Enter Your Phone. Do not leave any field blank !',
                    status: false
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

};

module.exports = CommonController;
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
                    message: "Fail to get api",
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
                    message: "Get list tenor success",
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: "List tenor is empty",
                    status: false
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    updateStep: async (req, res, next) => {
        try {
            let phone = req.body.phone;
            let step = req.body.process;
            if (phone !== null && phone !== '' && step !== null && step !== '') {
                if (step === 0) {
                    await Customer.updateOne({ phone: phone }, { $set: { step: 0 } }).then((data, err) => {
                        if (!err) {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone}`,
                                step: data.step,
                                status: true
                            })
                        }
                        else {
                            return res.status(200).json({
                                message: `Update step failure for phone ${phone}`,
                                status: false,
                                ErrorStatus: err.status || 500,
                                ErrorMessage: err.message
                            })
                        }
                    });
                }
                else if (step === 1) {
                    await Customer.updateOne({ phone: phone }, { $set: { step: 1 } }).then((data, err) => {
                        if (!err) {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone}`,
                                step: data.step,
                                status: true
                            })
                        }
                        else {
                            return res.status(200).json({
                                message: `Update step failure for phone ${phone}`,
                                status: false,
                                ErrorStatus: err.status || 500,
                                ErrorMessage: err.message
                            })
                        }
                    });
                }
                else if (step === 2) {
                    await Customer.updateOne({ phone: phone }, { $set: { step: 2 } }).then((data, err) => {
                        if (!err) {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone}`,
                                step: data.step,
                                status: true
                            })
                        }
                        else {
                            return res.status(200).json({
                                message: `Update step failure for phone ${phone}`,
                                status: false,
                                ErrorStatus: err.status || 500,
                                ErrorMessage: err.message
                            })
                        }
                    });
                }
                else if (step === 3) {
                    await Customer.updateOne({ phone: phone }, { $set: { step: 3 } }).then((data, err) => {
                        if (!err) {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone}`,
                                step: data.step,
                                status: true
                            })
                        }
                        else {
                            return res.status(200).json({
                                message: `Update step failure for phone ${phone}`,
                                status: false,
                                ErrorStatus: err.status || 500,
                                ErrorMessage: err.message
                            })
                        }
                    });
                }
                else if (step === 4) {
                    await Customer.updateOne({ phone: phone }, { $set: { step: 4 } }).then((data, err) => {
                        if (!err) {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone}`,
                                step: data.step,
                                status: true
                            })
                        }
                        else {
                            return res.status(200).json({
                                message: `Update step failure for phone ${phone}`,
                                status: false,
                                ErrorStatus: err.status || 500,
                                ErrorMessage: err.message
                            })
                        }
                    });
                }
                else {
                    return res.status(200).json({
                        message: 'Step is not valid',
                        status: false,
                    })
                }
            }
            else {
                return res.status(200).json({
                    message: 'Please enter your phone and step. Do not leave any field blank !',
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
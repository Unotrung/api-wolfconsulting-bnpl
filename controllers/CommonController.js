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
                return res.status(200).json({
                    token: data.result.token,
                    status: true
                })
            }
            else {
                return res.status(400).json({
                    message: "Fail to get api",
                    status: false,
                    statusCode: 5000
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    getAllTenor: async (req, res, next) => {
        try {
            const tenors = await Tenor.find().select("_id convertFee paymentSchedule createdAt updatedAt");
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
                const customers = await Customer.find();
                const customer = customers.find(x => x.phone === phone);
                if (step === 0) {
                    customer.step = 0
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone} (Kyc failure)`,
                                step: data.step,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: `Update step failure for phone ${phone} (Kyc failure)`,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else if (step === 1) {
                    customer.step = 1
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone} (Not exists)`,
                                step: data.step,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: `Update step failure for phone ${phone} (Not exists)`,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else if (step === 2) {
                    customer.step = 2
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone} (Registered success)`,
                                step: data.step,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: `Update step failure for phone ${phone} (Registered fail)`,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else if (step === 3) {
                    customer.step = 3
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone} (Kyc process)`,
                                step: data.step,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: `Update step failure for phone ${phone} (Kyc process)`,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else if (step === 4) {
                    customer.step = 4
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: `Update step successfully for phone ${phone} (Kyc completed)`,
                                step: data.step,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: `Update step failure for phone ${phone} (Kyc completed)`,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else {
                    return res.status(400).json({
                        message: 'Step is not valid',
                        status: false,
                        statusCode: 4000
                    })
                }
            }
            else {
                return res.status(400).json({
                    message: 'Please enter your phone and step. Do not leave any field blank !',
                    status: false,
                    statusCode: 1005
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

};

module.exports = CommonController;